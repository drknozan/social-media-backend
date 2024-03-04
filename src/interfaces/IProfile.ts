import { IMembership } from './IMembership';
import { IPost } from './IPost';
import { IActivity } from './IActivity';
import { IFollow } from './IFollow';

export interface IProfile {
  username: string;
  email: string;
  profileVisibility: boolean;
  allowDm: boolean;
  posts: IPost[];
  followed: IFollow[];
  followers: IFollow[];
  memberships: IMembership[];
  activities: IActivity[];
}
