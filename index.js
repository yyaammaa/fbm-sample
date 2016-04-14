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

app.listen(app.get('port'), (err) => {
  if (err) throw err;

  console.log('Running on port', app.get('port'));
});