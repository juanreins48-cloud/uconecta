// routes/files.routes.js
import express from 'express';
import { uploadFile, listFiles, serveFile } from '../controllers/files.controller.js';
import { upload } from '../middleware/multer.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/upload', requireAuth, upload.single('file'), uploadFile);
router.get('/', requireAuth, listFiles);
router.get('/:id', requireAuth, serveFile);

export default router;
