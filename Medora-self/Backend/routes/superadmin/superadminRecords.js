const express = require('express');
const router = express.Router();
const {
  getAllRecords,
  getRecordDetails,
  getOCRResult,
  getPredictionResult,
  deleteRecord,
  flagRecord
} = require('../../controllers/superadmin/recordsController'); // ✅ correct controller path

const requireSuperAdmin = require('../../middleware/requireSuperAdmin'); // ✅ correct middleware path

router.use(requireSuperAdmin); // 🔐 Protect all routes below

router.get('/', getAllRecords);
router.get('/:id', getRecordDetails);
router.get('/:id/ocr', getOCRResult);
router.get('/:id/prediction', getPredictionResult);
router.delete('/:id', deleteRecord);
router.patch('/:id/flag', flagRecord);

module.exports = router;
