'use strict';

const config = require('./config');
const request = require('request');
const TOKEN = config('PAGE_ACCESS_TOKEN');

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
  }

};

module.exports = api;