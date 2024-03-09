import { ICommunity } from './ICommunity';
import { IUser } from './IUser';

export interface IPost {
  slug: string;
  title: string;
  content?: string;
  upvotes?: number;
  downvotes?: number;
  createdAt?: Date;
  user?: IUser;
  community?: ICommunity;
}
