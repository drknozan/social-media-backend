import HttpError from '../utils/httpError';
import prisma from '../config/db';
import { ICommunity } from '../interfaces/ICommunity';
import { IMembership } from '../interfaces/IMembership';
import redisClient from '../config/redis';

const createCommunity = async (communityName: string, description: string, userId: string): Promise<ICommunity> => {
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
      id: true,
      name: true,
      description: true,
      createdAt: true,
    },
  });

  await prisma.membership.create({
    data: {
      userId,
      communityId: community.id,
      role: 'FOUNDER',
    },
  });

  return { name: community.name, description: community.description, createdAt: community.createdAt };
};

const getCommunity = async (communityName: string): Promise<ICommunity> => {
  const cachedCommunity = await redisClient.get(communityName);

  if (cachedCommunity) {
    return JSON.parse(cachedCommunity);
  }

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
          community: {
            select: {
              name: true,
            },
          },
          user: {
            select: {
              username: true,
            },
          },
        },
      },
      _count: {
        select: {
          memberships: true,
        },
      },
    },
  });

  if (!community) {
    throw new HttpError(400, { message: 'No community found with given name' });
  }

  await redisClient.set(community.name, JSON.stringify(community));

  return community;
};

const getCommunities = async (
  q: string,
  offset: string,
  limit: string,
): Promise<{ result: ICommunity[]; count: number }> => {
  const communityCount = await prisma.community.count({
    where: {
      name: {
        contains: q,
      },
    },
  });

  const communities = await prisma.community.findMany({
    where: {
      name: {
        contains: q,
        mode: 'insensitive',
      },
    },
    orderBy: {
      memberships: {
        _count: 'desc',
      },
    },
    skip: Number(offset) || 0,
    take: Number(limit) || 10,
    select: {
      name: true,
      description: true,
      createdAt: true,
      _count: {
        select: {
          memberships: true,
        },
      },
    },
  });

  return { result: communities, count: communityCount };
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
    throw new HttpError(400, { message: 'No community found with given given name' });
  }

  const existingMembership = await prisma.membership.findUnique({
    where: {
      userId_communityId: {
        userId,
        communityId: communityByName.id,
      },
    },
  });

  if (existingMembership) {
    throw new HttpError(400, { message: 'User is already member of given community' });
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

  return membership;
};

const updateMembership = async (
  communityName: string,
  usernameToUpdate: string,
  role: 'MEMBER' | 'FOUNDER' | 'MODERATOR',
  userId: string,
): Promise<IMembership> => {
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
    throw new HttpError(400, { message: 'No community found with given name' });
  }

  const userToUpdate = await prisma.user.findUnique({
    where: {
      username: usernameToUpdate,
    },
    select: {
      id: true,
    },
  });

  if (!userToUpdate) {
    throw new HttpError(400, { message: 'Current user not member of given community' });
  }

  const currentUserMembership = await prisma.membership.findUnique({
    where: {
      userId_communityId: {
        userId: userId,
        communityId: communityByName.id,
      },
    },
  });

  if (!currentUserMembership) {
    throw new HttpError(400, { message: 'Current user not member of given community' });
  }

  if (currentUserMembership.role === 'MEMBER') {
    throw new HttpError(403, { message: 'Not authorized to give community role' });
  }

  const updatedMembership = await prisma.membership.update({
    where: {
      userId_communityId: {
        userId: userToUpdate.id,
        communityId: communityByName.id,
      },
    },
    data: {
      role: role,
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

  return updatedMembership;
};

const deleteMembership = async (communityName: string, userId: string) => {
  const communityByName = await prisma.community.findUnique({
    where: {
      name: communityName,
    },
  });

  if (!communityByName) {
    throw new HttpError(400, { message: 'No community found with given name' });
  }

  const membershipByName = await prisma.membership.findUnique({
    where: {
      userId_communityId: {
        userId,
        communityId: communityByName.id,
      },
    },
  });

  if (!membershipByName) {
    throw new HttpError(400, { message: 'Current user not member of given community' });
  }

  await prisma.membership.delete({
    where: {
      userId_communityId: {
        userId,
        communityId: communityByName.id,
      },
    },
  });
};

export { createCommunity, getCommunity, getCommunities, createMembership, updateMembership, deleteMembership };
