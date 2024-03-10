import express from 'express';
import * as authController from '../controllers/auth.controller';
import validateRequest from '../middlewares/validateRequest';
import * as authSchema from '../schemas/auth.schema';
import validateAuth from '../middlewares/validateAuth';

const router = express.Router();

router.route('/register').post(validateRequest(authSchema.registerSchema), authController.register);

router.route('/login').post(validateRequest(authSchema.loginSchema), authController.login);

router.route('/user').get(validateAuth, authController.getCurrentUser);

router.route('/profile').get(validateAuth, authController.getCurrentUserProfile);

router
  .route('/profile/update')
  .put(validateAuth, validateRequest(authSchema.updateUserSchema), authController.updateUser);

router.route('/logout').post(validateAuth, authController.logout);

export default router;
