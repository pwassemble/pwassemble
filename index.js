'use strict';

const compression = require('compression');
const express = require('express');
const app = express();
const routes = require('./routes.js');

app.use(compression({threshold: 0}));

app.use('/', express.static('client'));

app.get('/hello', routes.hello);
app.get('/feeds', routes.feeds);
app.get('/assets', routes.assets);
app.get('/manifests', routes.manifests);
app.get('/proxy', routes.proxy);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log('PWAssemble server listening on port', port);
});
