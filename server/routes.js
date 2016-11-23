'use strict';

const FeedParser = require('feedparser');
const request = require('request');
const sharp = require('sharp');

const routes = {
  hello(req, res) {
    return res.send('🙋🙋‍♂️');
  },

  feeds(req, res) {
    const url = req.query.url;
    const feedRequest = request(url);
    const feedParser = new FeedParser({addmeta: false});
    let items = [];

    feedRequest.on('error', error => {
      return res.status(500).send(error.toString())
    });
    feedRequest.on('response', response => {
      if (response.statusCode !== 200) {
        return feedRequest.emit('error', new Error('Bad status code'));
      }
      feedRequest.pipe(feedParser);
    });

    feedParser.on('error', error => {
      return res.status(500).send(error.toString())
    });
    feedParser.on('readable', () => {
      let item;
      while (item = feedParser.read()) {
        items.push(item);
      }
    });
    feedParser.on('end', () => res.send(items));
  },

  assets(req, res) {

  }
};

module.exports = routes;
