const { ApolloServer, AuthenticationError } = require("apollo-server");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");

const path = require("path");
const fs = require("fs");

const resolvers = require("./resolver");

const filePath = path.join(__dirname, "typeDefs.gql");
const typeDefs = fs.readFileSync(filePath, "utf-8");

const User = require("./models/User");

dotenv.config({
  path: "./config/config.env",
});

const getUser = async (token) => {
  if (token) {
    try {
      return await jwt.verify(token, process.env.SECRET);
    } catch (err) {
      throw new AuthenticationError(
        "Sua sessão expirou. Faça o login novamente."
      );
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const token = req.headers["authorization"];
    return { User, currentUser: await getUser(token) };
  },
});

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("db connected"))
  .catch((err) => console.log(err));

server
  .listen()
  .then(({ url }) => {
    console.log(`Server connected in ${url}`);
  })
  .catch((err) => console.log(err));
