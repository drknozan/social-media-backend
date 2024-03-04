import { IPost } from './IPost';

export interface IUser {
  username: string;
  profileVisibility?: boolean;
  allowDm?: boolean;
  posts?: IPost[];
  _count?: {
    followed: number;
    followers: number;
  };
}
