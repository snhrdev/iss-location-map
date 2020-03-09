const express = require('express');
const Datastore = require('nedb');

const app = express();
const db = new Datastore('./coordinates.db');
db.loadDatabase();

app.use(express.static('public'));
app.use(express.json({ limit: '1mb' }));

app.post('/addData', (req, res) => {
  db.insert(req.body, () => {
      res.json('success');
  });
});

app.get('/getRoute', (req, res) => {
  db.find({}, (err, coordsArray) => {
    res.json(coordsArray);
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log('Server started on port 3000');
});
