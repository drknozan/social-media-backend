import express from 'express';
import * as userController from '../controllers/user.controller';
import validateAuth from '../middlewares/validateAuth';
import validateRequest from '../middlewares/validateRequest';
import * as userSchema from '../schemas/user.schema';

const router = express.Router();

router.route('/users/:username').get(validateAuth, validateRequest(userSchema.getUserSchema), userController.getUser);

router
  .route('/follow/:username')
  .post(validateAuth, validateRequest(userSchema.followUserSchema), userController.followUser);

router
  .route('/unfollow/:username')
  .post(validateAuth, validateRequest(userSchema.unFollowUserSchema), userController.unfollowUser);

router.route('/recommendations').get(validateAuth, userController.getUserRecommendations);

router.route('/feed').get(validateAuth, userController.getUserFeed);

export default router;
