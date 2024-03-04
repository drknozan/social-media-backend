import express from 'express';
import * as userController from '../controllers/user.controller';
import validateAuth from '../middlewares/validateAuth';
import validateRequest from '../middlewares/validateRequest';
import * as userSchema from '../schemas/user.schema';

const router = express.Router();

router.route('/user/:username').get(validateAuth, validateRequest(userSchema.getUserSchema), userController.getUser);

export default router;
