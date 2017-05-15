'use strict';

const path = require('path');
const env = require('node-env-file');
env(path.join(__dirname, '.env'), {raise: false});
const FeedParser = require('feedparser');
const request = require('request');
const sharp = require('sharp');
const imagemin = require('imagemin');
const fileType = require('file-type');
const extractor = require('unfluff');
const products = require('amazon-products-api')({
  AccessKey: process.env.AMAZON_ACCESS_KEY_ID,
  SecretKey: process.env.AMAZON_SECRET_ACCESS_KEY,
  Tag: process.env.AMAZON_ASSOCIATE_TAG,
});

const routes = {
  hello(req, res) {
    return res.send('🙋🙋‍♂️');
  },

  feeds(req, res) {
    const url = req.query.url;
    const feedRequest = request({
      url: url,
      gzip: true,
    });
    const feedParser = new FeedParser({
      addmeta: true,
      normalize: true,
    });
    let items = [];

    feedRequest.on('error', () => res.sendStatus(500));
    feedRequest.on('response', (response) => {
      if (response.statusCode !== 200) {
        return feedRequest.emit('error', new Error('Bad status code'));
      }
      feedRequest.pipe(feedParser);
    });

    feedParser.on('error', () => res.sendStatus(500));
    feedParser.on('readable', () => {
      let item;
      while ((item = feedParser.read())) {
        items.push(item);
      }
    });
    feedParser.on('end', () => {
      return res.send(items);
    });
  },

  article(req, res) {
    request.get(req.query.url, (err, response, body) => {
      if (err || response.statusCode !== 200) {
        return res.send({});
      }
      const data = extractor(body);
      return res.send(data);
    });
  },

  assets(req, res) {
    const {url, width, height} = req.query;
    request(url, {
      encoding: null,
      gzip: true,
    }, (error, response, body) => {
      if (error || response.statusCode !== 200) {
        return res.sendStatus(500);
      }
      sharp(body)
      .resize(parseInt(width, 10), parseInt(height, 10))
      .png()
      .toBuffer()
      .then((outputBuffer) => {
        res.set('Content-Type', 'image/png');
        return res.send(outputBuffer);
      })
      .catch(() => res.sendStatus(500));
    });
  },

  optimize(req, res) {
    const input = req.query.url;
    request(input, {
      encoding: null,
      gzip: true,
    }, (error, response, body) => {
      if (error || response.statusCode !== 200) {
        return res.sendStatus(500);
      }
      const plugins = [
        require('imagemin-svgo')(),
        require('imagemin-gifsicle')(),
        require('imagemin-jpegtran')(),
        require('imagemin-optipng')(),
        require('imagemin-zopfli')({more: true}),
      ];
      // If the user agent accepts WebP send it
      const acceptHeader = req.headers.accept || '';
      if (/image\/webp/.test(acceptHeader)) {
        plugins.push(require('imagemin-webp')());
      }
      imagemin.buffer(body, {plugins: plugins})
      .then((outputBuffer) => {
        res.set('Content-Type', fileType(outputBuffer).mime);
        return res.send(outputBuffer);
      })
      .catch(() => res.sendStatus(500));
    });
  },

  proxy(req, res) {
    const url = req.query.url;
    request(url, {
      gzip: true,
      encoding: null,
    }, (error, response, body) => {
      if (error || response.statusCode !== 200) {
        return res.sendStatus(404);
      }
      res.set({
        'Content-Type': response.headers['Content-Type'],
        'Cache-Control': response.headers['Cache-Control'] ?
            response.headers['Cache-Control'] : 'max-age=3600',
      });
      return res.send(body);
    });
  },

  manifests(req, res) {
    const base64 = req.query.base64;
    res.set('Content-Type', 'application/manifest+json');
    return res.send(new Buffer(base64, 'base64').toString());
  },

  products(req, res) {
    products.operation('ItemSearch', {
      SearchIndex: req.query.category ? req.query.category : 'All',
      Keywords: req.query.query,
      ResponseGroup: 'Images,ItemAttributes',
    })
    .then((response) => {
      const json = response.Items.Item.map((item) => {
        return {
          url: `./proxy?url=${encodeURIComponent(item.DetailPageURL)}`,
          image: `./proxy?url=${encodeURIComponent(item.LargeImage.URL)}`,
          name: item.ItemAttributes.Title,
        };
      });
      return res.send(json);
    })
    .catch((error) => {
      return res.sendStatus(404);
    });
  },
};

module.exports = routes;
