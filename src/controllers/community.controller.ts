import * as communityService from '../services/community.service';
import { Request, Response, NextFunction } from 'express';

const createCommunity = async (req: Request, res: Response, next: NextFunction) => {
  const { communityName, description } = req.body;

  try {
    const community = await communityService.createCommunity(communityName, description);

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

const createMembership = async (req: Request, res: Response) => {
  const { communityName } = req.body;

  const membership = await communityService.createMembership(communityName, req.user?.id);

  res.send(membership);
};

export { createCommunity, getCommunity, createMembership };
