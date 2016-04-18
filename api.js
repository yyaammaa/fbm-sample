'use strict';

const config = require('./config');
const request = require('request');
const TOKEN = config('PAGE_ACCESS_TOKEN');

const payloads = {
  zandaka: 'PAYLOAD_ZANDAKA',
  meisai: 'PAYLOAD_MEISAI',
  accountEtc: 'PAYLOAD_ACCOUNT_ETC',
  shintaku: 'PAYLOAD_SHINTAKU',
  teiki: 'PAYLOAD_TEIKI',
  investEtc: 'PAYLOAD_INVEST_ETC',
  otoku: 'PAYLOAD_OTOKU',
  setting: 'PAYLOAD_SETTING',
  etcEtc: 'PAYLOAD_ETC_ETC',
};

const topMesssage = {
  "attachment": {
    "type": "template",
    "payload": {
      "template_type": "generic",
      "elements": [
        {
          "title": "アカウント",
          "subtitle": "残高照会や入出金明細の確認を行うことが出来ます。",
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
        },
        {
          "title": "預金・投資",
          "subtitle": "資産の運用にお役立ていただけるさまざまな商品をご用意しています",
          "image_url": "https://cloud.githubusercontent.com/assets/1149883/14593301/ca6f3f68-0563-11e6-9fc0-a6e55e647def.png",
          "buttons": [
            {
              "type": "postback",
              "title": "定期預金",
              "payload": payloads.teiki
            },
            {
              "type": "postback",
              "title": "投資信託",
              "payload": payloads.shintaku
            },
            {
              "type": "postback",
              "title": "その他",
              "payload": payloads.investEtc
            }
          ]
        },
        {
          "title": "その他",
          "subtitle": "キャンペーンやお得な情報など",
          "image_url": "https://cloud.githubusercontent.com/assets/1149883/14593380/bfe1cb8c-0564-11e6-9e9a-c7199d342502.png",
          "buttons": [
            {
              "type": "postback",
              "title": "お得な情報",
              "payload": payloads.otoku
            },
            {
              "type": "postback",
              "title": "設定",
              "payload": payloads.setting
            },
            {
              "type": "postback",
              "title": "その他",
              "payload": payloads.etcEtc
            }
          ]
        }
      ]
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
