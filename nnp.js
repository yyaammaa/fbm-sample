'use strict';

const request = require('request');
const _ = require('lodash');

const search = (query, callback) => {
  const time = Math.floor(new Date().getTime() / 1000);

  request(
    {
      url: 'http://auone-elasticsearch-elb-133615898.ap-northeast-1.elb.amazonaws.com:9200/nanapi/v1/_search/template',
      qs: {timeout: 50},
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
};

search('オリンピック', (error, response, body) => {
  if (error) {
    console.log('Error: ', error);
  } else if (response.body.error) {
    console.log('Error: ', response.body.error);
  } else {
    const json = JSON.stringify(response.body);
    console.log('Success: ', json);
//    console.log('Success: ', response.body);

    const hits = response.body.hits.hits;
    _.each(hits, hit => {
      const title = hit._source.title;
      const url = hit._source.url;
      const imageUrl = hit._source.image_url;
      const desc = hit._source.desc;

      console.log(title + ', ' + url + ', ' + imageUrl + ', ' + desc);
    });
  }
});