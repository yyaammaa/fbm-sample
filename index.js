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

  // entry[0]以外も処理する必要があるのかどうがわからんが一応処理しとく
  const entries = req.body.entry;
  const messagings = _.map(entries, entry => {
    return entry.messagings;
  });

  for (let i = 0; i < messagings.length; i++) {
    const event = messagings[i];
    const sender = event.sender.id;

    //  const messagingEvents = req.body.entry[0].messaging;
    //for (let i = 0; i < messagingEvents.length; i++) {
    //  const event = req.body.entry[0].messaging[i];
    //  const sender = event.sender.id;

    // messaging_optinsは "Send to Messenger" plugin を実装する場合に必要
    // https://developers.facebook.com/docs/messenger-platform/implementation#send_to_messenger_plugin

    // https://developers.facebook.com/docs/messenger-platform/webhook-reference#message_delivery
    // - midsは無い場合があるらしい
    // - これは「既読」ではなく、単なる送信完了の通知
    if (event.delivery) {
      nnp.handleDelivery(sender, event.delivery);
      continue;
    }

    if (event.postback) {
      nnp.handlePostback(sender, event.postback);
      continue;
    }

    if (!event.message) {
      console.log('no message here');
      continue;
    }

    // TODO: イースターエッグを増やす

    if (event.message.text) {
      let text = event.message.text;
      console.log('Receive text: text = ' + text + ', sender = ' + sender);

      // escape
      // text = nnp.escapeQuery(text);

      if (text === '') {
        console.log('Error: text is empty');
        continue;
      }

      if (text === 'whoami') {
        const m = 'heroku run bash\nRunning bash on fbm-sample... up, run.1428\n~ $ whoami\nu23298\n';
        nnp.sendText(sender, m);
        continue;
      }

      if (text === 'kill') {
        nnp.sendText(sender, 'マジで？');
        continue;
      }

      if (text === 'supership') {
        text = '寿司';
      }

      nnp.handleSearch(sender, text, 0);
    } else {
      // text以外がきたとき (ステッカーとか位置情報とか画像とか)
      console.log('Receive non-text: ' + JSON.stringify(event.message) + '\nsender = ' + sender);

      // いいね！が送られてきたとき
      const stickerId = event.message.sticker_id || 0;
      if (stickerId === 369239263222822) {
        nnp.sendText(sender, 'Yay!');
        continue;
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