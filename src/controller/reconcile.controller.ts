import { Request, Response, NextFunction } from 'express';
import { runReconciliation } from '../service/reconcile.service';
import { successResponse } from '../utils/successresponse';
import HttpException from '../utils/httpExceptions';
import statusCodes from '../constants/statuscodes';

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
      return res.status(statusCodes.BAD_REQUEST).json({ error: 'Both fileA and fileB are required' });
    }

    const fileAPath = files.fileA[0].path;
    const fileBPath = files.fileB[0].path;

    const result = await runReconciliation(fileAPath, fileBPath);
    console.log('Reconciliation result:', result);
    return res.status(statusCodes.CREATED).json(result);
  } catch (err) {
    console.error('Error in reconcileController:', err);
    next(new HttpException(statusCodes.INTERNAL_SERVER_ERROR, 'Internal server error'));
  }
}