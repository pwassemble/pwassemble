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
    feedParser.on('end', () => res.send(items));
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
    const GOOGLE_CSE_KEY = process.env.GOOGLE_CSE_KEY;
    const GOOGLE_CSE_CX = process.env.GOOGLE_CSE_CX;
    const query = req.query.query;
    const category = req.query.category || '';
    const url = `https://www.googleapis.com/customsearch/v1
        ?key=${GOOGLE_CSE_KEY}
        &cx=${GOOGLE_CSE_CX}
        &quotaUser=${Math.random().toString().substr(2)}
        &fileType=jpg,png
        &imgColorType=color
        &imgType=photo
        &searchType=image
        &imgSize=medium
        &fields=items(link,title,image/contextLink,image/height,image/width)
        &hq=${encodeURIComponent(category)}
        &q=${encodeURIComponent(query)}`.replace(/\n\s*/gm, '');
    const options = {
      url: url,
      json: true,
    };
    request.get(options, (err, response, body) => {
      if (err || response.statusCode !== 200) {
        return res.sendStatus(404);
      }
      const json = body.items.map((item) => {
        return {
          url: `./proxy?url=${encodeURIComponent(item.image.contextLink)}`,
          image: `./proxy?url=${encodeURIComponent(item.link)}`,
          width: item.image.width,
          height: item.image.height,
          name: item.title
              .replace(/\s*amazon(?:\.com)?\s*[\|:]\s*/gim, '')
              .replace(/\s*(?:\.\.\.|…)$/gim, ''),
        };
      });
      return res.send({items: json});
    });
  },

};

module.exports = routes;
