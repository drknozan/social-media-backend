import { IPost } from './IPost';

export interface IActivity {
  post: IPost;
  activityType: 'UPVOTE' | 'DOWNVOTE' | 'COMMENT';
  createdAt: Date;
}
