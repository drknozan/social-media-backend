import express from 'express';
import * as communityController from '../controllers/community.controller';
import validateRequest from '../middlewares/validateRequest';
import * as communitySchema from '../schemas/community.schema';

const router = express.Router();

router
  .route('/community/:name')
  .get(validateRequest(communitySchema.getCommunitySchema), communityController.getCommunity);

router
  .route('/community/create')
  .post(validateRequest(communitySchema.createCommunitySchema), communityController.createCommunity);

export default router;
