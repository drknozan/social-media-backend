import { followUser, getUser } from '../src/services/user.service';
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

  const createComments = prisma.comment.create({
    data: {
      id: '1',
      postId: '1',
      userId: '1',
      content: 'test-comment',
    },
  });

  return await prisma.$transaction([createUsers, createCommunities, createPosts, createComments]);
});

afterEach(async () => {
  const deleteUsers = prisma.user.deleteMany();
  const deleteCommunities = prisma.community.deleteMany();

  return await prisma.$transaction([deleteUsers, deleteCommunities]);
});

test('gets user', async () => {
  const username = 'user';

  const user = await getUser(username);

  expect(user.username).toEqual(username);
});

test('throws an error if user not found', async () => {
  expect.assertions(2);

  const username = 'wrong';

  try {
    await getUser(username);
  } catch (error) {
    expect(error.statusCode).toBe(404);
    expect(error.message.message).toBe('User not found');
  }
});

test('removes posts if userVisibility is set to false', async () => {
  const username = 'user';

  const user = await getUser(username);

  expect(user.posts).toBeUndefined();
});

test('follows user', async () => {
  const userId = '1';
  const usernameToFollow = 'user2';
  const userIdToFollow = '2';

  await followUser(usernameToFollow, userId);

  const follow = await prisma.follow.findUnique({
    where: {
      followerId_followedId: {
        followedId: userIdToFollow,
        followerId: userId,
      },
    },
  });

  expect(follow?.followedId).toEqual(userIdToFollow);
  expect(follow?.followerId).toEqual(userId);
});

test('throws an error if user already following', async () => {
  expect.assertions(2);

  const userId = '1';
  const usernameToFollow = 'user2';

  await followUser(usernameToFollow, userId);

  try {
    await followUser(usernameToFollow, userId);
  } catch (error) {
    expect(error.statusCode).toBe(400);
    expect(error.message.message).toBe('User is already following');
  }
});
