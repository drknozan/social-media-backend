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

export { createPost };
