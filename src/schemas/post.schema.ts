import { object, string } from 'yup';

const createPostSchema = object({
  body: object({
    communityName: string()
      .max(40, 'Community name can be 40 characters maximum')
      .required('Community name is required'),
    title: string().max(180, 'Post title can be 180 characters maximum').required('Title is required'),
    content: string().max(1000, 'Content can be 1000 characters maximum').notRequired(),
  }),
});

const getPostSchema = object({
  params: object({
    postId: string().max(200, 'Post id can be 200 characters maximum').required('Post id is required'),
  }),
});

const deletePostSchema = object({
  params: object({
    postId: string().max(200, 'Post id can be 200 characters maximum').required('Post id is required'),
  }),
});

const upvotePostSchema = object({
  params: object({
    postId: string().max(200, 'Post id can be 200 characters maximum').required('Post id is required'),
  }),
});

const downvotePostSchema = object({
  params: object({
    postId: string().max(200, 'Post id can be 200 characters maximum').required('Post id is required'),
  }),
});

const createCommentSchema = object({
  params: object({
    postId: string().max(200, 'Post id can be 200 characters maximum').required('Post id is required'),
  }),
  body: object({
    content: string().max(750, 'Comment can be 750 characters maximum').required('Content is required'),
  }),
});

const deleteCommentSchema = object({
  params: object({
    commentId: string().max(200, 'Post id can be 200 characters maximum').required('Post id is required'),
  }),
});

export {
  createPostSchema,
  getPostSchema,
  deletePostSchema,
  upvotePostSchema,
  downvotePostSchema,
  createCommentSchema,
  deleteCommentSchema,
};
