import {
  gql
} from 'apollo-server-azure-functions';

const typeDefs = gql`
scalar DateTime
scalar EmailAddress
scalar UnsignedInt

enum SocialType {
  GITHUB
  FACEBOOK
  TWITTER
  GOOGLE
  EMAIL
}

type Account @entity {
  id: ID! @id
  """
  User's e-mail address.
  """
  email: EmailAddress @column(overrideType: "string")
  socialType: SocialType! @column
  user: User! @link
  password: String @column
}

type User @entity {
  """
  User ID.
  """
  id: ID! @id

  """
  User's first name.
  """
  firstName: String! @column

  """
  User's last name.
  """
  lastName: String! @column

  """
  Posts published by user.
  """
  posts: [Post]

  """
  Users that this user is following.
  """
  following: [User] @link

  """
  Users that this user is followed by.
  """
  followers: [User]

  accounts: [Account] @link
}

type Post @entity {
  """
  Post ID.
  """
  id: ID! @id

  """
  Post title.
  """
  title: String! @column

  """
  Post content.
  """
  content: String! @column

  """
  Post Author.
  """
  author: User! @link

  """
  Post published timestamp.
  """
  publishedAt: DateTime @column(overrideType: "Date")

  """
  Users who like this post.
  """
  likedBy: [User] @link
}

type Query {
  """
  Get post by ID.
  """
  post(id: ID!): Post
  user(id: ID!): User
  signIn(email: String!, password: String!): User
}

"""
Publish post input.
"""
input PublishPostInput {
  """
  Post title.
  """
  title: String!

  """
  Post content.
  """
  content: String!
}

input SignUpInput {
  firstName: String!
  lastName: String!
  email: EmailAddress!
  password: String
  socialType: SocialType!
}

type Mutation {
  """
  Publish post.
  """
  publishPost(input: PublishPostInput!): Post!

  """
  Follow user.
  Returns the updated number of followers.
  """
  followUser(
    """
    User's ID to follow.
    """
    userId: ID!
  ): UnsignedInt!

  """
  Unfollow user.
  Returns the updated number of followers.
  """
  unfollowUser(
    """
    User's ID to unfollow.
    """
    userId: ID!
  ): UnsignedInt!

  """
  Like post.
  Returns the updated number of likes received.
  """
  likePost(
    """
    Post's ID to like.
    """
    postId: ID!
  ): UnsignedInt!

  signUp(input: SignUpInput!): User
}
`;

export default typeDefs;