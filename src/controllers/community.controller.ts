import * as communityService from '../services/community.service';
import { Request, Response, NextFunction } from 'express';

const createCommunity = async (req: Request, res: Response, next: NextFunction) => {
  const { name, description } = req.body;

  try {
    const community = await communityService.createCommunity(name, description);

    return res.send(community);
  } catch (error) {
    next(error);
  }
};

const getCommunity = async (req: Request, res: Response) => {
  const { name } = req.params;

  const community = await communityService.getCommunity(name);

  return res.send(community);
};

export { createCommunity, getCommunity };
