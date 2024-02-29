import prisma from '../src/config/db';
import { createCommunity, getCommunity, createMembership } from '../src/services/community.service';

beforeAll(async () => {
  const createUser = prisma.user.create({
    data: {
      username: 'community-user',
      email: 'community-user@test.com',
      password: '$2a$10$i4hvrPqEHkQNJ9.QzLOnx.nWs0Z9v3oqXEF1np3Fzj7qMJZN0qXca', // hashed "testuser"
    },
  });

  const createCommunity = prisma.community.create({
    data: {
      name: 'test-community',
      description: 'test-description',
    },
  });

  return await prisma.$transaction([createUser, createCommunity]);
});

afterAll(async () => {
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

  const userByUsername = await prisma.user.findFirst({
    where: {
      username: 'community-user',
    },
  });

  const membership = await createMembership(communityName, userByUsername!.id);

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

  const userByUsername = await prisma.user.findFirst({
    where: {
      username: 'community-user',
    },
  });

  try {
    await createMembership(nonExistingCommunityName, userByUsername!.id);
  } catch (error) {
    expect(error.statusCode).toBe(400);
    expect(error.message).toBe('No community found with given given name');
  }
});
