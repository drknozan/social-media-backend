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

const followUser = async (req: Request, res: Response, next: NextFunction) => {
  const { username } = req.body;

  try {
    const follow = await userService.followUser(username, req.user?.id);

    res.send(follow);
  } catch (error) {
    next(error);
  }
};

const unfollowUser = async (req: Request, res: Response, next: NextFunction) => {
  const { username } = req.body;

  try {
    const follow = await userService.unfollowUser(username, req.user?.id);

    res.send(follow);
  } catch (error) {
    next(error);
  }
};

export { getUser, followUser, unfollowUser };
