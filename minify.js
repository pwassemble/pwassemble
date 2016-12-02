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

const minifyHtml = (code, destFile) => {
  const result = htmlMinifier(code, {
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

const minifyJs = (code, destFile) => {
  const result = babel.transform(code, {
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

const minifyCss = (code, file, destFile) => {
  const processor = postcss([require('autoprefixer'), require('cssnano')]);
  processor.process(code, {
    from: file,
    to: destFile,
    discardComments: {
      removeAll: true
    },
    map: CREATE_SOURCE_MAPS ? {inline: false} : false
  })
  .then(result => {
    fs.writeFileSync(destFile, result.css);
    if (CREATE_SOURCE_MAPS) {
      fs.writeFileSync(`${destFile}.map`, JSON.stringify(result.map, null, 2));
    }
  });
};

const minify = {
  minifyTemplates() {
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
            minifyJs(fs.readFileSync(file, {encoding: 'utf8'}), destFile);
          } else if (/\.css$/.test(file)) {
            minifyCss(fs.readFileSync(file, {encoding: 'utf8'}), file,
                destFile);
          } else if (/\.html$/.test(file)) {
            minifyHtml(fs.readFileSync(file, {encoding: 'utf8'}), destFile);
          }
        });
      });
    })
    .catch(error => {
      throw error;
    });
  },

  minifyStatic() {
    const staticDir = path.join(__dirname, 'client');
    const distDir = path.join(__dirname, 'client', 'dist');
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir);
    }
    let rootFiles = [];
    ls(staticDir)
    .then(files => {
      let directories = files.filter(file => {
        if (fs.lstatSync(file).isDirectory() && /css|js|libs$/.test(file)) {
          return true;
        }
        if (!fs.lstatSync(file).isDirectory()) {
          rootFiles.push(file);
        }
        return false;
      });
      return Promise.all(directories.map(file => ls(file)));
    })
    .then(results => {
      results.push(rootFiles);
      let jsFiles = [];
      let cssFiles = [];
      results.forEach(directory => {
        directory.forEach(file => {
          const extension = path.extname(file);
          // All destination files should have a -min. suffix, except index.html
          const destFile = file.replace('client/', 'client/dist/')
              .replace(extension, (extension === '.html' ?
              extension : `-min${extension}`));
          const destDir = path.dirname(destFile);
          if (!/libs$/.test(destDir) && !fs.existsSync(destDir)) {
            fs.mkdirSync(destDir);
          }
          if (/\.js$/.test(file)) {
            // Do not bundle the service-worker.js file
            if (/service-worker\.js$/.test(file)) {
              minifyJs(fs.readFileSync(file, {encoding: 'utf8'}), destFile);
            } else {
              jsFiles.push(file);
            }
          } else if (/\.css$/.test(file)) {
            cssFiles.push(file);
          } else if (/\.html$/.test(file)) {
            minifyHtml(fs.readFileSync(file, {encoding: 'utf8'}), destFile);
          }
        });
      });
      // Bundle all JavaScript
      let jsCodes = [];
      jsFiles.map(file => jsCodes.push(
          fs.readFileSync(file, {encoding: 'utf8'})));
      minifyJs(jsCodes.join('\n'), path.join(distDir, 'js', 'bundle-min.js'));
      // Bundle all CSS
      let cssCodes = [];
      cssFiles.map(file => cssCodes.push(
          fs.readFileSync(file, {encoding: 'utf8'})));
      minifyCss(cssCodes.join('\n'), path.join(distDir, 'css', 'bundle.css'),
          path.join(distDir, 'css', 'bundle-min.css'));
    })
    .catch(error => {
      throw error;
    });
  }
};

module.exports = minify;
