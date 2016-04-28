'use strict';

const config = require("./config");
const mongodb = require("mongodb");
const ObjectID = mongodb.ObjectID;
const COLLECTION_LOG = 'log';

let db;

// TODO: どこで初期化するのがいいんだろう?

if (!db) {
  mongodb.MongoClient.connect(config.MONGODB_URI, (err, database) => {
    if (err) {
      console.log(err);
      return;
    }

    // Save database object from the callback for reuse.
    db = database;
    console.log("Database connection ready");
    doSomething();
  });
} else {
  console.log('Database connection already established');
}

const doSomething = () => {
  db.collection(COLLECTION_LOG).find({}).toArray((err, docs) => {
    console.log(docs.length);
  });

};