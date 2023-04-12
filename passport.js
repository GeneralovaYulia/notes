require('dotenv').config();
//require("dotenv").config({ path: "../.env" });
const googlePassport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const githubPassport = require("passport");
const GitHubStrategy = require("passport-github2").Strategy;

// google

googlePassport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
  passReqToCallback: true
},
  function (request, accessToken, refreshToken, profile, done) {
    // Обработка полученных данных о пользователе
    const { email } = profile;
    return done(null, { username: email, social: "google" });
  }
));

googlePassport.serializeUser(function (user, done) {
  done(null, user);
});

googlePassport.deserializeUser(function (user, done) {
  done(null, user);
});

// github

githubPassport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URI,
    },
    function (accessToken, refreshToken, profile, done) {
      const { username } = profile;
      return done(null, { username: username, social: "github" });
    }
  )
);

githubPassport.serializeUser((user, done) => {
  done(null, user);
});

githubPassport.deserializeUser((user, done) => {
  done(null, user);
});

module.exports = githubPassport;
module.exports = googlePassport;
