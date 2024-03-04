import { object, string } from 'yup';

const getUserSchema = object({
  params: object({
    username: string().max(18, 'Username can be 18 characters maximum').required('Username is required'),
  }),
});

const followUserSchema = object({
  body: object({
    username: string().max(18, 'Username can be 18 characters maximum').required('Username is required'),
  }),
});

const unFollowUserSchema = object({
  body: object({
    username: string().max(18, 'Username can be 18 characters maximum').required('Username is required'),
  }),
});

export { getUserSchema, followUserSchema, unFollowUserSchema };
