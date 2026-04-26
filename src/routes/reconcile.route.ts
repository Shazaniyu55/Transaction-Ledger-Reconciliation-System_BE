import { Router } from 'express';
import multer from 'multer';
import { reconcileController } from '../controller/reconcile.controller';
import { errorHandler } from '../utils/errorHandle';
const ReconcileRouter = Router();

const upload = multer({ dest: 'uploads/' }); // saves files to /uploads temp

ReconcileRouter.post(
  '/reconcile',
  upload.fields([
    { name: 'fileA', maxCount: 1 },
    { name: 'fileB', maxCount: 1 },
  ]),
 errorHandler(reconcileController)
);

export default ReconcileRouter;