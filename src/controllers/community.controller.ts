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

const getCommunity = async (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.params;

  try {
    const community = await communityService.getCommunity(name);

    return res.send(community);
  } catch (error) {
    next(error);
  }
};

const createMembership = async (req: Request, res: Response, next: NextFunction) => {
  const { communityName } = req.body;

  try {
    const membership = await communityService.createMembership(communityName, req.user?.id);

    res.send(membership);
  } catch (error) {
    next(error);
  }
};

const updateMembership = async (req: Request, res: Response, next: NextFunction) => {
  const { communityName, usernameToUpdate, role } = req.body;

  try {
    const membership = await communityService.updateMembership(communityName, usernameToUpdate, role, req.user?.id);

    res.send(membership);
  } catch (error) {
    next(error);
  }
};

const deleteMembership = async (req: Request, res: Response, next: NextFunction) => {
  const { communityName } = req.body;

  try {
    await communityService.deleteMembership(communityName, req.user?.id);

    res.send({ message: 'User has successfully left the community' });
  } catch (error) {
    next(error);
  }
};

export { createCommunity, getCommunity, createMembership, updateMembership, deleteMembership };
