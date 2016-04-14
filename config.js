'use strict';

const dotenv = require('dotenv');
const ENV = process.env.NODE_ENV || 'development';

if (ENV === 'development') {
  dotenv.load();
}

// memo: https://blog.heroku.com/archives/2016/3/9/how-to-deploy-your-slack-bots-to-heroku#img-src-https-heroku-www-files-s3-amazonaws-com-starbot-icons-icon-heroku-png-alt-heroku-configuring-the-bot-on-heroku

const config = {
  ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  PROXY_URI: process.env.PROXY_URI,
};

module.exports = (key) => {
  if (!key) return config;

  return config[key]
};