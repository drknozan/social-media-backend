import prisma from '../../src/config/db';
import { IUser } from '../interfaces/IUser';
import * as bcrypt from 'bcryptjs';
import generateToken from '../utils/generateToken';
import HttpError from '../utils/httpError';
import { IProfile } from '@/interfaces/IProfile';

const register = async (username: string, email: string, password: string): Promise<{ user: IUser; token: string }> => {
  const existingUserByUsername = await prisma.user.findUnique({
    where: {
      username,
    },
    select: {
      username: true,
    },
  });

  const existingUserByEmail = await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      username: true,
    },
  });

  if (existingUserByUsername) {
    throw new HttpError(422, { message: 'Username has already been taken' });
  }

  if (existingUserByEmail) {
    throw new HttpError(422, { message: 'Email has already been taken' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const createdUser = await prisma.user.create({
    data: {
      username: username,
      email: email,
      password: hashedPassword,
    },
  });

  const token = generateToken(createdUser.id);

  return {
    user: {
      username: createdUser.username,
      profileVisibility: createdUser.profileVisibility,
    },
    token,
  };
};

const login = async (email: string, password: string): Promise<{ user: IUser; token: string }> => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (user) {
    const comparePassword = await bcrypt.compare(password, user.password);

    if (comparePassword) {
      const token = generateToken(user.id);

      return {
        user: {
          username: user.username,
          profileVisibility: user.profileVisibility,
        },
        token,
      };
    } else {
      throw new HttpError(400, { message: 'Password is wrong' });
    }
  } else {
    throw new HttpError(400, { message: 'No user found with given email' });
  }
};

const getCurrentUser = async (userId: string): Promise<IUser> => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      username: true,
    },
  });

  return user;
};

const getCurrentUserProfile = async (userId: string): Promise<IProfile> => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      username: true,
      email: true,
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
      followed: {
        select: {
          followed: {
            select: {
              username: true,
            },
          },
        },
      },
      followers: {
        select: {
          follower: {
            select: {
              username: true,
            },
          },
        },
      },
      memberships: {
        select: {
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
          role: true,
        },
      },
      activities: {
        select: {
          post: {
            select: {
              slug: true,
              title: true,
            },
          },
          activityType: true,
          createdAt: true,
        },
      },
    },
  });

  return user;
};

const updateUser = async (userInput, userId: string): Promise<IProfile> => {
  const { email, password, profileVisibility, bio } = userInput;

  let hashedPassword;

  if (password) {
    hashedPassword = await bcrypt.hash(password, 10);
  }

  const user = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      email: email || undefined,
      password: hashedPassword || undefined,
      profileVisibility: profileVisibility || undefined,
      bio: bio || undefined,
    },
    select: {
      username: true,
      email: true,
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
      followed: {
        select: {
          followed: {
            select: {
              username: true,
            },
          },
        },
      },
      followers: {
        select: {
          follower: {
            select: {
              username: true,
            },
          },
        },
      },
      memberships: {
        select: {
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
          role: true,
        },
      },
      activities: {
        select: {
          post: {
            select: {
              slug: true,
              title: true,
            },
          },
          activityType: true,
          createdAt: true,
        },
      },
    },
  });

  return user;
};

export { register, login, getCurrentUser, getCurrentUserProfile, updateUser };
