import express, { NextFunction, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import HttpError from './utils/httpError';
import routes from './routes';
import morgan from 'morgan';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

app.use(express.json());

app.use(cookieParser());

app.use(morgan('combined'));

// API routes
app.use(routes);

// Catch 404
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(process.env.YO);
  next(new HttpError(404, 'Not found'));
});

// Error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
  return res.status(err.statusCode).send(err.message);
});

export default app;
