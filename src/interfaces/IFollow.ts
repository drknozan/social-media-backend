import { IUser } from './IUser';

export interface IFollow {
  followed?: IUser;
  follower?: IUser;
}
