import { Router } from 'express';
import authRouter from './auth.route';
import communityRouter from './community.route';
import postRouter from './post.route';

const routes = Router();
routes.use(authRouter);
routes.use(communityRouter);
routes.use(postRouter);

export default routes;
