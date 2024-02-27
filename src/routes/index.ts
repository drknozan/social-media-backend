import { Router } from 'express';
import authRouter from './auth.route';

const routes = Router();
routes.use(authRouter);

export default routes;
