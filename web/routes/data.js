var express = require('express');
var router = express.Router();
var mongo = require('mongodb');

var db = require('../db');
const collectionNames = ['tcp', 'netflow', 'dns'];

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(req.query);

  let start = req.query.start, end = req.query.end;

  let queries = collectionNames.map(name => {
    let collection = db.get(name);

    return new Promise((resolve, reject) => {
      collection.find({}).toArray((err, docs) => {
        if (err) reject(err);
        else resolve(docs);
      });
    });
  });

  Promise.all(queries)
    .then(results => {
      res.json(results);
    });
});

router.get('/netflow', (req, res, next) => {
  let start = req.query.start, end = req.query.end, selectors = {};

  if (start || end) selectors['time'] = {};
  if (start) selectors['time']['$gte'] = start;
  if (end) selectors['time']['$lte'] = end;

  console.log(selectors);

  db.get('netflow')
    .find(selectors, {'src': true, 'dst': true, 'traffic': true, 'mac': true, 'time': true})
    .toArray((err, docs) => {
      if (err) return next(err);

      console.log(docs);

      res.json(docs);
    });
});

router.get('/tcp', (req, res, next) => {
  let start = req.query.start, end = req.query.end, selectors = {};

  if (start || end) selectors['time'] = {};
  if (start) selectors['time.end']['$gte'] = start;
  if (end) selectors['time.start']['$lte'] = end;

  db.get('tcp')
    .find(selectors)
    .toArray((err, docs) => {
      if (err) return next(err);

      res.json(docs);

      return;

      // split into ssl and non ssl stream information



      let ipSet = new Set(), tcpDocs = docs;
      docs.forEach(doc => {
        if (!ipSet.has(doc.dst)) ipSet.add(doc.dst);
      });
      console.log(Array.from(ipSet));

      db.get('dns').find({'response.ip': {'$in': Array.from(ipSet)}})
        .toArray((err, docs) => {
          if (err) return next(err);

          console.log(docs);

          let ipMappings = {};
          docs.forEach(doc => {
            doc.response.ip.forEach(ip => ipMappings[ip] = doc.response.name);
          });

          tcpDocs.forEach(doc => {
            if (ipMappings[doc.dst])
              doc.name = ipMappings[doc.dst];
          });

          res.json(tcpDocs);
        });
    });
});

router.get('/tcp/:tcpDocId', (req, res, next) => {
  let tcpDocId = req.params.tcpDocId;
  console.log(tcpDocId);

  db.get('tcp')
    .find({_id: new mongo.ObjectID(tcpDocId)})
    .toArray((err, docs) => {
      if (err) return next(err);

      res.json(docs);
    });
});

router.get('/dns', (req, res, next) => {
  let start = req.query.start, end = req.query.end, selectors = {};

  if (start || end) selectors['time'] = {};
  if (start) selectors['time.end']['$gte'] = start;
  if (end) selectors['time.start']['$lte'] = end;

  db.get('dns')
    .find(selectors)
    .toArray((err, docs) => {
      if (err) return next(err);

      res.json(docs);
    });
});

router.get('/dns/:id', (req, res, next) => {
  let id = req.params.id;

  db.get('dns')
    .findOne({_id: new mongo.ObjectID(id)}, (err, doc) => {
      if (err) return next(err);

      res.json(doc);
    });
});

module.exports = router;
