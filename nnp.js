'use strict';

const request = require('request');
const _ = require('lodash');
const truncate = require('truncate');
const queryParser = require('qs');
const db = require('./mongo');
const config = require('./config');
const TOKEN = config.PAGE_ACCESS_TOKEN;
const PAGE_ID = config.PAGE_ID;

//const SEARCH_ENDPOINT = 'http://auone-elasticsearch-elb-133615898.ap-northeast-1.elb.amazonaws.com:9200/nanapi/v1/_search/template?timeout=50';
const SEARCH_ENDPOINT = 'http://52.196.140.65:9200/nanapi/v1/_search/template?timeout=50';

const PAYLOAD = {
  search: 'SEARCH'
};
const SEARCH_SIZE = 5;

/**
 * https://developers.facebook.com/docs/messenger-platform/send-api-reference#welcome_message_configuration
 */
const setWelcomeMessage = () => {
  const messageData = {
    "setting_type": "call_to_actions",
    "thread_state": "new_thread",
    "call_to_actions": [
      {
        "message": {
          "text": "こんにちは!\n\nわからないこと・知りたいことをテキストで入力してください!"
        }
      }
    ]
  };

  request(
    {
      url: 'https://graph.facebook.com/v2.6/' + PAGE_ID + '/thread_settings',
      qs: {access_token: TOKEN},
      method: 'POST',
      json: messageData
    },
    (error, response, body) => {
      if (error) {
        console.log(error);
      } else {
        console.log(JSON.stringify(response));
      }
    }
  );
};

const rawSend = (sender, message, notificationType, callback) => {
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
    }
  );
};

const handleDelivery = (sender, delivery) => {
  const watermark = delivery.watermark;
  const seq = delivery.seq;
  console.log(
    'Message-Delivered: sender = ' + sender +
    ', watermark = ' + watermark +
    ', seq = ' + seq
  );
};

const handlePostback = (sender, postback) => {
  const payload = postback.payload;
  console.log('payload = ' + payload);

  const search = PAYLOAD.search + '?';
  if (payload.includes(search)) {
    const qs = queryParser.parse(payload.substr(search.length));
    if (qs.query) {
      const offsetString = qs.offset || '0';
      handleSearch(sender, qs.query, parseInt(offsetString), 10);
    } else {
      console.log('handlePostback: Error: no query');
    }
  } else {
    // TODO:
    sendText(sender, 'その機能、まだ無いんですよね… 私も欲しいです。');
  }
};

const handleSearch = (sender, query, offset) => {
  const from = offset || 0;
  db.trackSearch(sender, query, offset);

  search(query, from, (error, response, body) => {
    if (error) {
      console.log('Search Error: ', error);
    } else if (body.error) {
      console.log('Search Error: ', body.error);
    } else {
      console.log('Search Success: ', JSON.stringify(response.body));
      sendSearchResult(sender, query, body.hits, from);
    }
  });
};

/**
 *
 * @param sender
 * @param text
 * @param callback optional
 */
const sendText = (sender, text, callback) => {
  const message = {
    text: text
  };
  rawSend(sender, message, callback);
};

/**
 *
 * @param sender
 * @param query
 * @param hitsRoot ※hits.hitsなので注意な
 * @param offset
 * @param callback optional
 */
const sendSearchResult = (sender, query, hitsRoot, offset, callback) => {
  const hits = hitsRoot.hits;
  const total = hitsRoot.total;

  if (hits.length === 0) {
    const message = query + " に該当する記事は見つかりませんでした...\n\n他のキーワードを入力してみてください";
    sendText(sender, message);

    const suggestion = {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "button",
          "text": "例えば…",
          "buttons": [
            {
              "type": "postback",
              "title": "猫 に関する記事を探す",
              "payload": PAYLOAD.search + '?query=猫'
            },
            {
              "type": "postback",
              "title": "犬 に関する記事を探す",
              "payload": PAYLOAD.search + '?query=犬'
            },
            {
              "type": "postback",
              "title": "羊 に関する記事を探す",
              "payload": PAYLOAD.search + '?query=羊'
            }
          ]
        }
      }
    };
    rawSend(sender, suggestion);

    return;
  }

  sendText(sender, query + " に関する記事です。");

  let elements = _.map(hits, hit => {
    const src = hit._source;

    let buttons = [
      {
        "type": "web_url",
        "url": src.url,
        "title": "記事を見る"
      }
    ];

    const categories = src.cate_path;
    if (categories && categories.length > 0) {
      const cate = categories[categories.length - 1];
      const title = cate + 'の記事を探す';
      buttons.push({
        "type": "postback",
        "title": title,
        "payload": PAYLOAD.search + '?query=' + cate
      });
    }

    return {
      "title": truncate(src.title, 20),
      "subtitle": truncate(src.desc, 38),
      "image_url": 'https:' + src.image_url,
      "item_url": src.url,
      "buttons": buttons
    }
  });

  console.log('offset = ' + offset + ', total = ' + total);

  // next page
  if (SEARCH_SIZE + offset < total) {
    const nextOffset = SEARCH_SIZE + offset;
    console.log('next offset = ' + nextOffset);
    elements.push({
      "title": '検索結果',
      "subtitle": truncate(query, 10) + ' に関する記事が' + total + '件あります',
      "image_url": 'https://cloud.githubusercontent.com/assets/1149883/14759442/9b1e9624-095e-11e6-9a07-26780b8cfd50.png',
      "buttons": [{
        "type": "postback",
        "title": 'もっと見る',
        "payload": PAYLOAD.search + '?query=' + query + '&offset=' + nextOffset
      }]
    });
  }

  const messageData = {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "generic",
        "elements": elements
      }
    }
  };

  rawSend(sender, messageData, callback);
};

/**
 *
 * @param query
 * @param offset
 * @param callback optional
 */
const search = (query, offset, callback) => {
  const from = offset || 0;
  const time = Math.floor(new Date().getTime() / 1000);
  const escaped = escapeQuery(query);

  request(
    {
      url: SEARCH_ENDPOINT,
      method: 'POST',
      json: {
        "template": {
          "file": "nanapiDDTempl"
        },
        "params": {
          "query": escaped,
          "from": from,
          "size": SEARCH_SIZE,
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

const escapeQuery = (query) => {
  if (!query) return '';
  return query
    .replace(/\*/g, '※')
    .replace(/~/g, '〜')
    .replace(/!/g, '！')
    .replace(/\(/g, ' ')
    .replace(/\)/g, ' ')
    .replace(/"/g, '')
    .replace(/\^/g, '')
    .replace(/:/g, '')
    ;
};

module.exports = {
  search: search,
  handleSearch: handleSearch,
  sendText: sendText,
  handlePostback: handlePostback,
  handleDelivery: handleDelivery,
  sendSearchResult: sendSearchResult,
  mockResponse: mockResponse,
  setWelcomeMessage: setWelcomeMessage,
  escapeQuery: escapeQuery
}
;