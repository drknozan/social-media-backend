import express from 'express';
import { register, login } from '../controllers/auth.controller';
import validateRequest from '../middlewares/validateRequest';
import * as authSchema from '../schemas/auth.schema';

const router = express.Router();

router.route('/register').post(validateRequest(authSchema.registerSchema), register);

router.route('/login').post(validateRequest(authSchema.loginSchema), login);

export default router;
