import { Router } from 'express';
import authRouter from './auth.route';
import communityRouter from './community.route';
import postRouter from './post.route';
import userRouter from './user.route';

const routes = Router();
routes.use(authRouter);
routes.use(communityRouter);
routes.use(postRouter);
routes.use(userRouter);

export default routes;
