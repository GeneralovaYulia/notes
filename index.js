require('dotenv').config();
const express = require("express");
const session = require('express-session');
const bodyParser = require("body-parser");
const nunjucks = require("nunjucks");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const { MongoClient } = require('mongodb');
const cookieParser = require("cookie-parser");
const { createSession, deleteSession } = require('./methods/methodsDB');
const { auth, authRedirect } = require('./methods/authMehods');
const path = require('path');
const { noteRouter } = require(path.join(__dirname, './routers/noteRouter'));
const { nanoid } = require('nanoid');
const { googleRouter, githubRouter } = require(path.join(__dirname,'./routers/socialAuthRouter'));

const clientPromise = MongoClient.connect(process.env.DATABASE, {
  useUnifiedTopology: true,
  maxPoolSize: 10,
});

const app = express();

nunjucks.configure(path.join(__dirname, "views"), {
  autoescape: true,
  express: app,
});

app.use(express.static(path.join(__dirname,"public")));
app.use(
  session(
    {
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false
    }));
app.use(express.json());
app.use(cookieParser());
app.use(async (req, res, next) => {
  try {
    const client = await clientPromise;
    req.db = client.db("notes_app");
    next();
  } catch (err) {
    next(err);
  }
});
app.set("view engine", "njk");

app.get("/", auth(), authRedirect(), (req, res) => {
  res.redirect("/dashboard");
});

app.get("/dashboard", auth(), (req, res) => {
  if (!req.user) return res.redirect("/");

  res.render("dashboard", { username: req.user.username });
});

app.post("/signup", bodyParser.urlencoded({ extended: false }), async (req, res) => {
  if (!req.body) return res.sendStatus(400).send({ error: "Data not formatted properly" });

  const hash = await bcrypt.hash(req.body.password, saltRounds);
  const user = {
    username: req.body.username,
    password: hash,
    id: nanoid(),
  };

  await req.db.collection("users").insertOne(user);

  res.redirect("/");
});

app.post("/login", bodyParser.urlencoded({ extended: false }), async (req, res) => {
  const { username, password } = req.body;
  console.log(req.body)

  const user = await req.db.collection("users").findOne({ username });

  if (!user) {
    return res.status(401).send("Unknown username");
  }

  const result = await bcrypt.compare(password, user.password);

  if (result !== true) {
    return res.status(401).send("Unknown password");
  }

  const sessionId = await createSession(req.db, user._id);

  res.cookie("sessionId", sessionId);
  res.redirect("/");
});

app.get("/logout", auth(), async (req, res) => {
  if (!req.user) {
    return res.redirect("/");
  }

  await deleteSession(req.db, req.sessionId);
  res.clearCookie("sessionId").redirect("/");
});

app.use("/auth", googleRouter);
app.use("/github", githubRouter);
app.use("/notes", noteRouter);

app.get('*', function(req, res){
  res.status(404).render('404.html');
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`  Listening on http://localhost:${port}`);
});
