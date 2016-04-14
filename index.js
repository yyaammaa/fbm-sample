'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const config = require('./config');

let app = express();

app.set('port', (process.env.PORT || 5000));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.get('/', (request, response) => {
  console.log('/ get');

  response.send('\n 🌍 \n');
});

app.get('/webhook/', (req, res) => {
  if (req.query['hub.verify_token'] === 'please_verify_me_soon') {
    res.send(req.query['hub.challenge']);
  }
  res.send('Error, wrong validation token');
});

app.listen(app.get('port'), (err) => {
  if (err) throw err;

  console.log('Running on port', app.get('port'));
});