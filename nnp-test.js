'use strict';

const nanapiSearch = require('./nnp').search;
const sendGeneric = require('./nnp').sendSearchResult;
const mockResponse = require('./nnp').mockResponse;
const setWelcomeMessage = require('./nnp').setWelcomeMessage;
const _ = require('lodash');

setWelcomeMessage();

//nanapiSearch('犬', (error, response, body) => {
//  if (error) {
//    console.log('Error: ', error);
//  } else if (response.body.error) {
//    console.log('Error: ', response.body.error);
//  } else {
//    const json = JSON.stringify(response.body);
//    // console.log('Success: ', json);
////    console.log('Success: ', response.body);
//
//    const hits = body.hits.hits;
//    _.each(hits, hit => {
//      const title = hit._source.title;
//      const url = hit._source.url;
//      const imageUrl = hit._source.image_url;
//      const desc = hit._source.desc;
//
//      console.log(title + ', ' + url + ', ' + imageUrl + ', ' + desc);
//    });
//  }
//});

//sendSearchResult(mockResponse.hits.hits, null);