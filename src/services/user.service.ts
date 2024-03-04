import HttpError from '../utils/httpError';
import prisma from '../config/db';
import { IUser } from '../interfaces/IUser';
import { IFollow } from '@/interfaces/IFollow';

const getUser = async (username: string): Promise<IUser> => {
  const user = await prisma.user.findUnique({
    where: {
      username: username,
    },
    select: {
      username: true,
      allowDm: true,
      profileVisibility: true,
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
        },
      },
      _count: {
        select: {
          followed: true,
          followers: true,
        },
      },
    },
  });

  if (!user) {
    throw new HttpError(404, { message: 'User not found' });
  }

  if (!user.profileVisibility) {
    delete user.posts;
    return user;
  }

  return user;
};

const followUser = async (username: string, userId: string): Promise<IFollow> => {
  const followedUser = await prisma.user.findUnique({
    where: {
      username,
    },
    select: {
      id: true,
    },
  });

  if (!followedUser) {
    throw new HttpError(404, 'User not found');
  }

  const alreadyFollowed = await prisma.follow.findUnique({
    where: {
      followerId_followedId: {
        followedId: followedUser.id,
        followerId: userId,
      },
    },
  });

  if (alreadyFollowed) {
    throw new HttpError(400, { message: 'User is already following' });
  }

  const follow = await prisma.follow.create({
    data: {
      followerId: userId,
      followedId: followedUser.id,
    },
    select: {
      follower: {
        select: {
          username: true,
        },
      },
      followed: {
        select: {
          username: true,
        },
      },
      createdAt: true,
    },
  });

  return follow;
};

export { getUser, followUser };
