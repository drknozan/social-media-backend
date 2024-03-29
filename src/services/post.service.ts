import { IComment } from '../interfaces/IComment';
import { IPost } from '../interfaces/IPost';
import HttpError from '../utils/httpError';
import { nanoid } from 'nanoid';
import slugify from 'slugify';
import redisClient from '../config/redis';

const createPost = async (communityName: string, title: string, content: string, userId: string): Promise<IPost> => {
  const communityByName = await prisma.community.findUnique({
    where: {
      name: communityName,
    },
    select: {
      memberships: {
        select: {
          userId: true,
        },
      },
    },
  });

  if (!communityByName) {
    throw new HttpError(400, 'No community found with given name');
  }

  const userIsMember = communityByName.memberships.some(member => member.userId === userId);

  if (!userIsMember) {
    throw new HttpError(400, { message: 'Current user not member of given community' });
  }

  const slug = `${slugify(title)}-${nanoid()}`;

  const newPost = await prisma.post.create({
    data: {
      slug,
      title,
      content,
      user: { connect: { id: userId } },
      community: { connect: { name: communityName } },
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
  });

  redisClient.del(communityName);

  return newPost;
};

const getPost = async (slug: string): Promise<IPost> => {
  const post = await prisma.post.findUnique({
    where: {
      slug,
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
      comments: {
        select: {
          id: true,
          content: true,
          createdAt: true,
          user: {
            select: {
              username: true,
            },
          },
        },
      },
      community: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!post) {
    throw new HttpError(400, { message: 'Post not found' });
  }

  return post;
};

const deletePost = async (slug: string, userId: string): Promise<IPost> => {
  const postBySlug = await prisma.post.findFirst({
    where: {
      slug,
    },
    select: {
      userId: true,
    },
  });

  if (!postBySlug) {
    throw new HttpError(404, { message: 'Post not found' });
  }

  if (userId !== postBySlug.userId) {
    throw new HttpError(403, { message: 'Not authorized to delete post' });
  }

  const deletedPost = await prisma.post.delete({
    where: { slug },
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
  });

  return deletedPost;
};

const upvotePost = async (slug: string, userId: string): Promise<IPost> => {
  const postBySlug = await prisma.post.findFirst({
    where: {
      slug,
    },
    select: {
      id: true,
    },
  });

  if (!postBySlug) {
    throw new HttpError(404, { message: 'Post not found' });
  }

  const existingActivity = await prisma.activity.findFirst({
    where: {
      userId,
      postId: postBySlug.id,
      activityType: 'UPVOTE',
    },
    select: {
      id: true,
    },
  });

  if (existingActivity) {
    throw new HttpError(400, { message: 'User already upvoted this post' });
  }

  const post = await prisma.post.update({
    where: {
      slug,
    },
    data: {
      upvotes: {
        increment: 1,
      },
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
  });

  await prisma.activity.create({
    data: {
      userId,
      postId: postBySlug.id,
      activityType: 'UPVOTE',
    },
  });

  return post;
};

const downvotePost = async (slug: string, userId: string): Promise<IPost> => {
  const postBySlug = await prisma.post.findFirst({
    where: {
      slug,
    },
    select: {
      id: true,
    },
  });

  if (!postBySlug) {
    throw new HttpError(404, { message: 'Post not found' });
  }

  const existingActivity = await prisma.activity.findFirst({
    where: {
      userId,
      postId: postBySlug.id,
      activityType: 'DOWNVOTE',
    },
    select: {
      id: true,
    },
  });

  if (existingActivity) {
    throw new HttpError(400, { message: 'User already downvoted this post' });
  }

  const post = await prisma.post.update({
    where: {
      slug,
    },
    data: {
      downvotes: {
        increment: 1,
      },
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
  });

  await prisma.activity.create({
    data: {
      userId,
      postId: postBySlug.id,
      activityType: 'DOWNVOTE',
    },
  });

  return post;
};

const createComment = async (content: string, slug: string, userId: string): Promise<IComment> => {
  const postBySlug = await prisma.post.findUnique({
    where: {
      slug,
    },
    select: {
      id: true,
    },
  });

  if (!postBySlug) {
    throw new HttpError(404, { message: 'Post not found' });
  }

  const comment = await prisma.comment.create({
    data: {
      content,
      postId: postBySlug.id,
      userId,
    },
    select: {
      id: true,
      content: true,
      createdAt: true,
      user: {
        select: {
          username: true,
        },
      },
      post: {
        select: {
          slug: true,
        },
      },
    },
  });

  await prisma.activity.create({
    data: {
      userId,
      postId: postBySlug.id,
      activityType: 'COMMENT',
    },
  });

  return comment;
};

const deleteComment = async (commentId: string, userId: string): Promise<IComment> => {
  const commentById = await prisma.comment.findUnique({ where: { id: commentId }, select: { userId: true } });

  if (!commentById) {
    throw new HttpError(404, { message: 'Comment not found' });
  }

  if (userId !== commentById.userId) {
    throw new HttpError(403, { message: 'Not authorized to delete comment' });
  }

  const comment = await prisma.comment.delete({
    where: { id: commentId },
    select: {
      id: true,
      user: { select: { username: true } },
      content: true,
      createdAt: true,
    },
  });

  return comment;
};

export { createPost, getPost, deletePost, upvotePost, downvotePost, createComment, deleteComment };
