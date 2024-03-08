import express, { NextFunction, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import HttpError from './utils/httpError';
import routes from './routes';
import morgan from 'morgan';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

app.use(helmet());

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(morgan('combined'));

// API routes
app.use(routes);

// Catch 404
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new HttpError(404, 'Not found'));
});

// Error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: HttpError | Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof HttpError) {
    return res.status(err.statusCode).send(err.message);
  } else {
    return res.status(500).send({ message: 'Something went wrong' });
  }
});

export default app;
