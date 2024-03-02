import { createPost, deletePost, getPost, upvotePost } from '../src/services/post.service';
import prisma from '../src/config/db';

beforeEach(async () => {
  const createUsers = prisma.user.createMany({
    data: [
      {
        id: '1',
        username: 'user',
        email: 'user@test.com',
        password: '$2a$10$i4hvrPqEHkQNJ9.QzLOnx.nWs0Z9v3oqXEF1np3Fzj7qMJZN0qXca', // hashed "testuser"
      },
      {
        id: '2',
        username: 'user2',
        email: 'user2@test.com',
        password: '$2a$10$i4hvrPqEHkQNJ9.QzLOnx.nWs0Z9v3oqXEF1np3Fzj7qMJZN0qXca', // hashed "testuser"
      },
    ],
  });

  const createCommunities = prisma.community.create({
    data: {
      id: '1',
      name: 'community',
      description: 'description',
    },
  });

  const createPosts = prisma.post.create({
    data: {
      id: '1',
      slug: 'test',
      userId: '1',
      communityId: '1',
      title: 'test-title',
      content: 'test-content',
    },
  });

  return await prisma.$transaction([createUsers, createCommunities, createPosts]);
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

test('gets post by given slug', async () => {
  const slug = 'test';

  const post = await getPost(slug);

  expect(post.slug).toEqual(slug);
});

test('deletes post by given slug', async () => {
  const slug = 'test';
  const postOwnerId = '1';

  await deletePost(slug, postOwnerId);

  const deletedPost = await prisma.post.findFirst({
    where: {
      slug,
    },
  });

  expect(deletedPost).toBeNull();
});

test('throws an error if the user does not own the post', async () => {
  expect.assertions(2);

  const slug = 'test';
  const userId = '2';

  try {
    await deletePost(slug, userId);
  } catch (error) {
    expect(error.statusCode).toBe(403);
    expect(error.message.message).toBe('Not authorized to delete post');
  }
});

test('Increases the upvote count by one and creates activity', async () => {
  const userId = '1';
  const postId = '1';
  const slug = 'test';

  await upvotePost(slug, userId);

  const upvotedPost = await prisma.post.findUnique({
    where: {
      slug,
    },
  });

  expect(upvotedPost).toHaveProperty('upvotes', 1);

  const createdActivity = await prisma.activity.findFirst({
    where: {
      userId,
      postId,
      activityType: 'UPVOTE',
    },
  });

  expect(createdActivity).not.toBeNull();
});

test('throws an error if user already upvoted post', async () => {
  expect.assertions(2);

  const userId = '1';
  const slug = 'test';

  await upvotePost(slug, userId);

  try {
    await upvotePost(slug, userId);
  } catch (error) {
    expect(error.statusCode).toBe(400);
    expect(error.message.message).toBe('User already upvoted this post');
  }
});
