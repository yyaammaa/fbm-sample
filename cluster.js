'use strict';

// ref: https://devcenter.heroku.com/articles/node-concurrency
// ref: http://dragonprojects.de/node-js-clustering-in-multi-cpu-environments/

const throng = require('throng');
const config = require('./config');

throng(
  {
    workers: config('WEB_CONCURRENCY'),
    lifetime: Infinity
  }, (id) => {
    console.log(`Started worker ${id}`);
    require('./index');
  }
);
