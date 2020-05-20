const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const createToken = (user, secret, expiresIn) => {
  const { email, password } = user;
  return jwt.sign({ email, password }, secret, { expiresIn });
};

module.exports = {
  Mutation: {
    signup: async (
      _,
      { username, password, confirmPassword, email, phone },
      { User }
    ) => {
      const user = await User.findOne({ email });
      if (user) {
        throw new Error("E-mail de usuário já cadastrado no sistema");
      }
      if (password != confirmPassword) {
        throw Error("Confirme a senha corretamente");
      }

      const newUser = await new User({
        username,
        password,
        email,
        phone,
      }).save();

      return { token: createToken(newUser, process.env.SECRET, "1hr") };
    },
    signin: async (_, { email, password }, { User }) => {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error("E-mail de usuário não cadastrado no sistema");
      }
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new Error("Senha incorreta");
      }
      return { token: createToken(user, process.env.SECRET, "1hr") };
    },
  },
  Query: {
    getCurrentUser: async (_, args, { User, currentUser }) => {
      if (!currentUser) {
        return null;
      }
      const user = await User.findOne({ email: currentUser.email });

      return user;
    },
  },
};
