const Record = require('../models/Record');
const OCRResult = require('../models/OCRResult');
const supabase = require('../utils/supabaseClient');
const mongoose = require('mongoose');
const Tesseract = require('tesseract.js');
const { runPredictions } = require("./predictionController");


exports.uploadRecord = async (req, res) => {
  try {
    const { familyMember, category, labName, description, condition, tags, emergencyUse, doctor } = req.body;

    if (!category || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    let fileUrl = '';
    let extractedData = null;

    if (req.file) {
      const { data, error } = await supabase.storage
        .from('medora-records')
        .upload(`public/${req.file.originalname}`, req.file.buffer);

      if (error) {
        console.error('Supabase upload error:', error);
        return res.status(500).json({ error: 'Failed to upload file' });
      }

      fileUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/medora-records/${data.path}`;
      extractedData = await extractTextFromFile(fileUrl);
    }

    const newRecord = new Record({
      userId: req.user.userId,
      familyMember,
      category,
      labName,
      description,
      condition,
      tags: tags ? tags.split(',').map((tag) => tag.trim()) : [],
      emergencyUse: emergencyUse === 'true' || emergencyUse === true,
      imageUrl: fileUrl,
      doctor,
    });

    await newRecord.save();

    // Fetch previous OCR data if available
    const prevOCRData = await OCRResult.findOne({ userId: req.user.userId, recordId: newRecord._id });

    if (extractedData) {
      // Merge previous and new extracted metrics
      //const mergedMetrics = mergeMetrics(prevOCRData?.extractedMetrics, extractedData.metrics);

      await OCRResult.findOneAndUpdate(
        { recordId: newRecord._id },
        {
          recordId: newRecord._id,
          userId: req.user.userId,
          extractedText: extractedData.text,
          //extractedMetrics: mergedMetrics,
          extractedMetrics: extractedData.metrics,

        },
        { upsert: true, new: true }
      );

    }
    const predictionResult = await runPredictions();


    res.status(201).json({
      message: "Record uploaded successfully",
      record: newRecord,
      prediction: predictionResult  // ✅ Return prediction status
  });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

const extractTextFromFile = async (fileUrl) => {
  try {
    const { data: { text } } = await Tesseract.recognize(fileUrl, 'eng');
    return { text, metrics: extractHealthMetrics(text) };
  } catch (error) {
    console.error('OCR processing error:', error);
    return null;
  }
};

const extractHealthMetrics = (text) => {
  const metrics = { bloodSugar: null, bloodPressure: null, cholesterol: null };
  
  const sugarMatch = text.match(/blood sugar[:\s]*([\d.]+)/i);
  const bpMatch = text.match(/blood pressure[:\s]*(\d+\/\d+)/i);
  const cholesterolMatch = text.match(/cholesterol[:\s]*([\d.]+)/i);

  if (sugarMatch) metrics.bloodSugar = parseFloat(sugarMatch[1]);
  if (bpMatch) metrics.bloodPressure = bpMatch[1];
  if (cholesterolMatch) metrics.cholesterol = parseFloat(cholesterolMatch[1]);

  return metrics;
};

// Function to merge old and new extracted metrics
const mergeMetrics = (oldMetrics = {}, newMetrics = {}) => {
  return {
    bloodSugar: newMetrics.bloodSugar || oldMetrics.bloodSugar || null,
    bloodPressure: newMetrics.bloodPressure || oldMetrics.bloodPressure || null,
    cholesterol: newMetrics.cholesterol || oldMetrics.cholesterol || null,
  };
};

exports.getOCRData = async (req, res) => {
  try {
    const { recordId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(recordId)) {
      return res.status(400).json({ error: 'Invalid record ID format' });
    }

    const ocrData = await OCRResult.findOne({ 
      recordId: new mongoose.Types.ObjectId(recordId) 
    });

    if (!ocrData) return res.status(404).json({ error: 'OCR data not found' });
    
    // Add cache control headers
    res.set('Cache-Control', 'no-store, max-age=0');
    res.json(ocrData);
  } catch (err) {
    console.error('OCR fetch error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
exports.getUserRecords = async (req, res) => {
  try {
    const { category } = req.query;
    const query = { userId: req.user.userId };
    
    if (category) query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    
    const records = await Record.find(query).sort({ createdAt: -1 });
    res.json(records);
  } catch (err) {
    console.error('Records fetch error:', err);
    res.status(500).json({ error: 'Unable to fetch records' });
  }
};

exports.getRecordById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid record ID format' });
    }

    const record = await Record.findById(id);
    if (!record) return res.status(404).json({ error: 'Record not found' });
    if (!record.userId.equals(req.user.userId)) return res.status(403).json({ error: 'Unauthorized access' });

    res.json(record);
  } catch (err) {
    console.error('Record fetch error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteRecord = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid record ID format' });
    }

    const record = await Record.findById(id);
    if (!record) return res.status(404).json({ error: 'Record not found' });
    if (!record.userId.equals(req.user.userId)) return res.status(403).json({ error: 'Unauthorized access' });

    if (record.imageUrl) {
      const fileName = record.imageUrl.split('/').pop();
      await supabase.storage.from('medora-records').remove([`public/${fileName}`]);
    }

    await Record.deleteOne({ _id: id });
    await OCRResult.deleteOne({ recordId: id });

    res.json({ message: 'Record deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getRecordCounts = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const counts = {
      labReports: await Record.countDocuments({ userId, category: 'Lab Report' }),
      prescription: await Record.countDocuments({ userId, category: 'Prescription' }),
      doctorNotes: await Record.countDocuments({ userId, category: 'Doctor Note' }),
      imaging: await Record.countDocuments({ userId, category: 'Imaging' }),
      medicalExpense: await Record.countDocuments({ userId, category: 'Medical Expense' }),
    };

    res.status(200).json(counts);
  } catch (err) {
    console.error('Count fetch error:', err);
    res.status(500).json({ message: 'Failed to fetch counts', error: err.message });
  }
};

// In recordsController.js
exports.getUserOCRData = async (req, res) => {
  try {
    const ocrData = await OCRResult.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .populate('recordId', 'category createdAt imageUrl');      
    res.status(200).json(ocrData);
  } catch (err) {
    console.error('OCR data fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch OCR data' });
  }

};


exports.getLatestOCRMetrics = async (req, res) => {
  try {
    const latestOCRData = await OCRResult.findOne({ userId: req.user.userId })
      .sort({ createdAt: -1 }) // Get the most recent entry
      .populate('recordId', 'category createdAt imageUrl');  

    if (!latestOCRData) {
      return res.status(404).json({ error: "No OCR data found" });
    }

    res.status(200).json({
      bloodSugar: latestOCRData.extractedMetrics?.bloodSugar || null,
      bloodPressure: latestOCRData.extractedMetrics?.bloodPressure || null,
      cholesterol: latestOCRData.extractedMetrics?.cholesterol || null,
    });
  } catch (err) {
    console.error("Error fetching latest OCR data:", err);
    res.status(500).json({ error: "Failed to fetch OCR data" });
  }
};


  