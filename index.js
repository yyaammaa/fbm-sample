'use strict';

const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const request = require('request');
const nnp = require('./nnp');
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
      nnp.handlePayload(sender, payload);
      continue;
    }

    if (!event.message) {
      console.log('no message here');
      continue;
    }

    if (event.message.text) {
      let text = event.message.text;
      console.log('Receive text: text = ' + text + ', sender = ' + sender);

      nnp.search(text, (error, response, body) => {
        if (error) {
          console.log('Error: ', error);
          //} else if (response.body.error) {
          //  console.log('Error: ', response.body.error);
        } else {
          console.log('Success: ', JSON.stringify(response.body));

          const hits = body.hits.hits;
          nnp.sendSearchResult(sender, text, hits);
        }
      });
    } else {
      // text以外がきたとき (ステッカーとか位置情報とか画像とか)
      console.log('Receive non-text: ' + JSON.stringify(event.message) + '\nsender = ' + sender);

      // TODO: イースターエッグを増やす

      // いいね！が送られてきたとき
      const stickerId = event.message.sticker_id || 0;
      if (stickerId === 369239263222822) {
        nnp.sendText(sender, 'Yay!');
        return;
      }

      // TODO: もうちょっとケアしてあげないと
      nnp.sendText(sender, 'テキスト以外の入力はいまのところできません\n\nテキストで何か入力してみてください');
    }
  }
});

app.listen(app.get('port'), (err) => {
  if (err) throw err;

  console.log('Running on port', app.get('port'));
});