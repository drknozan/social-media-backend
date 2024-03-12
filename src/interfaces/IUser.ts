import { IPost } from './IPost';

export interface IUser {
  username: string;
  profileVisibility?: boolean;
  bio?: string;
  posts?: IPost[];
  _count?: {
    followed: number;
    followers: number;
  };
}
