const fs = require('fs');
const path = require('path');
const babel = require("babel-core");
const postcss = require('postcss');
const htmlMinifier = require('html-minifier').minify;

const CREATE_SOURCE_MAPS = false;

const ls = start => {
  return new Promise((resolve, reject) => {
    fs.readdir(start, (err, files) => {
      if (err) {
        return reject(err);
      }
      // Don't return hidden files
      files = files.filter(name => !/^\./.test(name));
      return resolve(files.map(file => path.join(start, file)));
    });
  });
};

const minifyHtml = (file, destFile) => {
  const result = htmlMinifier(fs.readFileSync(file, {encoding: 'utf8'}), {
    collapseBooleanAttributes: true,
    collapseInlineTagWhitespace: true,
    collapseWhitespace: true,
    decodeEntities: true,
    minifyCSS: true,
    minifyJS: true,
    removeAttributeQuotes: true,
    removeEmptyAttributes: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    sortAttributes: true,
    sortClassName: true,
    trimCustomFragments: true,
    useShortDoctype: true
  });
  fs.writeFileSync(destFile, result);
};

const minifyJavaScript = (file, destFile) => {
  const result = babel.transformFileSync(file, {
    sourceMaps: CREATE_SOURCE_MAPS,
    presets: ['babili'],
    comments: false,
    minified: true
  });
  fs.writeFileSync(destFile, result.code);
  if (CREATE_SOURCE_MAPS) {
    fs.writeFileSync(`${destFile}.map`, JSON.stringify(result.map, null, 2));
  }
};

const minifyCss = (file, destFile) => {
  const processor = postcss([require('autoprefixer'), require('cssnano')]);
  processor.process(fs.readFileSync(file), {
    from: file,
    to: destFile,
    map: {
      inline: false
    }
  })
  .then(result => {
    fs.writeFileSync(destFile, result.css);
    if (CREATE_SOURCE_MAPS) {
      fs.writeFileSync(`${destFile}.map`, JSON.stringify(result.map, null, 2));
    }
  });
};

const minify = {
  minifyAll() {
    const templatesDir = path.join(__dirname, 'client', 'templates');
    const distDir = path.join(__dirname, 'client', 'dist');
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir);
    }
    ls(templatesDir)
    .then(files => Promise.all(files.map(file => ls(file))))
    .then(results => {
      results.forEach(directory => {
        directory.forEach(file => {
          const extension = path.extname(file);
          const destFile = file.replace('templates', 'dist')
              .replace(extension, `-min${extension}`);
          const destDir = path.dirname(destFile);
          if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir);
          }
          if (/\.js$/.test(file)) {
            minifyJavaScript(file, destFile);
          } else if (/\.css$/.test(file)) {
            minifyCss(file, destFile);
          } else if (/\.html$/.test(file)) {
            minifyHtml(file, destFile);
          }
        });
      });
    })
    .catch(error => {
      throw error;
    });
  }
};

module.exports = minify;
