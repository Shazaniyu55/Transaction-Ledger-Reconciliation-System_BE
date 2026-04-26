import { Router } from 'express';
import multer from 'multer';
import { reconcileController } from '../controller/reconcile.controller';
import { errorHandler } from '../utils/errorHandle';
const ReconcileRouter = Router();

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB max
});

ReconcileRouter.post(
  '/reconcile',
  upload.fields([
    { name: 'fileA', maxCount: 1 },
    { name: 'fileB', maxCount: 1 },
  ]),
 errorHandler(reconcileController)
);

export default ReconcileRouter;