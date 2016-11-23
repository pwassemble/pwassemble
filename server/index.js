'use strict';

const express = require('express');
const app = express();
const routes = require('./routes.js');

app.get('/', routes.hello);
app.get('/feeds', routes.feeds);
app.get('/assets', routes.assets);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log('PWAssemble server listening on port', port);
});
