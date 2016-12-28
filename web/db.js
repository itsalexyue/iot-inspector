var MongoClient = require('mongodb').MongoClient;
var Promise = require('bluebird');

var state = {
  db: null,
};

exports.connect = (url) => new Promise((resolve, reject) => {
  if (state.db) return resolve();

  MongoClient.connect(url, (err, db) => {
    if (err) reject(err);
    else {
      state.db = db;
      resolve(db);
    }
  });
});

exports.get = (collection) => {
  if (collection) return state.db.collection(collection);
  else return state.db;
};

exports.close = () => new Promise((resolve, reject) => {
  if (state.db) {
    state.db.close((err, result) => {
      state.db = null;

      if (err) reject(err);
      else resolve();
    });
  }
});