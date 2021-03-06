import { gql } from 'apollo-server-azure-functions';

export default gql`
  enum SocialType {
    GITHUB
    FACEBOOK
    TWITTER
    GOOGLE
    EMAIL
  }

  type Post {
    id: ID!
    title: String!
    content: String!
    author: User!
    publishedAt: String
    likedBy: [User]!
    comments: [Comment]
  }
  type Comment {
    id: ID!
    createdAt: String!
    user: User!
    content: String!
  }
  type Like {
    id: ID!
    createdAt: String!
    username: String!
  }
  type Account {
    id: ID!
    email: String
    socialType: SocialType!
    user: User!
    password: String
  }
  type AccountWithToken {
    account: Account!
    token: String!
  }
  type User {
    id: ID!
    firstName: String!
    lastName: String!
    following: [User]
    accounts: [Account]
  }
  input RegisterInput {
    username: String!
    password: String!
    confirmPassword: String!
    email: String!
  }
  type Query {
    posts: [Post]
    post(postId: ID!): Post
    my: Account
  }
  type Mutation {
    # register(registerInput: RegisterInput): User!
    login(email: String!, password: String!): AccountWithToken!
    createPost(content: String!, title: String!): Post!
    deletePost(postId: ID!): String!
    createComment(postId: String!, content: String!): Post!
    deleteComment(postId: ID!, commentId: ID!): Post!
    likePost(postId: ID!): Post!
  }
  type Subscription {
    newPost: Post!
  }
`;