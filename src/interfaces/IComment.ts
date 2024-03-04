import { IUser } from './IUser';

export interface IComment {
  id: string;
  user: IUser;
  content: string;
  createdAt: Date;
}
