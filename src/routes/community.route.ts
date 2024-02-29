import express from 'express';
import * as communityController from '../controllers/community.controller';
import validateRequest from '../middlewares/validateRequest';
import validateAuth from '../middlewares/validateAuth';
import * as communitySchema from '../schemas/community.schema';

const router = express.Router();

router
  .route('/community/:name')
  .get(validateRequest(communitySchema.getCommunitySchema), communityController.getCommunity);

router
  .route('/community/create')
  .post(validateAuth, validateRequest(communitySchema.createCommunitySchema), communityController.createCommunity);

router
  .route('/community/:name/join')
  .post(validateAuth, validateRequest(communitySchema.createMembershipSchema), communityController.createMembership);

export default router;
