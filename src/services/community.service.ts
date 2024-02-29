import HttpError from '../utils/httpError';
import prisma from '../config/db';
import { ICommunity } from '../interfaces/ICommunity';
import { IMembership } from '@/interfaces/IMembership';

const createCommunity = async (communityName: string, description: string): Promise<ICommunity> => {
  const existingCommunity = await prisma.community.findFirst({
    where: {
      name: {
        equals: communityName,
        mode: 'insensitive',
      },
    },
  });

  if (existingCommunity) {
    throw new HttpError(400, { message: 'Community name already taken' });
  }

  const community = await prisma.community.create({
    data: {
      name: communityName,
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

const getCommunity = async (communityName: string): Promise<ICommunity> => {
  const community = await prisma.community.findFirst({
    where: {
      name: {
        equals: communityName,
        mode: 'insensitive',
      },
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

const createMembership = async (communityName: string, userId: string): Promise<IMembership> => {
  const communityByName = await prisma.community.findFirst({
    where: {
      name: {
        equals: communityName,
        mode: 'insensitive',
      },
    },
    select: {
      id: true,
    },
  });

  if (!communityByName) {
    throw new HttpError(400, 'No community found with given given name');
  }

  const membership = await prisma.membership.create({
    data: {
      userId: userId,
      communityId: communityByName.id,
    },
    select: {
      user: {
        select: {
          username: true,
        },
      },
      community: {
        select: {
          name: true,
        },
      },
      role: true,
    },
  });

  return { username: membership.user.username, communityName: membership.community.name, role: membership.role };
};

export { createCommunity, getCommunity, createMembership };
