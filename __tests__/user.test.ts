import { followUser, getUser, getUserFeed, getUserRecommendations, unfollowUser } from '../src/services/user.service';
import prisma from '../src/config/db';

beforeEach(async () => {
  const createUsers = prisma.user.createMany({
    data: [
      {
        id: '1',
        username: 'user',
        email: 'user@test.com',
        password: 'testuser',
      },
      {
        id: '2',
        username: 'user2',
        email: 'user2@test.com',
        password: 'testuser',
      },
      {
        id: '3',
        username: 'user3',
        email: 'user3@test.com',
        password: 'testuser',
      },
    ],
  });

  const createCommunities = prisma.community.createMany({
    data: [
      {
        id: '1',
        name: 'community',
        description: 'description',
      },
      {
        id: '2',
        name: 'community2',
        description: 'description',
      },
    ],
  });

  const createPosts = prisma.post.createMany({
    data: [
      {
        id: '1',
        slug: 'test',
        userId: '1',
        communityId: '1',
        title: 'test-title',
        content: 'test-content',
      },
      {
        id: '2',
        slug: 'test2',
        userId: '3',
        communityId: '2',
        title: 'test-title',
        content: 'test-content',
      },
    ],
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

test('unfollows user', async () => {
  const userId = '1';
  const usernameToUnFollow = 'user2';
  const userIdToUnFollow = '2';

  await prisma.follow.create({
    data: {
      followedId: userIdToUnFollow,
      followerId: userId,
    },
  });

  await unfollowUser(usernameToUnFollow, userId);

  const unfollow = await prisma.follow.findUnique({
    where: {
      followerId_followedId: {
        followerId: userId,
        followedId: userIdToUnFollow,
      },
    },
  });

  expect(unfollow).toBeNull();
});

test('throws an error if user not following given user', async () => {
  const userId = '1';
  const usernameToUnFollow = 'user2';

  try {
    await unfollowUser(usernameToUnFollow, userId);
  } catch (error) {
    expect(error.statusCode).toBe(400);
    expect(error.message.message).toBe('Not following given user');
  }
});

test('recommends followed users of following users', async () => {
  const firstUserId = '1';
  const secondUserId = '2';
  const secondUsername = 'user2';
  const thirdUsername = 'user3';

  await followUser(secondUsername, firstUserId);
  await followUser(thirdUsername, secondUserId);

  const recommendedUsers = await getUserRecommendations(firstUserId);

  expect(recommendedUsers[0]).toHaveProperty('id', '3');
});

test('gets user feed', async () => {
  const secondUserId = '2';
  const firstUsername = 'user';
  const communityId = '2';

  await followUser(firstUsername, secondUserId);

  await prisma.membership.create({
    data: {
      userId: secondUserId,
      communityId: communityId,
      role: 'MEMBER',
    },
  });

  const feedPosts = await getUserFeed(secondUserId);

  expect(feedPosts[0]).toHaveProperty('slug', 'test');
  expect(feedPosts[1]).toHaveProperty('slug', 'test2');
});
