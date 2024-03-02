import { IPost } from '../interfaces/IPost';
import HttpError from '../utils/httpError';
import { nanoid } from 'nanoid';
import slugify from 'slugify';

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

export { createPost, getPost, deletePost };
