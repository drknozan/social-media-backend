import { boolean, object, string } from 'yup';

const getUserSchema = object({
  params: object({
    username: string().max(18, 'Username can be 18 characters maximum').required('Username is required'),
  }),
});

const updateUserSchema = object({
  body: object({
    username: string().max(18, 'Username can be 18 characters maximum').optional(),
    password: string()
      .min(8, 'Password must be 8 characters minimum')
      .max(30, 'Password can be 30 characters maximum')
      .optional(),
    email: string().email('No a valid email').optional(),
    allowDm: boolean().optional(),
    profileVisiblity: boolean().optional(),
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

export { getUserSchema, updateUserSchema, followUserSchema, unFollowUserSchema };
