const express = require('express');
const router = express.Router();
const {
  getOrganizations,
  getOrganization,
  updateOrganization,
  addMember,
  removeMember,
  updateMemberRole,
  updateSubscription,
  getOrganizationStats
} = require('../controllers/organizationController');

const { protect, authorize, checkOrganizationAccess } = require('../middleware/authMiddleware');

// Protect all routes
router.use(protect);

// Super Admin routes
router.get('/', authorize('super_admin'), getOrganizations);

// Organization specific routes
router.get('/:id', checkOrganizationAccess, getOrganization);
router.put('/:id', authorize('admin', 'super_admin'), checkOrganizationAccess, updateOrganization);

// Member management
router.post('/:id/members', authorize('admin', 'super_admin'), checkOrganizationAccess, addMember);
router.delete('/:id/members/:userId', authorize('admin', 'super_admin'), checkOrganizationAccess, removeMember);
router.put('/:id/members/:userId', authorize('admin', 'super_admin'), checkOrganizationAccess, updateMemberRole);

// Subscription management
router.put('/:id/subscription', authorize('admin', 'super_admin'), checkOrganizationAccess, updateSubscription);

// Statistics
router.get('/:id/stats', authorize('admin', 'super_admin'), checkOrganizationAccess, getOrganizationStats);

// Include workspace routes
const workspaceRouter = require('./workspaceRoutes');
router.use('/:organizationId/workspaces', workspaceRouter);

module.exports = router;
