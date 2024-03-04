import HttpError from '../utils/httpError';
import prisma from '../config/db';
import { IUser } from '../interfaces/IUser';

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

export { getUser };
