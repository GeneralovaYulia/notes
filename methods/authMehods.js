const { findInDataBase, pushInDatabase } = require('./methodsDB');
const { nanoid } = require("nanoid");
const { ObjectId } = require("mongodb");

const messageAuthError = {
  errorAuth: "Ошибка авторизации!",
  errorSignup: "Ошибка регистрации логин и пароль должны быть длинее 1 символа!",
  loginSignupError: "Имя пользователя занято!",
};

const auth = () => async (req, res, next) => {
  if (!req.cookies.sessionId) {
    return next();
  }

  const session  = await findInDataBase(req.db, "sessions", { sessionId: req.cookies.sessionId });
  if (!session ) {
    return next();
  }

  const user = await findInDataBase(req.db, "users", { _id: new ObjectId(session.userId) });
  if (!user) {
    return next();
  }

  req.user = user;
  req.sessionId = req.cookies.sessionId;
  next();
};

const authRedirect = () => (req, res, next) => {
  if (!req.user) {
    let errorMessage = messageAuthError[req.query.auth];
    let validMassage = false;
    if (!errorMessage) {
      validMassage = req.query.auth === "successSignup" ? "Вы успешно зарегистрировались!" : false;
    }
    return res.render("index", { authError: errorMessage, validMassage });
  }
  next();
};

const authWarningInit = () => (req, res, next) => {
  if (!req.user) {
    return res.status(401).send("Ошибка авторизации");
  }
  next();
};

const authSocial = () => async (req, res) => {
  try {
    if (!req.user || !req.user.username) return res.redirect("/?auth=errorAuth");
    const user = await findInDataBase(req.db, "users", { username: req.user.username });
    if (user) {
      const sessionId = nanoid();
      await pushInDatabase(req.db, "sessions", { userId: user.id, id: nanoid(), sessionId });
      res.cookie("sessionId", sessionId, { httpOnly: true }).redirect("/");
      //return res.redirect("/");
    }
    const userId = nanoid();
    await pushInDatabase(req.db, "users", { id: userId, username: req.user.username, social: req.user.social });
    const sessionId = nanoid();
    await pushInDatabase(req.db, "sessions", { userId: userId, id: nanoid(), sessionId });
    res.cookie("sessionId", sessionId, { httpOnly: true }).redirect("/");
    //res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Ошибка на сервере");
  }
};

module.exports.auth = auth;
module.exports.authRedirect = authRedirect;
module.exports.authWarningInit = authWarningInit;
module.exports.authSocial = authSocial;
