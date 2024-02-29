import prisma from '../src/config/db';
import { createCommunity, getCommunity, createMembership, updateMembership } from '../src/services/community.service';

beforeEach(async () => {
  await prisma.user.createMany({
    data: [
      {
        id: '1',
        username: 'community-user',
        email: 'community-user@test.com',
        password: '$2a$10$i4hvrPqEHkQNJ9.QzLOnx.nWs0Z9v3oqXEF1np3Fzj7qMJZN0qXca', // hashed "testuser"
      },
      {
        id: '2',
        username: 'community-user2',
        email: 'community-user2@test.com',
        password: '$2a$10$i4hvrPqEHkQNJ9.QzLOnx.nWs0Z9v3oqXEF1np3Fzj7qMJZN0qXca', // hashed "testuser"
      },
      {
        id: '3',
        username: 'community-user-mod',
        email: 'community-user-mod@test.com',
        password: '$2a$10$i4hvrPqEHkQNJ9.QzLOnx.nWs0Z9v3oqXEF1np3Fzj7qMJZN0qXca', // hashed "testuser"
      },
    ],
  });

  await prisma.community.create({
    data: {
      id: '1',
      name: 'test-community',
      description: 'test-description',
    },
  });
});

afterEach(async () => {
  const deleteUsers = prisma.user.deleteMany();
  const deleteCommunities = prisma.community.deleteMany();

  return await prisma.$transaction([deleteUsers, deleteCommunities]);
});

test('creates a new community', async () => {
  const communityName = 'new community';
  const description = 'this is a new community';

  const createdCommunity = await createCommunity(communityName, description);

  const newCommunity = await prisma.community.findFirst({
    where: {
      name: communityName,
    },
  });

  expect(createdCommunity.name).toBe(communityName);
  expect(createdCommunity.description).toBe(description);
  expect(newCommunity).toHaveProperty('name', communityName);
});

test('fails to create a community with existing name', async () => {
  expect.assertions(2);

  const existingCommunityName = 'test-community';
  const existingCommunityDescription = 'This community already exists';

  try {
    await createCommunity(existingCommunityName, existingCommunityDescription);
  } catch (error) {
    expect(error.statusCode).toBe(400);
    expect(error.message.message).toBe('Community name already taken');
  }
});

test('gets an existing community', async () => {
  const communityName = 'test-community';

  const community = await getCommunity(communityName);

  expect(community.name).toBe(communityName);
});

test('fails to get a non-existing community', async () => {
  expect.assertions(2);

  const nonExistingCommunityName = 'NonExistingCommunity';

  try {
    await getCommunity(nonExistingCommunityName);
  } catch (error) {
    expect(error.statusCode).toBe(400);
    expect(error.message.message).toBe('No community found with given name');
  }
});

test('creates a membership for a user in a community', async () => {
  const communityName = 'test-community';
  const username = 'community-user';
  const userId = '1';

  const membership = await createMembership(communityName, userId);

  const newMembership = await prisma.membership.findFirst({
    where: {
      community: {
        name: communityName,
      },
      user: {
        username: username,
      },
    },
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
    },
  });

  expect(membership.username).toBe(username);
  expect(membership.communityName).toBe(communityName);
  expect(newMembership).toHaveProperty('user', { username: username });
  expect(newMembership).toHaveProperty('community', { name: communityName });
});

test('fails to create a membership for non-existing community', async () => {
  expect.assertions(2);

  const nonExistingCommunityName = 'NonExistingCommunity';
  const userId = '1';

  try {
    await createMembership(nonExistingCommunityName, userId);
  } catch (error) {
    expect(error.statusCode).toBe(400);
    expect(error.message.message).toBe('No community found with given given name');
  }
});

test('updates membership role successfully', async () => {
  const userCurrentId = '3';
  const usernameToUpdate = 'community-user2';
  const communityName = 'test-community';
  const roleToUpdate = 'MODERATOR';

  await prisma.membership.create({
    data: {
      userId: '2',
      communityId: '1',
      role: 'MEMBER',
    },
  });

  await prisma.membership.create({
    data: {
      userId: '3',
      communityId: '1',
      role: 'MODERATOR',
    },
  });

  const updatedMembership = await updateMembership(communityName, usernameToUpdate, roleToUpdate, userCurrentId);

  const createdMembership = await prisma.membership.findUnique({
    where: {
      userId_communityId: {
        userId: '2',
        communityId: '1',
      },
    },
    select: {
      user: {
        select: {
          username: true,
        },
      },
      community: {
        select: {
          name: true,
        },
      },
      role: true,
    },
  });

  expect(updatedMembership).toEqual({
    username: createdMembership?.user.username,
    communityName: createdMembership?.community.name,
    role: createdMembership?.role,
  });
  expect(updatedMembership).toEqual(
    expect.objectContaining({
      username: usernameToUpdate,
      communityName: communityName,
      role: roleToUpdate,
    }),
  );
});

test('throws error when current user role is MEMBER', async () => {
  expect.assertions(2);

  const userCurrentId = '1';
  const usernameToUpdate = 'community-user2';
  const communityName = 'test-community';
  const roleToUpdate = 'MODERATOR';

  await prisma.membership.create({
    data: {
      userId: '1',
      communityId: '1',
      role: 'MEMBER',
    },
  });

  await prisma.membership.create({
    data: {
      userId: '2',
      communityId: '1',
      role: 'MEMBER',
    },
  });

  try {
    await updateMembership(communityName, usernameToUpdate, roleToUpdate, userCurrentId);
  } catch (error) {
    expect(error.statusCode).toBe(403);
    expect(error.message.message).toBe('Not authorized to give community role');
  }
});

test('throws error when current user role is not member/moderator/founder of given community', async () => {
  expect.assertions(2);

  const userCurrentId = '1';
  const usernameToUpdate = 'community-user2';
  const communityName = 'test-community';
  const roleToUpdate = 'MODERATOR';

  await prisma.membership.create({
    data: {
      userId: '2',
      communityId: '1',
      role: 'MEMBER',
    },
  });

  try {
    await updateMembership(communityName, usernameToUpdate, roleToUpdate, userCurrentId);
  } catch (error) {
    expect(error.statusCode).toBe(400);
    expect(error.message.message).toBe('Current user not member of given community');
  }
});

test('throws error when user is already member of given community', async () => {
  expect.assertions(2);

  const userId = '1';
  const communityName = 'test-community';

  await prisma.membership.create({
    data: {
      userId,
      communityId: '1',
      role: 'MEMBER',
    },
  });

  try {
    await createMembership(communityName, userId);
  } catch (error) {
    expect(error.statusCode).toBe(400);
    expect(error.message.message).toBe('User is already member of given community');
  }
});
