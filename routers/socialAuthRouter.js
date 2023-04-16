const googlePassport = require('../passport');
const githubPassport = require('../passport');
const express = require('express');
const googleRouter = express.Router();
const githubRouter = express.Router();
const { authSocial } = require('../methods/authMehods');

// google

googleRouter.use(googlePassport.initialize());
googleRouter.use(googlePassport.session());

googleRouter.get("/success", authSocial());

googleRouter.get('/google',
  googlePassport.authenticate('google', { scope: ['email', 'profile'] }));

googleRouter.get('/google/callback',
  googlePassport.authenticate('google', {
    successRedirect: "/auth/success",
    failureRedirect: "/?auth=errorAuth",
  }),
);

// github

githubRouter.use(githubPassport.initialize());
githubRouter.use(githubPassport.session());

githubRouter.get("/auth", githubPassport.authenticate("github", { scope: ["user:email"] }));

githubRouter.get(
  "/callback",
  githubPassport.authenticate("github", {
    successRedirect: "/github/success",
    failureRedirect: "/?auth=errorAuth",
  })
);

githubRouter.get("/success", authSocial());

module.exports.githubRouter = githubRouter;
module.exports.googleRouter = googleRouter;
