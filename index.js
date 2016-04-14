'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const config = require('./config');
const request = require('request');

const TOKEN = config('PAGE_ACCESS_TOKEN');

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
  let messaging_events = req.body.entry[0].messaging;
  for (let i = 0; i < messaging_events.length; i++) {
    const event = req.body.entry[0].messaging[i];
    const sender = event.sender.id;
    if (event.message && event.message.text) {
      let text = event.message.text;
      // Handle a text message from this sender
      console.log('Receive text: text = ' + text + ', sender = ' + sender);
      sendTextMessage(sender, text);
    }
  }
  res.sendStatus(200);
});

app.listen(app.get('port'), (err) => {
  if (err) throw err;

  console.log('Running on port', app.get('port'));
});

let sendTextMessage = (sender, text) => {
  let messageData = {
    text: text
  };

  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token: TOKEN},
    method: 'POST',
    json: {
      recipient: {id: sender},
      message: messageData
    }
  }, function(error, response, body) {
    if (error) {
      console.log('Error sending message: ', error);
    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
    } else {
      console.log('Success: ', response.body);
    }
  });
};