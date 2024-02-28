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

const getCommunity = async (name: string): Promise<ICommunity> => {
  const community = await prisma.community.findUnique({
    where: {
      name: name,
    },
    select: {
      name: true,
      description: true,
      createdAt: true,
      posts: {
        select: {
          slug: true,
          title: true,
          content: true,
          upvotes: true,
          downvotes: true,
          createdAt: true,
          user: {
            select: {
              username: true,
            },
          },
        },
      },
      memberships: {
        select: {
          user: {
            select: {
              username: true,
            },
          },
          role: true,
        },
      },
    },
  });

  if (!community) {
    throw new HttpError(400, { message: 'No community found with given name' });
  }

  return community;
};

export { createCommunity, getCommunity };
