import HttpError from '../utils/httpError';
import prisma from '../config/db';
import { ICommunity } from '../interfaces/ICommunity';

const createCommunity = async (name: string, description: string): Promise<ICommunity> => {
  const existingCommunity = await prisma.community.findUnique({
    where: {
      name,
    },
  });

  if (existingCommunity) {
    throw new HttpError(400, { message: 'Community name already taken' });
  }

  const community = await prisma.community.create({
    data: {
      name,
      description,
    },
    select: {
      name: true,
      description: true,
      createdAt: true,
    },
  });

  return community;
};

export { createCommunity };
