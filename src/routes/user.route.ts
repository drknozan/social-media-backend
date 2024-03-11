import express from 'express';
import * as userController from '../controllers/user.controller';
import validateAuth from '../middlewares/validateAuth';
import validateRequest from '../middlewares/validateRequest';
import * as userSchema from '../schemas/user.schema';

const router = express.Router();

router.route('/users/:username').get(validateAuth, validateRequest(userSchema.getUserSchema), userController.getUser);

router
  .route('users/:username/follow')
  .post(validateAuth, validateRequest(userSchema.followUserSchema), userController.followUser);

router
  .route('users/:username/unfollow')
  .post(validateAuth, validateRequest(userSchema.unFollowUserSchema), userController.unfollowUser);

router.route('users/recommendations').get(validateAuth, userController.getUserRecommendations);

export default router;
