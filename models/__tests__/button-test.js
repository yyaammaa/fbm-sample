'use strict';

jest.unmock('../button');
const Button = require('../button');

describe('button', () => {
  it('should create instance', () => {
    const button = new Button();
    expect(button).not.toBeNull();
    expect(button).not.toBeUndefined();
  });

  it('setters and getters', () => {
    const button = new Button();
    button.title = 'title desu';
    button.type = 'type A';
    button.payload = 'super payload';

    expect(button.title).toBe('title desu');
    expect(button.type).toBe('type A');
    expect(button.payload).toBe('super payload');
  });

  it('toJSON and User.fromJSON', () => {
    const button = new Button();
    button.title = 'title desu';
    button.type = 'type A';
    button.payload = 'super payload';
    const json = button.toJSON();
    console.log(json);
    expect(json).not.toBeNull();

    const jsonString = JSON.stringify(json);
    const anotherButton = Button.fromJSON(jsonString);
    expect(anotherButton.title).toBe('title desu');
  });

  it('createWebUrlButton', () => {
    const button = Button.createWebUrlButton('AAA', 'http://google.com');
    expect(button.title).toBe('AAA');
    expect(button.url).toBe('http://google.com');
    expect(button.type).toBe('web_url');
  });

  it('createPostbackButton', () => {
    const button = Button.createPostbackButton('AAA', 'PL');
    expect(button.title).toBe('AAA');
    expect(button.payload).toBe('PL');
    expect(button.type).toBe('postback');
  });
});
