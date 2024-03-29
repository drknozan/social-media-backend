import {
  createComment,
  createPost,
  deleteComment,
  deletePost,
  downvotePost,
  getPost,
  upvotePost,
} from '../src/services/post.service';
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

test('Increases the downvote count by one and creates activity', async () => {
  const userId = '1';
  const postId = '1';
  const slug = 'test';

  await downvotePost(slug, userId);

  const downvotedPost = await prisma.post.findUnique({
    where: {
      slug,
    },
  });

  expect(downvotedPost).toHaveProperty('downvotes', 1);

  const createdActivity = await prisma.activity.findFirst({
    where: {
      userId,
      postId,
      activityType: 'DOWNVOTE',
    },
  });

  expect(createdActivity).not.toBeNull();
});

test('throws an error if user already downvoted post', async () => {
  expect.assertions(2);

  const userId = '1';
  const slug = 'test';

  await downvotePost(slug, userId);

  try {
    await downvotePost(slug, userId);
  } catch (error) {
    expect(error.statusCode).toBe(400);
    expect(error.message.message).toBe('User already downvoted this post');
  }
});

test('creates comment and creates activity', async () => {
  const content = 'test-content';
  const userId = '2';
  const postId = '1';
  const slug = 'test';

  await createComment(content, slug, userId);

  await prisma.comment.findFirst({
    where: {
      userId,
      postId,
      content,
    },
    select: {
      content: true,
    },
  });

  const createdActivity = await prisma.activity.findFirst({
    where: {
      userId,
      postId,
      activityType: 'COMMENT',
    },
  });

  expect(content).toEqual(content);
  expect(createdActivity).not.toBeNull();
});

test('throws an error if post is not found while creating comment', async () => {
  expect.assertions(2);

  const content = 'test-content';
  const userId = '2';
  const slug = 'wrong';

  try {
    await createComment(content, slug, userId);
  } catch (error) {
    expect(error.statusCode).toBe(404);
    expect(error.message.message).toBe('Post not found');
  }
});

test('deletes comment', async () => {
  const userId = '1';
  const commentId = '1';

  await deleteComment(commentId, userId);

  const deletedComment = await prisma.comment.findFirst({
    where: {
      id: commentId,
    },
  });

  expect(deletedComment).toBeNull();
});

test('throws an error if there is no comment', async () => {
  const commentId = '2';
  const userId = '1';

  try {
    await deleteComment(commentId, userId);
  } catch (error) {
    expect(error.statusCode).toBe(404);
    expect(error.message.message).toBe('Comment not found');
  }
});

test('throws an error if the user is not the owner of the comment', async () => {
  const userId = '2';
  const commentId = '1';

  try {
    await deleteComment(commentId, userId);
  } catch (error) {
    expect(error.statusCode).toBe(403);
    expect(error.message.message).toBe('Not authorized to delete comment');
  }
});
