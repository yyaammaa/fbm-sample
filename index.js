'use strict';

const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const request = require('request');
const api = require('./api');
const nanapiSearch = require('./nnp').search;
const sendGeneric = require('./nnp').sendGeneric;
const sendText = require('./nnp').sendText;
const _ = require('lodash');

app.set('port', (process.env.PORT || 5000));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  console.log('/ get');
  res.send('\n 🌍 \n');
});

app.get('/lp', (req, res) => {
  console.log('/lp get');
  res.render('lp.jade', {});
});

app.get('/webhook/', (req, res) => {
  if (req.query['hub.verify_token'] === 'please_verify_me_soon') {
    res.send(req.query['hub.challenge']);
    return;
  }
  res.send('Error, wrong validation token');
});

app.post('/webhook/', (req, res) => {
  console.log(JSON.stringify(req.body));
  res.sendStatus(200);

  // TODO: entry[0]以外も処理する必要がある?
  const messagingEvents = req.body.entry[0].messaging;
  for (let i = 0; i < messagingEvents.length; i++) {
    const event = req.body.entry[0].messaging[i];
    const sender = event.sender.id;

    if (event.postback) {
      const payload = event.postback.payload;
      api.handlePayload(sender, payload);
      continue;
    }

    if (event.message && event.message.text) {
      let text = event.message.text;
      console.log('Receive text: text = ' + text + ', sender = ' + sender);

      nanapiSearch(text, (error, response, body) => {
        if (error) {
          console.log('Error: ', error);
          //} else if (response.body.error) {
          //  console.log('Error: ', response.body.error);
        } else {
          console.log('Success: ', JSON.stringify(response.body));

          const hits = body.hits.hits;
          sendGeneric(sender, hits);
        }
      });
    } else if (event.message && !event.message.text) {
      // text以外がきたとき (ステッカーとか位置情報とか画像とか)
      console.log('Receive non-text: ' + JSON.stringify(event.message) + '\nsender = ' + sender);
      sendText(sender, 'Oops!!');
    }
  }
});

app.listen(app.get('port'), (err) => {
  if (err) throw err;

  console.log('Running on port', app.get('port'));
});