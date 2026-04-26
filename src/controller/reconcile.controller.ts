import { Request, Response, NextFunction } from 'express';
import { runReconciliation } from '../service/reconcile.service';

export async function reconcileController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };

    if (!files?.fileA || !files?.fileB) {
      return res.status(400).json({ 
        error: 'Both fileA and fileB are required' 
      });
    }

    // .buffer instead of .path — memoryStorage puts file here
    const bufferA = files.fileA[0].buffer;
    const bufferB = files.fileB[0].buffer;

    const result = await runReconciliation(bufferA, bufferB);
    return res.status(200).json(result);

  } catch (err) {
    next(err);
  }
}