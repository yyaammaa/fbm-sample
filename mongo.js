'use strict';

// ref: https://devcenter.heroku.com/articles/mean-apps-restful-api

const config = require("./config");
const mongodb = require("mongodb");
const ObjectID = mongodb.ObjectID;
const COLLECTION_LOG = 'log';

// Create a database variable outside of the database connection callback to reuse the connection pool in your app.
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
  });
} else {
  console.log('Database connection already established');
}

const rawAdd = (json) => {
  if (!db) {
    console.log('add: no db available');
    return;
  }

  json.timestamp = new Date().getTime();

  db.collection(COLLECTION_LOG).insertOne(json, (err, doc) => {
    if (err) {
      console.log('add: error: ' + err);
    } else {
      console.log('add: success: ' + JSON.stringify(doc));
    }
  });
};

const trackTextReceived = (sender, text) => {
  rawAdd({
    type: 'textReceived',
    sender: sender || '',
    text: text || ''
  });
};

const trackSearch = (sender, query, offset) => {
  rawAdd({
    type: 'search',
    sender: sender || '',
    query: query || '',
    offset: offset || 0
  });
};

module.exports = {
  trackTextReceived: trackTextReceived,
  trackSearch: trackSearch
};