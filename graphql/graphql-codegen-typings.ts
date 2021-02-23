export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  DateTime: any;
  EmailAddress: any;
  UnsignedInt: any;
};












export enum SocialType {
  Github = 'GITHUB',
  Facebook = 'FACEBOOK',
  Twitter = 'TWITTER',
  Google = 'GOOGLE',
  Email = 'EMAIL'
}

export type Account = {
  __typename?: 'Account';
  id: Scalars['ID'];
  /** User's e-mail address. */
  email?: Maybe<Scalars['EmailAddress']>;
  socialType: SocialType;
  user: User;
  password?: Maybe<Scalars['String']>;
};

export type User = {
  __typename?: 'User';
  /** User ID. */
  id: Scalars['ID'];
  /** User's first name. */
  firstName: Scalars['String'];
  /** User's last name. */
  lastName: Scalars['String'];
  /** Posts published by user. */
  posts?: Maybe<Array<Maybe<Post>>>;
  /** Users that this user is following. */
  following?: Maybe<Array<Maybe<User>>>;
  /** Users that this user is followed by. */
  followers?: Maybe<Array<Maybe<User>>>;
  accounts?: Maybe<Array<Maybe<Account>>>;
};

export type Post = {
  __typename?: 'Post';
  /** Post ID. */
  id: Scalars['ID'];
  /** Post title. */
  title: Scalars['String'];
  /** Post content. */
  content: Scalars['String'];
  /** Post Author. */
  author: User;
  /** Post published timestamp. */
  publishedAt?: Maybe<Scalars['DateTime']>;
  /** Users who like this post. */
  likedBy?: Maybe<LikedByConnection>;
};


export type PostLikedByArgs = {
  after?: Maybe<Scalars['String']>;
  before?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<LikeByOrder>;
};

export type LikeByOrder = {
  field: LikeByOrderField;
  direction: OrderDirection;
};

export enum LikeByOrderField {
  CreatedAt = 'CREATED_AT'
}

export type LikedByConnection = {
  __typename?: 'LikedByConnection';
  edges?: Maybe<Array<Maybe<UserEdge>>>;
  nodes?: Maybe<Array<Maybe<User>>>;
  pageInfo: PageInfo;
  totalCount: Scalars['UnsignedInt'];
};

export type UserEdge = {
  __typename?: 'UserEdge';
  node?: Maybe<User>;
  cursor: Scalars['String'];
};

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['String']>;
  hasNextPage: Scalars['Boolean'];
  hasPreviousPage: Scalars['Boolean'];
  startCursor?: Maybe<Scalars['String']>;
};

export enum OrderField {
  PublishedAt = 'publishedAt'
}

export enum OrderDirection {
  Asc = 'ASC',
  Desc = 'DESC'
}

export type PostOrder = {
  field?: Maybe<OrderField>;
  direction?: Maybe<OrderDirection>;
};

export type Query = {
  __typename?: 'Query';
  /** Get post by ID. */
  post?: Maybe<Post>;
  posts?: Maybe<Array<Maybe<Post>>>;
  user?: Maybe<User>;
  my?: Maybe<Account>;
  account?: Maybe<Account>;
};


export type QueryPostArgs = {
  id: Scalars['ID'];
};


export type QueryPostsArgs = {
  offset?: Maybe<Scalars['Int']>;
  limit?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<PostOrder>;
  publishedSince?: Maybe<Scalars['DateTime']>;
  q?: Maybe<Scalars['String']>;
};


export type QueryUserArgs = {
  id: Scalars['ID'];
};


export type QueryAccountArgs = {
  id: Scalars['ID'];
};

/** Publish post input. */
export type PublishPostInput = {
  /** Post title. */
  title: Scalars['String'];
  /** Post content. */
  content: Scalars['String'];
};

export type SignUpInput = {
  firstName: Scalars['String'];
  lastName: Scalars['String'];
  email: Scalars['EmailAddress'];
  password?: Maybe<Scalars['String']>;
  socialType: SocialType;
};

export type Mutation = {
  __typename?: 'Mutation';
  /** Publish post. */
  publishPost: Post;
  /**
   * Follow user.
   * Returns the updated number of followers.
   */
  followUser: Scalars['UnsignedInt'];
  /**
   * Unfollow user.
   * Returns the updated number of followers.
   */
  unfollowUser: Scalars['UnsignedInt'];
  /**
   * Like post.
   * Returns the updated number of likes received.
   */
  likePost: Scalars['Boolean'];
  signUp?: Maybe<User>;
  signIn?: Maybe<Scalars['String']>;
};


export type MutationPublishPostArgs = {
  input: PublishPostInput;
};


export type MutationFollowUserArgs = {
  userId: Scalars['ID'];
};


export type MutationUnfollowUserArgs = {
  userId: Scalars['ID'];
};


export type MutationLikePostArgs = {
  postId: Scalars['ID'];
};


export type MutationSignUpArgs = {
  input: SignUpInput;
};


export type MutationSignInArgs = {
  email: Scalars['String'];
  password: Scalars['String'];
};

export type AdditionalEntityFields = {
  path?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['String']>;
};

import { ObjectID } from 'mongodb';
export type AccountDbObject = {
  _id: ObjectID,
  email?: string,
  socialType: string,
  user: UserDbObject['_id'],
  password?: Maybe<string>,
};

export type UserDbObject = {
  _id: ObjectID,
  firstName: string,
  lastName: string,
  following?: Maybe<Array<Maybe<UserDbObject['_id']>>>,
  accounts?: Maybe<Array<Maybe<AccountDbObject['_id']>>>,
};

export type PostDbObject = {
  _id: ObjectID,
  title: string,
  content: string,
  author: UserDbObject['_id'],
  publishedAt?: Date,
};
