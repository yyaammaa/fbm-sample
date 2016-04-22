'use strict';

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const request = require('request');
const api = require('./api');
const nanapiSearch = require('./nnp').search;
const _ = require('lodash');

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
    return;
  }
  res.send('Error, wrong validation token');
});

app.post('/webhook/', (req, res) => {
  console.log(req.body);

  let messaging_events = req.body.entry[0].messaging;
  for (let i = 0; i < messaging_events.length; i++) {
    const event = req.body.entry[0].messaging[i];
    const sender = event.sender.id;

    if (event.postback) {
      const payload = event.postback.payload;
      api.handlePayload(sender, payload);
      continue;
    }

    if (event.message && event.message.text) {
      let text = event.message.text;
      // Handle a text message from this sender
      console.log('Receive text: text = ' + text + ', sender = ' + sender);

      //if (text === 'Generic') {
      //  sendGenericMessage(sender);
      //} else if (text === 'who') {
      //  getUserInfo(sender);
      //} else {
      //  sendTopMessage(sender);
      //}

      nanapiSearch(text, (error, response, body) => {
        if (error) {
          console.log('Error: ', error);
          //} else if (response.body.error) {
          //  console.log('Error: ', response.body.error);
        } else {
          // const json = JSON.stringify(response.body);
          // console.log('Success: ', json);
//    console.log('Success: ', response.body);

          let tmp = null;

          const hits = body.hits.hits;
          _.each(hits, hit => {
            const title = hit._source.title;
            const url = hit._source.url;
            const imageUrl = hit._source.image_url;
            const desc = hit._source.desc;
            console.log(title + ', ' + url + ', ' + imageUrl + ', ' + desc);

            if (!tmp) tmp = title;
          });

          sendTextMessage(sender, text);
        }
      });
    }
  }
  res.sendStatus(200);
});

app.listen(app.get('port'), (err) => {
  if (err) throw err;

  console.log('Running on port', app.get('port'));
});

const getUserInfo = (sender) => {
  api.getUserProfile(sender, (error, response, body) => {
    if (error) {
      console.log('Error sending message: ', error);
    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
    } else {
      console.log('Success: ', response.body);
      const mes = JSON.parse(response.body);
      const firstName = mes.first_name || '';
      sendTextMessage(sender, 'hello, ' + firstName);
    }
  });
};

let sendTopMessage = (sender) => {
  api.sendTopMessage(sender, (error, response, body) => {
    if (error) {
      console.log('Error sending message: ', error);
    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
    } else {
      console.log('Success: ', response.body);
    }
  });
};

let sendGenericMessage = (sender) => {
  api.sendGenericMessage(sender, (error, response, body) => {
    if (error) {
      console.log('Error sending message: ', error);
    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
    } else {
      console.log('Success: ', response.body);
    }
  });
};

let sendTextMessage = (sender, text) => {
  api.sendTextMessage(sender, text, (error, response, body) => {
    if (error) {
      console.log('Error sending message: ', error);
    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
    } else {
      console.log('Success: ', response.body);
    }
  });
};