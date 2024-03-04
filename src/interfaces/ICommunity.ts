import { IPost } from './IPost';

export interface ICommunity {
  name: string;
  description?: string;
  createdAt?: Date;
  posts?: IPost[];
}
