const Record = require('../../models/Record');
const OCRResult = require('../../models/OCRResult');
const Prediction = require('../../models/Prediction');

exports.getAllRecords = async (req, res) => {
  try {
    const { userId, category, dateFrom, dateTo, page = 1, limit = 10 } = req.query;
    const filter = {};

    if (userId) filter.userId = userId;
    if (category) filter.category = category;
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [records, total] = await Promise.all([
      Record.find(filter)
        .populate('userId', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Record.countDocuments(filter)
    ]);

    res.json({
      success: true,
      message: 'Records fetched successfully',
      data: records,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to fetch records' });
  }
};

exports.getRecordDetails = async (req, res) => {
  try {
    const record = await Record.findById(req.params.id).populate('userId', 'name email phone');
    if (!record) return res.status(404).json({ success: false, error: 'Record not found' });

    res.json({ success: true, data: record });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch record details' });
  }
};

exports.getOCRResult = async (req, res) => {
  try {
    const ocr = await OCRResult.findOne({ recordId: req.params.id });
    if (!ocr) return res.status(404).json({ success: false, error: 'OCR result not found' });

    res.json({ success: true, data: ocr });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch OCR result' });
  }
};

exports.getPredictionResult = async (req, res) => {
    try {
      const prediction = await Prediction.findOne({ recordId: req.params.id });
      if (!prediction) {
        return res.status(404).json({ 
          success: false, 
          error: 'Prediction result not found',
          data: null // Explicitly return null for data
        });
      }
  
      // Ensure consistent response format
      const formattedData = {
        bloodSugar: prediction.bloodSugar?.toString() || "N/A",
        bloodPressure: prediction.bloodPressure?.toString() || "N/A",
        cholesterol: prediction.cholesterol?.toString() || "N/A"
      };
  
      res.json({ 
        success: true, 
        message: 'Prediction fetched successfully',
        data: formattedData 
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch prediction result',
        data: null 
      });
    }
  };
exports.deleteRecord = async (req, res) => {
  try {
    const recordId = req.params.id;

    const deleted = await Record.findByIdAndDelete(recordId);
    if (!deleted) return res.status(404).json({ success: false, error: 'Record not found' });

    await OCRResult.deleteMany({ recordId });
    await Prediction.deleteMany({ recordId });

    res.json({ success: true, message: 'Record and related data deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete record' });
  }
};

exports.flagRecord = async (req, res) => {
  try {
    const record = await Record.findByIdAndUpdate(
      req.params.id,
      { $set: { flagged: true } },
      { new: true }
    );

    if (!record) return res.status(404).json({ success: false, error: 'Record not found' });

    res.json({ success: true, message: 'Record flagged as suspicious', data: record });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to flag record' });
  }
};
