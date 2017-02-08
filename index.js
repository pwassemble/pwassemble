'use strict';

const compression = require('compression');
const express = require('express');
const app = express();
const routes = require('./routes.js');
const minify = require('./minify.js');
const optimize = require('./optimize');

minify.minifyTemplates();
minify.minifyStatic();

optimize.optimizeStatic();

app.use(compression({threshold: 0}));

/* Enforce HTTPS on Heroku */
app.get('*', (req, res, next) => {
  const forwardedProtoHeader = req.headers['X-Forwarded-Proto'];
  if (forwardedProtoHeader && forwardedProtoHeader !== 'https') {
    return res.redirect(`https://${req.host}${req.url}`);
  }
  return next();
});

app.use('/', express.static('client/dist'));
app.use('/templates', express.static('client/dist/templates'));

app.get('/hello', routes.hello);
app.get('/feeds', routes.feeds);
app.get('/assets', routes.assets);
app.get('/manifests', routes.manifests);
app.get('/proxy', routes.proxy);
app.get('/optimize', routes.optimize);
app.get('/products', routes.products);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log('PWAssemble server listening on port', port);
});
