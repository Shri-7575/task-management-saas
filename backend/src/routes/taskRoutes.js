const express = require('express');
const router = express.Router({ mergeParams: true }); // To access params from parent router

const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStep,
  reviewTaskStep,
  addComment
} = require('../controllers/taskController');

const { protect, authorize, checkTaskAccess } = require('../middleware/authMiddleware');

// Protect all routes
router.use(protect);

// Task routes
router.route('/')
  .get(getTasks)
  .post(createTask);

router.route('/:id')
  .get(checkTaskAccess, getTask)
  .put(checkTaskAccess, updateTask)
  .delete(authorize('admin'), checkTaskAccess, deleteTask);

// Task steps
router.route('/:id/steps/:stepIndex')
  .put(checkTaskAccess, updateTaskStep);

router.route('/:id/steps/:stepIndex/review')
  .put(authorize('manager', 'admin'), checkTaskAccess, reviewTaskStep);

// Comments
router.route('/:id/comments')
  .post(checkTaskAccess, addComment);

// File upload middleware configuration
const multer = require('multer');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
  }
});

const fileFilter = (req, file, cb) => {
  // Accept images, videos, audio, and documents
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'video/mp4',
    'video/mpeg',
    'audio/mpeg',
    'audio/wav',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// File upload route for task steps
router.post(
  '/:id/steps/:stepIndex/upload',
  protect,
  checkTaskAccess,
  upload.single('file'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return next(new Error('Please upload a file'));
      }

      const task = await Task.findById(req.params.id);
      const stepIndex = parseInt(req.params.stepIndex);
      const step = task.steps[stepIndex];

      // Update step with file information
      step.validation.fileUrl = `/uploads/${req.file.filename}`;
      step.validation.fileType = req.file.mimetype;
      step.validation.fileName = req.file.originalname;
      step.validation.uploadedAt = Date.now();

      await task.save();

      res.status(200).json({
        success: true,
        data: {
          fileUrl: step.validation.fileUrl,
          fileName: step.validation.fileName,
          fileType: step.validation.fileType
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
