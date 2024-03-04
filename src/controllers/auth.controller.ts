import { NextFunction, Request, Response } from 'express';
import * as authService from '../services/auth.service';

// Create an user account
const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, email, password } = req.body;

    const { user, token } = await authService.register(username, email, password);

    res.cookie('token', token, {
      httpOnly: true,
    });

    return res.send({ ...user });
  } catch (error) {
    next(error);
  }
};

// Login user
const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const { user, token } = await authService.login(email, password);

    res.cookie('token', token, {
      httpOnly: true,
    });

    res.send({ ...user });
  } catch (error) {
    next(error);
  }
};

const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await authService.getCurrentUser(req.user?.id);

    res.send(user);
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password, allowDm, profileVisibility } = req.body;

  try {
    const user = await authService.updateUser({ email, password, allowDm, profileVisibility }, req.user?.id);

    res.send(user);
  } catch (error) {
    next(error);
  }
};

export { register, login, getCurrentUser, updateUser };
