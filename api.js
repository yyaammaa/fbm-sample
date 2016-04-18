'use strict';

const config = require('./config');
const request = require('request');
const TOKEN = config('PAGE_ACCESS_TOKEN');

const payloads = {
  zandaka: 'PAYLOAD_ZANDAKA',
  meisai: 'PAYLOAD_MEISAI',
  accountEtc: 'PAYLOAD_ACCOUNT_ETC',
};

const topMesssage = {
  "attachment": {
    "type": "template",
    "payload": {
      "template_type": "generic",
      "elements": [{
        "title": "アカウント",
        //"subtitle": "Element #1 of an hscroll",
        "image_url": "https://cloud.githubusercontent.com/assets/1149883/14593174/1473745a-0562-11e6-9335-6a6f492f9a28.png",
        "buttons": [
          {
            "type": "postback",
            "title": "残高照会",
            "payload": payloads.zandaka
          },
          {
            "type": "postback",
            "title": "入出金明細",
            "payload": payloads.meisai
          },
          {
            "type": "postback",
            "title": "その他",
            "payload": payloads.accountEtc
          }
        ]
      }, {
        "title": "Second card",
        "subtitle": "Element #2 of an hscroll",
        "image_url": "http://messengerdemo.parseapp.com/img/gearvr.png",
        "buttons": [{
          "type": "postback",
          "title": "Postback",
          "payload": "Payload for second element in a generic bubble",
        }]
      }]
    }
  }
};

/**
 * row send api
 *
 * @param sender: mandatory
 * @param message: mandatory
 * @param notificationType: optional: REGULAR, SILENT_PUSH, NO_PUSH
 * @param callback: optional: aa
 */
let send = (sender, message, notificationType, callback) => {
  const type = notificationType || 'SILENT_PUSH';
  request(
    {
      url: 'https://graph.facebook.com/v2.6/me/messages',
      qs: {access_token: TOKEN},
      method: 'POST',
      json: {
        recipient: {id: sender},
        message: message,
        notification_type: type
      }
    },
    (error, response, body) => {
      if (callback) callback(error, response, body);
    }
  );
};

let api = {
  getUserProfile: (sender, callback) => {
    request({
      url: 'https://graph.facebook.com/v2.6/' + sender,
      qs: {
        fields: 'first_name, last_name, profile_pic',
        access_token: TOKEN
      },
      method: 'GET'
    }, (error, response, body) => {
      if (callback) callback(error, response, body);
    });
  },

  sendTextMessage: (sender, text, callback) => {
    let messageData = {
      text: text
    };

    send(sender, messageData, (error, response, body) => {
      if (callback) callback(error, response, body);
    });
  },

  sendGenericMessage: (sender, callback) => {
    const messageData = {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "generic",
          "elements": [{
            "title": "First card",
            "subtitle": "Element #1 of an hscroll",
            "image_url": "http://messengerdemo.parseapp.com/img/rift.png",
            "buttons": [
              {
                "type": "web_url",
                "url": "https://www.messenger.com/",
                "title": "Web url"
              },
              {
                "type": "postback",
                "title": "Postback",
                "payload": "Payload for first element in a generic bubble",
              },
              {
                "type": "postback",
                "title": "Postback2",
                "payload": "PAY_LOAD_IS_HERE",
              }
            ]
          }, {
            "title": "Second card",
            "subtitle": "Element #2 of an hscroll",
            "image_url": "http://messengerdemo.parseapp.com/img/gearvr.png",
            "buttons": [{
              "type": "postback",
              "title": "Postback",
              "payload": "Payload for second element in a generic bubble",
            }]
          }]
        }
      }
    };

    send(sender, messageData, (error, response, body) => {
      if (callback) callback(error, response, body);
    });
  },

  sendTopMessage: (sender, callback) => {
    send(sender, topMesssage, (error, response, body) => {
      if (callback) callback(error, response, body);
    });
  }

};

module.exports = api;
module.exports = payloads;