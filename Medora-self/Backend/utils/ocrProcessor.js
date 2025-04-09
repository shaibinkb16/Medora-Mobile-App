const Tesseract = require("tesseract.js");
const pdfParse = require("pdf-parse");
const sharp = require("sharp");
const OCRResult = require("../models/OCRResult");
const { createWorker } = require("tesseract.js");

/**
 * Extract text from an image using Tesseract.js
 * @param {string} filePath - Path to the uploaded file
 * @returns {Promise<string>} Extracted text
 */
async function extractTextFromImage(filePath) {
  const worker = await createWorker("eng");
  const { data: { text } } = await worker.recognize(filePath);
  await worker.terminate();
  return text;
}

/**
 * Extract text from a PDF using pdf-parse & Tesseract (if needed)
 * @param {Buffer} pdfBuffer - PDF file buffer
 * @returns {Promise<string>} Extracted text
 */
async function extractTextFromPDF(pdfBuffer) {
  try {
    const { text } = await pdfParse(pdfBuffer);
    if (text.trim().length > 0) return text;

    // Convert PDF to image and run OCR (fallback)
    const imageBuffer = await sharp(pdfBuffer)
      .jpeg()
      .toBuffer();
    return await extractTextFromImage(imageBuffer);
  } catch (error) {
    console.error("PDF OCR error:", error);
    return "";
  }
}

/**
 * Parse extracted text to find key health metrics
 * @param {string} text - Extracted text from OCR
 * @returns {Object} Extracted health metrics
 */
function parseHealthMetrics(text) {
  const bpMatch = text.match(/Blood Pressure[:\s]*([\d]+\/[\d]+)/i);
  const sugarMatch = text.match(/Blood Sugar[:\s]*([\d.]+)/i);
  const cholesterolMatch = text.match(/Cholesterol[:\s]*([\d.]+)/i);

  return {
    bloodPressure: bpMatch ? bpMatch[1] : "Not Found",
    bloodSugar: sugarMatch ? sugarMatch[1] : "Not Found",
    cholesterol: cholesterolMatch ? cholesterolMatch[1] : "Not Found",
  };
}

/**
 * Main function to process OCR for an uploaded file
 * @param {string} filePath - File path or URL from Supabase
 * @param {string} recordId - Associated record ID
 */
async function processOCR(filePath, recordId) {
  try {
    let extractedText;
    
    if (filePath.endsWith(".pdf")) {
      const pdfBuffer = await fetch(filePath).then((res) => res.buffer());
      extractedText = await extractTextFromPDF(pdfBuffer);
    } else {
      extractedText = await extractTextFromImage(filePath);
    }

    const extractedData = parseHealthMetrics(extractedText);

    // Save extracted data to MongoDB
    const ocrResult = new OCRResult({ recordId, extractedData });
    await ocrResult.save();

    return extractedData;
  } catch (error) {
    console.error("OCR Processing Error:", error);
    return null;
  }
}

module.exports = { processOCR };
