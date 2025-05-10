const express = require('express');
const router = express.Router({ mergeParams: true }); // To access params from parent router

const {
  getWorkspaces,
  getWorkspace,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  addMember,
  removeMember,
  updateMemberRole,
  getWorkspaceStats
} = require('../controllers/workspaceController');

const { protect, authorize, checkWorkspaceAccess } = require('../middleware/authMiddleware');

// Protect all routes
router.use(protect);

// Workspace routes
router.route('/')
  .get(getWorkspaces)
  .post(authorize('admin'), createWorkspace);

router.route('/:id')
  .get(checkWorkspaceAccess, getWorkspace)
  .put(authorize('admin'), checkWorkspaceAccess, updateWorkspace)
  .delete(authorize('admin'), checkWorkspaceAccess, deleteWorkspace);

// Member management
router.route('/:id/members')
  .post(authorize('admin'), checkWorkspaceAccess, addMember);

router.route('/:id/members/:userId')
  .delete(authorize('admin'), checkWorkspaceAccess, removeMember)
  .put(authorize('admin'), checkWorkspaceAccess, updateMemberRole);

// Statistics
router.get('/:id/stats', checkWorkspaceAccess, getWorkspaceStats);

// Include task routes
const taskRouter = require('./taskRoutes');
router.use('/:workspaceId/tasks', taskRouter);

module.exports = router;
