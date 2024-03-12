import HttpError from '../utils/httpError';
import prisma from '../config/db';
import { IUser } from '../interfaces/IUser';
import { IFollow } from '@/interfaces/IFollow';
import { IPost } from '@/interfaces/IPost';

const getUser = async (username: string): Promise<IUser> => {
  const user = await prisma.user.findUnique({
    where: {
      username: username,
    },
    select: {
      username: true,
      profileVisibility: true,
      bio: true,
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

const unfollowUser = async (username: string, userId: string): Promise<IFollow> => {
  const followedUser = await prisma.user.findUnique({
    where: {
      username,
    },
    select: {
      id: true,
    },
  });

  if (!followedUser) {
    throw new HttpError(404, { message: 'User not found' });
  }

  const existingFollow = await prisma.follow.findUnique({
    where: {
      followerId_followedId: {
        followerId: userId,
        followedId: followedUser.id,
      },
    },
  });

  if (!existingFollow) {
    throw new HttpError(400, { message: 'Not following given user' });
  }

  const follow = await prisma.follow.delete({
    where: {
      followerId_followedId: {
        followerId: userId,
        followedId: followedUser.id,
      },
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

const getUserRecommendations = async (userId: string): Promise<IUser[]> => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      followed: true,
      memberships: true,
    },
  });

  const followedUserIds = user.followed.map(user => user.followedId);

  const recommendedUsers = await prisma.user.findMany({
    where: {
      id: { notIn: [userId, ...followedUserIds] },
      followers: {
        some: { followerId: { in: followedUserIds } },
      },
    },
    select: {
      username: true,
    },
    take: 15,
  });

  return recommendedUsers;
};

const getUserFeed = async (userId: string): Promise<IPost[]> => {
  const joinedCommunityAndFollowedIds = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      memberships: {
        select: {
          communityId: true,
        },
      },
      followed: {
        select: {
          followedId: true,
        },
      },
    },
  });

  const joinedCommunityIds = joinedCommunityAndFollowedIds.memberships.map(membership => membership.communityId);
  const followedUserIds = joinedCommunityAndFollowedIds.followed.map(followed => followed.followedId);

  const feedPosts = await prisma.post.findMany({
    where: {
      OR: [
        {
          communityId: { in: joinedCommunityIds },
        },
        {
          userId: { in: followedUserIds },
        },
      ],
    },
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
    orderBy: {
      createdAt: 'desc',
    },
  });

  return feedPosts;
};

export { getUser, followUser, unfollowUser, getUserRecommendations, getUserFeed };
