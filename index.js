'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const config = require('./config');

let app = express();

app.set('port', (process.env.PORT || 5000));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  console.log('/ get');

  res.send('\n 🌍 \n');
});

app.get('/webhook/', (req, res) => {
  if (req.query['hub.verify_token'] === 'please_verify_me_soon') {
    res.send(req.query['hub.challenge']);
  }
  res.send('Error, wrong validation token');
});

app.post('/webhook/', (req, res) => {
  console.log(req.body);
  //let messaging_events = req.body.entry[0].messaging;
  //for (let i = 0; i < messaging_events.length; i++) {
  //  let event = req.body.entry[0].messaging[i];
  //  let sender = event.sender.id;
  //  if (event.message && event.message.text) {
  //    text = event.message.text;
  //    // Handle a text message from this sender
  //  }
  //}
  res.sendStatus(200);
});

app.listen(app.get('port'), (err) => {
  if (err) throw err;

  console.log('Running on port', app.get('port'));
});