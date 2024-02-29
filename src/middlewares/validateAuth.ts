import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

const validateAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.token;

  try {
    const jwtPayload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    req.user = jwtPayload.user;

    next();
  } catch (error) {
    res.clearCookie('token');

    return res.status(401).send('Unauthorized');
  }
};

export default validateAuth;
