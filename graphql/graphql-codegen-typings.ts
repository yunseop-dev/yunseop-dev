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
  likedBy?: Maybe<Array<Maybe<User>>>;
};

export type Query = {
  __typename?: 'Query';
  /** Get post by ID. */
  post?: Maybe<Post>;
  user?: Maybe<User>;
  signIn?: Maybe<User>;
};


export type QueryPostArgs = {
  id: Scalars['ID'];
};


export type QueryUserArgs = {
  id: Scalars['ID'];
};


export type QuerySignInArgs = {
  email: Scalars['String'];
  password: Scalars['String'];
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
  likePost: Scalars['UnsignedInt'];
  signUp?: Maybe<User>;
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
  likedBy?: Maybe<Array<Maybe<UserDbObject['_id']>>>,
};
