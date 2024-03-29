import { boolean, object, string } from 'yup';

const registerSchema = object({
  body: object({
    username: string().max(18, 'Username can be 18 characters maximum').required('Username is required'),
    password: string()
      .min(8, 'Password must be 8 characters minimum')
      .max(30, 'Password can be 30 characters maximum')
      .required('Password is required'),
    email: string().min(5).email('Not a valid email').required('Email is required'),
  }),
});

const loginSchema = object({
  body: object({
    email: string().min(5, 'Not a valid email').email('Not a valid email').required('Email is required'),
    password: string()
      .min(8, 'Password must be 8 characters minimum')
      .max(30, 'Password can be 30 characters maximum')
      .required('Password is required'),
  }),
});

const updateUserSchema = object({
  body: object({
    password: string()
      .min(8, 'Password must be 8 characters minimum')
      .max(30, 'Password can be 30 characters maximum')
      .optional(),
    email: string().email('No a valid email').optional(),
    profileVisiblity: boolean().optional(),
    bio: string().max(50, 'Bio can be 50 characters maximum').optional(),
  }),
});

export { registerSchema, loginSchema, updateUserSchema };
