import { ApolloServer, gql, makeExecutableSchema } from 'apollo-server-micro';

require('dotenv').config();
const postgres = require('postgres');
const sql = postgres();

const typeDefs = gql`
  type Query {
    users: [User!]!
    user(username: String): User
    todos: [Todo]
  }

  type Mutation {
    createTodo(title: String, checked: Boolean): Todo
    updateTodo(id: ID!, title: String, checked: Boolean): Todo
  }

  type User {
    name: String
    username: String
  }

  type Todo {
    id: ID
    title: String
    checked: Boolean
  }
`;
const users = [
  { name: 'Leeroy Jenkins', username: 'leeroy' },
  { name: 'Foo Bar', username: 'foobar' },
];
async function getTodos() {
  return await sql`select * from todos`;
}
async function createTodo(title, checked) {
  const createValue =
    await sql`INSERT INTO todos (title, checked) VALUES (${title}, ${checked}) RETURNING id, title, checked`;
  return createValue[0];
}
async function updateTodo(id, title, checked) {
  const updateValue =
    await sql`UPDATE todos SET title = ${title}, checked = ${checked} WHERE id = ${parseInt(
      id,
    )} RETURNING id, title, checked`;
  return updateValue[0];
}

// const toDoSource = [
//   {
//     id: 1,
//     title: 'again',
//     checked: false,
//   },
//   {
//     id: 2,
//     title: 'jooo again',
//     checked: false,
//   },
// ];
const resolvers = {
  Query: {
    users() {
      return users;
    },
    user(parent, { username }) {
      return users.find((user) => user.username === username);
    },
    todos(parents, args) {
      return getTodos();
    },
  },
  Mutation: {
    createTodo(parents, args) {
      return createTodo(args.title, args.checked);
    },
    updateTodo(parents, args) {
      return updateTodo(args.id, args.title, args.checked);
    },
  },
};

export const schema = makeExecutableSchema({ typeDefs, resolvers });

export const config = {
  api: {
    bodyParser: false,
  },
};

export default new ApolloServer({ schema }).createHandler({
  path: '/api/graphql',
});
