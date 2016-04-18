'use strict';

const TYPE_WEB_URL = 'web_url';
const TYPE_POSTBACK = 'postback';

class Button {
  constructor(data) {
    Object.assign(this, data);
  }

  set title(title) {
    this._title = title;
  }

  get title() {
    return this._title;
  }

  set type(type) {
    this._type = type;
  }

  get type() {
    return this._type;
  }

  set payload(payload) {
    this._payload = payload;
  }

  get payload() {
    return this._payload;
  }

  set url(url) {
    this._url = url;
  }

  get url() {
    return this._url;
  }

  toJSON() {
    return {
      type: this._type,
      title: this._title,
      payload: this._payload,
      url: this._url
    }
  }

  static fromJSON(string) {
    return new Button(JSON.parse(string));
  }

  static createWebUrlButton(title, url) {
    const button = new Button();
    button.title = title;
    button.type = TYPE_WEB_URL;
    button.url = url;
    return button;
  }

  static createPostbackButton(title, payload) {
    const button = new Button();
    button.title = title;
    button.type = TYPE_POSTBACK;
    button.payload = payload;
    return button;
  }
}

module.exports = Button;