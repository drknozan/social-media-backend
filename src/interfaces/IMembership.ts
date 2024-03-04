import { ICommunity } from './ICommunity';
import { IUser } from './IUser';

export interface IMembership {
  community: ICommunity;
  user: IUser;
  role: 'MEMBER' | 'MODERATOR' | 'FOUNDER';
}
