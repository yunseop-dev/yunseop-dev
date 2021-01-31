import {
  gql
} from 'apollo-server-azure-functions';

const typeDefs = gql`
scalar DateTime
scalar EmailAddress
scalar UnsignedInt

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
  User's e-mail address.
  """
  email: EmailAddress @column(overrideType: "string")

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
}
`;

export default typeDefs;