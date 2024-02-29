export interface IMembership {
  username: string;
  communityName: string;
  role: 'MEMBER' | 'MODERATOR' | 'FOUNDER';
}
