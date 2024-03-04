import { NextFunction, Request, Response } from 'express';
import * as userService from '../services/user.service';

const getUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username } = req.params;

    const user = await userService.getUser(username);

    res.send(user);
  } catch (error) {
    next(error);
  }
};

export { getUser };
