import { createPost } from '../src/services/post.service';
import prisma from '../src/config/db';

beforeEach(async () => {
  await prisma.user.createMany({
    data: [
      {
        id: '1',
        username: 'user',
        email: 'user@test.com',
        password: '$2a$10$i4hvrPqEHkQNJ9.QzLOnx.nWs0Z9v3oqXEF1np3Fzj7qMJZN0qXca', // hashed "testuser"
      },
    ],
  });

  await prisma.community.create({
    data: {
      id: '1',
      name: 'community',
      description: 'description',
    },
  });
});

afterEach(async () => {
  const deleteUsers = prisma.user.deleteMany();
  const deleteCommunities = prisma.community.deleteMany();

  return await prisma.$transaction([deleteUsers, deleteCommunities]);
});

test('creates new post', async () => {
  const userId = '1';
  const communityName = 'community';
  const communityId = '1';
  const title = 'post title';
  const content = 'post content';

  await prisma.membership.create({
    data: {
      userId: '1',
      communityId: '1',
      role: 'MEMBER',
    },
  });

  const createdPost = await createPost(communityName, title, content, userId);

  const newPost = await prisma.post.findFirst({
    where: {
      userId,
      communityId,
      title,
      content,
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

  expect(createdPost).toEqual(newPost);
});

test('throws an error if a user not member when creating post', async () => {
  expect.assertions(2);

  const userId = '1';
  const communityName = 'community';
  const title = 'post title';
  const content = 'post content';

  try {
    await createPost(communityName, title, content, userId);
  } catch (error) {
    expect(error.statusCode).toBe(400);
    expect(error.message.message).toBe('Current user not member of given community');
  }
});