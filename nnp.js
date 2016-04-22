'use strict';

const request = require('request');
const _ = require('lodash');
const config = require('./config');
const TOKEN = config('PAGE_ACCESS_TOKEN');

//const searchEndPoint = 'http://auone-elasticsearch-elb-133615898.ap-northeast-1.elb.amazonaws.com:9200/nanapi/v1/_search/template?timeout=50';
const searchEndPoint = 'http://52.196.140.65:9200/nanapi/v1/_search/template?timeout=50';

const send = (sender, message, notificationType, callback) => {
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

/**
 *
 * @param sender
 * @param hits array
 * @param callback
 */
const sendGeneric = (sender, hits, callback) => {

  const elements = _.map(hits, hit => {
    const src = hit._source;

    return {
      "title": src.title.substr(0, 10),
      "subtitle": src.desc.substr(0, 20),
      "image_url": 'https:' + src.image_url,
      "buttons": [
        {
          "type": "web_url",
          "url": src.url,
          "title": "記事を見る"
        },
        {
          "type": "postback",
          "title": "似た記事を探す",
          "payload": "Payload for first element in a generic bubble",
        }
      ]
    }
  });

  //_.each(elements, e=> {
  //  console.log(e);
  //});

  const messageData = {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "generic",
        "elements": elements
      }
    }
  };
  //const messageData = {
  //  "attachment": {
  //    "type": "template",
  //    "payload": {
  //      "template_type": "generic",
  //      "elements": [{
  //        "title": "First card",
  //        "subtitle": "Element #1 of an hscroll",
  //        "image_url": "http://messengerdemo.parseapp.com/img/rift.png",
  //        "buttons": [
  //          {
  //            "type": "web_url",
  //            "url": "https://www.messenger.com/",
  //            "title": "Web url"
  //          },
  //          {
  //            "type": "postback",
  //            "title": "Postback",
  //            "payload": "Payload for first element in a generic bubble",
  //          },
  //          {
  //            "type": "postback",
  //            "title": "Postback2",
  //            "payload": "PAY_LOAD_IS_HERE",
  //          }
  //        ]
  //      }, {
  //        "title": "Second card",
  //        "subtitle": "Element #2 of an hscroll",
  //        "image_url": "http://messengerdemo.parseapp.com/img/gearvr.png",
  //        "buttons": [{
  //          "type": "postback",
  //          "title": "Postback",
  //          "payload": "Payload for second element in a generic bubble",
  //        }]
  //      }]
  //    }
  //  }
  //};

  //console.log('Message = ' + JSON.stringify(messageData));
  //const hoge = {
  //  text: 'yes'
  //};

  send(sender, messageData, (error, response, body) => {
    if (callback) {
      callback(error, response, body)
    } else {
      if (error) {
        console.log('Error sending message: ', error);
      } else if (body.error) {
        console.log('Error: ', body.error);
      } else {
        console.log('Success: ', body);
      }
    }
  });
};

const search = (query, callback) => {
  const time = Math.floor(new Date().getTime() / 1000);

  request(
    {
      url: searchEndPoint,
      method: 'POST',
      json: {
        "template": {
          "file": "nanapiDDTempl"
        },
        "params": {
          "query": query,
          "from": 0,
          "size": 3,
          "time": time
        }
      }
    },
    (error, response, body) => {
      if (callback) callback(error, response, body);
    }
  );

  // mock
//  callback(null, '', mockResponse);
};

