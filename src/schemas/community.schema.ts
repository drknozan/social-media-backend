import { mixed, object, string } from 'yup';

const createCommunitySchema = object({
  body: object({
    communityName: string()
      .max(40, 'Community name can be 40 characters maximum')
      .required('Community name is required'),
    description: string()
      .max(360, 'Community description can be 360 characters maximum')
      .required('Community decription is required'),
  }),
});

const getCommunitySchema = object({
  params: object({
    name: string().max(40, 'Community name can be 40 characters maximum').required('Community name is required'),
  }),
});

const getCommunitiesSchema = object({
  query: object({
    q: string().max(40, 'Community name can be 40 characters maximum'),
  }),
});

const createMembershipSchema = object({
  body: object({
    communityName: string()
      .max(40, 'Community name can be 40 characters maximum')
      .required('Community name must be provided'),
  }),
});

const updateMembershipSchema = object({
  body: object({
    communityName: string()
      .max(40, 'Community name can be 40 characters maximum')
      .required('Community name is required'),
    updateUser: string().max(18, 'Username can be 18 characters maximum').required('Username is required'),
    role: mixed().oneOf(['MEMBER', 'MODERATOR', 'FOUNDER']).required('Role is required'),
  }),
});

const deleteMembershipSchema = object({
  body: object({
    communityName: string()
      .max(40, 'Community name can be 40 characters maximum')
      .required('Community name is required'),
  }),
});

export {
  createCommunitySchema,
  getCommunitySchema,
  getCommunitiesSchema,
  createMembershipSchema,
  updateMembershipSchema,
  deleteMembershipSchema,
};
