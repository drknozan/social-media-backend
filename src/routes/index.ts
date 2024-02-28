import { Router } from 'express';
import authRouter from './auth.route';
import communityRouter from './community.route';

const routes = Router();
routes.use(authRouter);
routes.use(communityRouter);

export default routes;