const mockResponse = {
  "took": 7,
  "timed_out": false,
  "_shards": {"total": 1, "successful": 1, "failed": 0},
  "hits": {
    "total": 444,
    "max_score": 2.3036842,
    "hits": [{
      "_index": "nanapi_v20150414",
      "_type": "v1",
      "_id": "768",
      "_score": 3.2060688,
      "_source": {
        "title": "よその猫と急速に仲良くなれるテクニック",
        "image_url": "//p.cdnanapi.com/r/20091125/20091125123228.jpg",
        "url": "https://nanapi.jp/768",
        "desc": "「よその猫」と仲良くなりたい！最近猫カフェなんぞが街で見られるようになってきました。猫カフェの猫は接客上手だと思いますが、通常の猫はあまり上手ではありません。自分の家で飼ってる猫なら何とか時間をかけていい関係を築くことができますが、一期一会の「よその猫」や「野良猫」と仲良くなるには...",
        "update_time": 1441113082,
        "timestamp": 1397228400,
        "score1": 45847,
        "score2": 16,
        "cate_path": ["趣味・娯楽", "ペット", "猫", "ストレスを与えないコツ"],
        "cate_id": "hobby/2514",
        "cate_id_path": ["hobby", "hobby/863", "hobby/2437", "hobby/2514"],
        "writer": "fusako",
        "writer_id": "2072"
      }
    }, {
      "_index": "nanapi_v20150414",
      "_type": "v1",
      "_id": "1712",
      "_score": 3.1846712,
      "_source": {
        "title": "猫の耳掃除・歯磨き・爪切りの方法",
        "image_url": "//p.cdnanapi.com/r/20100312/20100312104422.jpg",
        "url": "https://nanapi.jp/1712",
        "desc": "猫を飼う時に、猫自身が自分でできないケアこそ、飼い主の責任と言えます。しっかりとやり方をマスターしたいですよね。そこで、特に頻度が多い、耳掃除、歯磨き、爪切りの方法を紹介します。耳掃除junku.blog58.fc2.com猫が自分ではできない耳のお手入れは、オーナーの...",
        "update_time": 1441114247,
        "timestamp": 1439132400,
        "score1": 18358,
        "score2": 3,
        "cate_path": ["趣味・娯楽", "ペット", "猫", "猫のしつけと育て方"],
        "cate_id": "hobby/2513",
        "cate_id_path": ["hobby", "hobby/863", "hobby/2437", "hobby/2513"],
        "writer": "けんすう",
        "writer_id": "3"
      }
    }, {
      "_index": "nanapi_v20150414",
      "_type": "v1",
      "_id": "591",
      "_score": 3.1792412,
      "_source": {
        "title": "猫と仲良くなれるテクニック",
        "image_url": "//p.cdnanapi.com/r/20091028/20091028003515.jpg",
        "url": "https://nanapi.jp/591",
        "desc": "猫を知れば、猫と仲良くなれます！猫が大好きで猫と仲良くしたいけど、なかなか仲良くなれない、そんな方いらっしゃいますか?猫はとても自由きままな動物で、犬のように人に媚びる事もなく、かわいがったからといって喜んでくれる訳ではありません。あくまでいつでもマイペースです。名前を呼んでも全...",
        "update_time": 1441112857,
        "timestamp": 1382972400,
        "score1": 72716,
        "score2": 17,
        "cate_path": ["趣味・娯楽", "ペット", "猫", "ストレスを与えないコツ"],
        "cate_id": "hobby/2514",
        "cate_id_path": ["hobby", "hobby/863", "hobby/2437", "hobby/2514"],
        "writer": "きゅうきゅうきゅうき",
        "writer_id": "1666"
      }
    }, {
      "_index": "nanapi_v20150414",
      "_type": "v1",
      "_id": "2154",
      "_score": 3.1715062,
      "_source": {
        "title": "猫フェチ的猫の嗅ぎ方",
        "image_url": "//p.cdnanapi.com/r/20100426/20100426135732.jpg",
        "url": "https://nanapi.jp/2154",
        "desc": "猫はたまに嗜好品になりますまずは猫をよく天日干ししましょう日当たりのいい窓辺などに、猫を設置しましょう。飼い猫がお気に入りの座布団などを置くと、よく寝付きます。太陽によくあて、猫の警戒心が緩み、眠気も加わって、もう好きにしてー状態まで待ちます。猫がよく干しあがるまで、そ...",
        "update_time": 1441114770,
        "timestamp": 1425308400,
        "score1": 114994,
        "score2": 3,
        "cate_path": ["趣味・娯楽", "ペット", "猫", "遊び方"],
        "cate_id": "hobby/14357",
        "cate_id_path": ["hobby", "hobby/863", "hobby/2437", "hobby/14357"],
        "writer": "KOTOYO",
        "writer_id": "5090"
      }
    }, {
      "_index": "nanapi_v20150414",
      "_type": "v1",
      "_id": "2108",
      "_score": 3.1715062,
      "_source": {
        "title": "身近なアレで猫のストレス解消！？",
        "image_url": "//p.cdnanapi.com/r/20100422/20100422231027.jpg",
        "url": "https://nanapi.jp/2108",
        "desc": "猫だってストレスがたまります最近は猫を外に出さない飼い主さんが増えています。部屋の日あたりのいい場所でま～るくなって一日過ごす、それが一般的な猫のイメージでしょう。しかし、ねこじゃらしなどに本気のまなざしで向かっていく、そんな猫の姿を見たことがありませんか？あれは猫の狩...",
        "update_time": 1441114720,
        "timestamp": 1425308400,
        "score1": 31697,
        "score2": 3,
        "cate_path": ["趣味・娯楽", "ペット", "猫", "ストレスを与えないコツ"],
        "cate_id": "hobby/2514",
        "cate_id_path": ["hobby", "hobby/863", "hobby/2437", "hobby/2514"],
        "writer": "さのっち",
        "writer_id": "5103"
      }
    }]
  }
};

module.exports = {
  search: search,
  sendGeneric: sendGeneric,
  mockResponse: mockResponse
};