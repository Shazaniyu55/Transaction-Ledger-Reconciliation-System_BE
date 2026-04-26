import  express  from "express";

import ReconcileRouter from './reconcile.route';

const indexRouter= express.Router();


indexRouter.use('/recon', ReconcileRouter);

export default indexRouter;