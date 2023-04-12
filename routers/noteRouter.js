const { nanoid } = require("nanoid");
const express = require('express');
const noteRouter = express.Router();
const ObjectId = require('mongodb').ObjectId;
const { auth } = require('../methods/authMehods');
const { findInDataBaseAllAndSort, countData, findInDataBase } = require('../methods/methodsDB');
const showdown = require("showdown");
const makepdf = require('../methods/makepdf');
const fs = require("fs").promises;

const converter = new showdown.Converter();

noteRouter.get("/", auth(), async (req, res) => {
  const id = new ObjectId(req.query.id)

  try {
    let note = await findInDataBase(req.db, "notes", { "_id": id })
    note.html = converter.makeHtml(note.text);

    res.json(note);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

noteRouter.post("/", auth(), async (req, res) => {
  try {
    let criterias = {
      userId: req.user.id,
      isArchived: req.body.age === "archive",
    };

    if (req.body.age != "archive" && req.body.age != "alltime") {
      const today = new Date();
      criterias.created =
        req.body.age === "1month"
          ? { $gte: new Date(today.setMonth(today.getMonth() - 1)) }
          : { $gte: new Date(today.setMonth(today.getMonth() - 3)) };
    }
    const skip = (req.body.page - 1) * 20;
    const data = await findInDataBaseAllAndSort(req.db, "notes", criterias, { created: -1 }, skip);
    const count = await countData(req.db, "notes", criterias);

    res.json({
      data: data,
      hasMore: count > req.body.page * 20,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Ошибка на сервере");
  }
});

noteRouter.post("/new", auth(), async (req, res) => {
  try {
    const newNote = {
      title: req.body.title,
      text: req.body.text,
      id: nanoid(),
      userId: req.user.id,
      created: new Date(),
      isArchived: false,
    };
    await req.db.collection("notes").insertOne(newNote);
    res.json(newNote);
  } catch (err) {
    console.error(err);
    res.status(500).send("Ошибка на сервере");
  }
});

noteRouter.put("/", auth(), async (req, res) => {
  const id = new ObjectId(req.body.id)

  const update = {
    title: req.body.title,
    text: req.body.text,
  }

  await req.db.collection("notes").updateOne({ "_id": id }, { $set: { title: req.body.title, text: req.body.text } });

  res.json(update)
});

noteRouter.put("/archive", auth(), async (req, res) => {
  const id = new ObjectId(req.body.id)

  try {
    await req.db.collection("notes").updateOne({ "_id": id }, { $set: { isArchived: req.body.archive } });
    res.json({});
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

noteRouter.delete("/", auth(), async (req, res) => {
  try {
    await req.db.collection("notes").deleteMany({ userId: req.user.id, isArchived: true });
    res.json({});
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

noteRouter.get("/pdf", auth(), async (req, res) => {
  const id = new ObjectId(req.query.id)

  try {
    let note = await findInDataBase(req.db, "notes", { "_id": id });
    const pdf = await makepdf(note.title, note.text, note.id);
    res.download(pdf);
    await fs.rm(pdf);
  } catch (err) {
    console.error(err);
    res.status(500).send("Ошибка на сервере!");
  }
});

module.exports.noteRouter = noteRouter;
