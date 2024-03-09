import express from 'express';
import * as authController from '../controllers/auth.controller';
import validateRequest from '../middlewares/validateRequest';
import * as authSchema from '../schemas/auth.schema';
import validateAuth from '../middlewares/validateAuth';

const router = express.Router();

router.route('/register').post(validateRequest(authSchema.registerSchema), authController.register);

router.route('/login').post(validateRequest(authSchema.loginSchema), authController.login);

router.route('/profile').post(validateAuth, authController.getCurrentUser);

router
  .route('/profile/update')
  .put(validateAuth, validateRequest(authSchema.updateUserSchema), authController.updateUser);

export default router;
