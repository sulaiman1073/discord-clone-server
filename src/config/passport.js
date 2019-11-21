const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const getUser = require("../database/queries/getUser");

passport.use(
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    async (email, password, done) => {
      try {
        const user = await getUser({
          email,
          withPassword: true
        });

        if (!user) return done(null, false);

        const passwordCorrect = await bcrypt.compare(password, user.password);

        if (!passwordCorrect) return done(null, false);

        return done(null, {
          id: user.id,
          username: user.username,
          discriminator: user.discriminator,
          avatar: user.avatar,
          email: user.email,
          emailVerified: user.emailVerified,
          status: user.status,
          createdAt: user.createdAt
        });
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
  try {
    const user = await getUser({ id });

    if (user) return done(null, user);
  } catch (error) {
    return done(error);
  }
});

module.exports = passport;
