import express from 'express';
import * as postController from '../controllers/post.controller';
import validateAuth from '../middlewares/validateAuth';
import validateRequest from '../middlewares/validateRequest';
import * as postSchema from '../schemas/post.schema';

const router = express.Router();

router
  .route('/post/create')
  .post(validateAuth, validateRequest(postSchema.createPostSchema), postController.createPost);

router.route('/post/:slug').get(validateAuth, validateRequest(postSchema.getPostSchema), postController.getPost);

router
  .route('/post/:slug')
  .delete(validateAuth, validateRequest(postSchema.deletePostSchema), postController.deletePost);

export default router;
