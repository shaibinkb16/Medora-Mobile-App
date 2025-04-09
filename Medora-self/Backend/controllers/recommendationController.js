const axios = require("axios");
const OCRResult = require("../models/OCRResult");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Robust blood pressure classifier
const getBPCategory = (bp) => {
  try {
    if (!bp) return '';
    
    const bpString = String(bp).trim();
    if (!/\d+\s*\/\s*\d+/.test(bpString)) return '';
    
    const [systolic, diastolic] = bpString.split('/')
      .map(part => parseInt(part.replace(/\D/g, ''), 10))
      .filter(n => !isNaN(n));

    if (systolic < 90 || diastolic < 60) return 'Low';
    if (systolic < 120 && diastolic < 80) return 'Normal';
    if (systolic < 130 && diastolic < 80) return 'Elevated';
    if (systolic >= 130 || diastolic >= 80) return 'High';
    
    return '';
  } catch (error) {
    console.error('BP classification error:', error.message);
    return '';
  }
};

// Validation helper
const validateRecommendations = (recommendations) => {
  const validCategories = ["Diet", "Exercise", "Lifestyle", "Monitoring", "Medical"];
  const errors = [];

  if (!Array.isArray(recommendations)) {
    throw new Error("Recommendations must be an array");
  }

  recommendations.forEach((item, index) => {
    if (!validCategories.includes(item.category)) {
      errors.push(`Item ${index + 1}: Invalid category '${item.category}'`);
    }
    if (!item.title || item.title.split(/\s+/).length > 6) {
      errors.push(`Item ${index + 1}: Title should be ≤6 words`);
    }
    if (!item.recommendation || item.recommendation.length > 250) {
      errors.push(`Item ${index + 1}: Recommendation too long`);
    }
    if (!["High", "Medium", "Low"].includes(item.priority)) {
      errors.push(`Item ${index + 1}: Invalid priority '${item.priority}'`);
    }
  });

  if (errors.length > 0) {
    throw new Error(`Validation failed:\n${errors.join("\n")}`);
  }
  return true;
};

exports.getAIRecommendations = async (req, res) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ error: "Unauthorized access" });
    }

    const latestOCRData = await OCRResult.findOne({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .lean();

    if (!latestOCRData?.extractedMetrics) {
      return res.status(404).json({ error: "No health data available" });
    }

    const { 
      bloodSugar = null, 
      bloodPressure = null, 
      cholesterol = null 
    } = latestOCRData.extractedMetrics;

    const formatMetric = (value, unit, classifier) => {
      if (!value) return "N/A";
      const classification = classifier(value);
      return `${value} ${unit}${classification ? ` (${classification})` : ''}`;
    };

    const prompt = `
      HEALTH ANALYSIS REQUEST
      Patient: ${req.user.name || "Anonymous"}
      Metrics:
      - Blood Sugar: ${formatMetric(bloodSugar, 'mg/dL', v => v < 100 ? 'Normal' : 'Elevated')}
      - Blood Pressure: ${formatMetric(bloodPressure, 'mmHg', getBPCategory)}
      - Cholesterol: ${formatMetric(cholesterol, 'mg/dL', v => v < 200 ? 'Ideal' : 'High')}

      REQUIREMENTS:
      1. Generate 5 recommendations across: Diet, Exercise, Lifestyle, Monitoring, Medical
      2. Each must contain:
         - category: Exact category name
         - title: 3-6 word heading
         - recommendation: Specific, actionable advice
         - priority: High/Medium/Low
         - rationale: Brief scientific basis (≤60 chars)
      3. Use concrete numbers/durations
      4. Format: Strict JSON array without markdown

      EXAMPLE:
      ${JSON.stringify([
        {
          category: "Diet",
          title: "Increase Fiber Intake",
          recommendation: "Consume 25-30g daily fiber from oats, berries, and legumes",
          priority: "High",
          rationale: "Improves glucose metabolism"
        }
      ], null, 2)}

      Return ONLY valid JSON following these rules.
    `;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1200,
          responseMimeType: "application/json",
          topK: 50,
          topP: 0.9
        }
      },
      {
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        timeout: 25000
      }
    );

    const aiContent = response.data?.candidates?.[0]?.content;
    if (!aiContent?.parts?.[0]?.text) {
      throw new Error("Invalid API response structure");
    }

    const rawResponse = aiContent.parts[0].text;
    const cleanedResponse = rawResponse
      .replace(/(```json|```|^JSON\s*)/gi, '')
      .trim();

    let recommendations;
    try {
      recommendations = JSON.parse(cleanedResponse);
    } catch (error) {
      console.error("Parse Error:", error.message);
      throw new Error("Invalid AI response format");
    }

    try {
      validateRecommendations(recommendations);
    } catch (validationError) {
      console.error("Validation Error:", validationError.message);
      throw new Error(`Recommendation validation failed: ${validationError.message}`);
    }

    res.json({
      success: true,
      recommendations,
      metrics: {
        bloodSugar: { value: bloodSugar, unit: "mg/dL" },
        bloodPressure: { value: bloodPressure, unit: "mmHg" },
        cholesterol: { value: cholesterol, unit: "mg/dL" }
      },
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error("Recommendation Error:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to generate recommendations",
      details: error.message,
      ...(process.env.NODE_ENV === "development" && {
        stack: error.stack,
        ...(error.response?.data && { apiError: error.response.data })
      })
    });
  }
};