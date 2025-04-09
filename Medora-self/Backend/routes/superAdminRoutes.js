const express = require('express');
const router = express.Router();
const superAdminController = require('../controllers/superAdminController');
const requireSuperAdmin = require('../middleware/requireSuperAdmin');
const recordsRouter = require('./superadmin/superadminRecords');
const notificationRouter = require('./superadmin/notificationRoutes');

// ✅ Nested routers
router.use('/records', recordsRouter);
router.use('/notifications', notificationRouter);

// ===== Dashboard Routes =====
router.get('/dashboard/stats', requireSuperAdmin, superAdminController.getDashboardStats);
router.get('/dashboard/recent-users', requireSuperAdmin, superAdminController.getRecentUsers);

// ===== User Management =====
router.get('/users', requireSuperAdmin, superAdminController.getUsersWithFilters);

router
  .route('/users/:id')
  .get(requireSuperAdmin, superAdminController.getUserDetails)
  .delete(requireSuperAdmin, superAdminController.deleteUser);

router.put('/users/:id/status', requireSuperAdmin, superAdminController.updateUserStatus);

// ===== Feedback =====
router.get('/feedbacks', requireSuperAdmin, superAdminController.getFeedbacks);

// ===== Notification (Quick Fallback Send) =====
router.post('/notifications/send', requireSuperAdmin, superAdminController.sendNotification);

// Record & Prediction Count for User (used in dashboard user cards)
router.get('/users/:id/records/count', requireSuperAdmin, superAdminController.getUserRecordCount);
router.get('/users/:id/predictions/count', requireSuperAdmin, superAdminController.getUserPredictionCount);

module.exports = router;
