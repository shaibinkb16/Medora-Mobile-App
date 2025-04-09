const express = require('express');
const multer = require('multer');
const recordController = require('../controllers/recordsController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
const upload = multer();

// Route to upload a new record with a file
router.post('/upload', authMiddleware, upload.single('file'), recordController.uploadRecord);

// Route to fetch all user records
router.get('/', authMiddleware, recordController.getUserRecords);

// Route to get record counts by category
router.get('/counts', authMiddleware, recordController.getRecordCounts);

// Route to fetch OCR data for a specific record (MUST come before :id route)
router.get('/:recordId/ocr', authMiddleware, recordController.getOCRData);
router.get('/ocr', authMiddleware, recordController.getUserOCRData); // NEW ROUTE


// Route to fetch a single record by ID
router.get('/:id', authMiddleware, recordController.getRecordById);

// Route to delete a record by ID
router.delete('/:id', authMiddleware, recordController.deleteRecord);

module.exports = router;