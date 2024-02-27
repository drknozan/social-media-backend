import * as jwt from 'jsonwebtoken';

const generateToken = (id: string): string =>
  jwt.sign({ user: { id } }, process.env.JWT_SECRET!, {
    expiresIn: '1d',
  });

export default generateToken;
