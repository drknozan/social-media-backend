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
  .route('/community/search/')
  .get(validateAuth, validateRequest(communitySchema.getCommunitiesSchema), communityController.getCommunities);

router
  .route('/community/create')
  .post(validateAuth, validateRequest(communitySchema.createCommunitySchema), communityController.createCommunity);

router
  .route('/community/:name/join')
  .post(validateAuth, validateRequest(communitySchema.createMembershipSchema), communityController.createMembership);

router
  .route('/community/:name/role')
  .patch(validateAuth, validateRequest(communitySchema.updateMembershipSchema), communityController.updateMembership);

router
  .route('/community/:name/leave')
  .post(validateAuth, validateRequest(communitySchema.deleteMembershipSchema), communityController.deleteMembership);

export default router;
