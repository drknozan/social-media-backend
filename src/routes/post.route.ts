import express from 'express';
import * as postController from '../controllers/post.controller';
import validateAuth from '../middlewares/validateAuth';
import validateRequest from '../middlewares/validateRequest';
import * as postSchema from '../schemas/post.schema';

const router = express.Router();

router
  .route('/posts/create')
  .post(validateAuth, validateRequest(postSchema.createPostSchema), postController.createPost);

router.route('/posts/:slug').get(validateAuth, validateRequest(postSchema.getPostSchema), postController.getPost);

router
  .route('/posts/:slug')
  .delete(validateAuth, validateRequest(postSchema.deletePostSchema), postController.deletePost);

router
  .route('/posts/:slug/upvote')
  .patch(validateAuth, validateRequest(postSchema.upvotePostSchema), postController.upvotePost);

router
  .route('/posts/:slug/downvote')
  .patch(validateAuth, validateRequest(postSchema.downvotePostSchema), postController.downvotePost);

router
  .route('/posts/:slug/comment')
  .post(validateAuth, validateRequest(postSchema.createCommentSchema), postController.createComment);

router
  .route('/posts/:slug/:commentId')
  .delete(validateAuth, validateRequest(postSchema.deleteCommentSchema), postController.deleteComment);

export default router;
