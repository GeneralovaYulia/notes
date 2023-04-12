const { ObjectId } = require("mongodb");
const { nanoid } = require("nanoid");

const findInDataBase = async (db, collection, obj) => db.collection(collection).findOne(obj);

const pushInDatabase = async (db, collection, obj) =>
  db
    .collection(collection)
    .insertOne(obj)
    .then((data) => {
      if (!data.acknowledged) {
        throw new Error("Ошибка на сервере при добавлении в базу");
      }
      return data;
    });

const findInDataBaseAllAndSort = async (db, collection, obj, sortCriteria, skipCount) =>
  db.collection(collection).find(obj).sort(sortCriteria).skip(skipCount).limit(20).toArray();

const countData = async (db, collection, obj) => db.collection(collection).countDocuments(obj);

const deleteNotes = async (db, collection, obj) => {
  await db.collection(collection).deleteOne({ obj });
};

const findUserBySessionId = async (db, sessionId) => {
  const session = await db.collection("sessions")
    .findOne({ sessionId });

  if (!session) {
    return;
  }

  return db.collection("users").findOne({ _id: new ObjectId(session.userId) });
};

const createSession = async (db, userId) => {
  const sessionId = nanoid();

  await db.collection("sessions").insertOne({
    userId,
    sessionId,
  });

  return sessionId;
};

const deleteSession = async (db, sessionId) => {
  await db.collection("sessions").deleteOne({ sessionId });
};

module.exports.findUserBySessionId = findUserBySessionId;
module.exports.deleteNotes = deleteNotes;
module.exports.findInDataBase = findInDataBase;
module.exports.pushInDatabase = pushInDatabase;
module.exports.createSession = createSession;
module.exports.findInDataBaseAllAndSort = findInDataBaseAllAndSort;
module.exports.deleteSession = deleteSession;
module.exports.countData = countData;
