import { object, string } from 'yup';

const registerSchema = object({
  body: object({
    username: string().max(18, 'Username can be 18 characters maximum').required('Username is required'),
    password: string()
      .min(8, 'Password must be 8 characters minimum')
      .max(30, 'Password can be 30 characters maximum')
      .required('Password is required'),
    email: string().min(5).email('Not a valid email').required('Email is requred'),
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

export { registerSchema, loginSchema };
