const express = require('express');
const router = express.Router();

const {
  getPlans,
  getPlan,
  createPlan,
  updatePlan,
  deletePlan,
  createOrder,
  verifyPayment,
  webhook,
  getSubscription,
  cancelSubscription
} = require('../controllers/subscriptionController');

const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes
router.get('/plans', getPlans);
router.get('/plans/:id', getPlan);
router.post('/webhook', webhook); // Razorpay webhook endpoint

// Protected routes
router.use(protect);

// Super Admin routes for managing plans
router.post('/plans', authorize('super_admin'), createPlan);
router.put('/plans/:id', authorize('super_admin'), updatePlan);
router.delete('/plans/:id', authorize('super_admin'), deletePlan);

// Payment routes
router.post('/create-order', authorize('admin'), createOrder);
router.post('/verify-payment', authorize('admin'), verifyPayment);

// Subscription management routes
router.get('/organizations/:organizationId', authorize('admin', 'super_admin'), getSubscription);
router.post('/organizations/:organizationId/cancel', authorize('admin', 'super_admin'), cancelSubscription);

module.exports = router;
