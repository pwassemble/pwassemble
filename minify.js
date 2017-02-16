const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');
const babel = require('babel-core');
const postcss = require('postcss');
const htmlMinifier = require('html-minifier').minify;

const CREATE_SOURCE_MAPS = false;

const ls = (start) => {
  return new Promise((resolve, reject) => {
    fs.readdir(start, (err, files) => {
      if (err) {
        return reject(err);
      }
      // Don't return hidden files
      files = files.filter((name) => !/^\./.test(name));
      return resolve(files.map((file) => path.join(start, file)));
    });
  });
};

const minifyHtml = (code, destFile, returnHtml = false) => {
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
    useShortDoctype: true,
  });
  if (returnHtml) {
    return {result, destFile};
  }
  fs.writeFileSync(destFile, result);
};

const minifyJs = (code, destFile) => {
  const result = babel.transform(code, {
    sourceMaps: CREATE_SOURCE_MAPS,
    presets: ['babili'],
    comments: false,
    minified: true,
  });
  fs.writeFileSync(destFile, result.code);
  if (CREATE_SOURCE_MAPS) {
    fs.writeFileSync(`${destFile}.map`, JSON.stringify(result.map, null, 2));
  }
};

const minifyCss = (code, file, destFile, returnCss = false) => {
  const processor = postcss([require('autoprefixer'), require('cssnano')]);
  return processor.process(code, {
    from: file,
    to: destFile,
    discardComments: {
      removeAll: true,
    },
    map: CREATE_SOURCE_MAPS ? {inline: false} : false,
  })
  .then((result) => {
    if (returnCss) {
      return result.css;
    }
    fs.writeFileSync(destFile, result.css);
    if (CREATE_SOURCE_MAPS) {
      fs.writeFileSync(`${destFile}.map`, JSON.stringify(result.map, null, 2));
    }
  });
};

const minify = {
  minifyTemplates() {
    const templatesDir = path.join(__dirname, 'client', 'templates');
    const distDir = path.join(__dirname, 'client', 'dist', 'templates');
    fse.emptyDirSync(distDir);
    ls(templatesDir)
    .then((templates) => Promise.all(templates.map((file) => ls(file))))
    .then((results) => {
      results.forEach((templateDir) => {
        let templateFiles = [];
        let templateDirectories = [];
        templateDir.forEach((object) => {
          if (fs.lstatSync(object).isDirectory()) {
            templateDirectories.push(object);
          } else {
            templateFiles.push(object);
          }
        });
        // Minify top-level files
        templateFiles.forEach((file) => {
          const extension = path.extname(file);
          const destFile = file.replace('templates', 'dist/templates')
              .replace(extension, `.min${extension}`);
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
        // Leave directories alone, assuming they are already minified
        templateDirectories.forEach((directory) => {
          const destDir = directory.replace('templates', 'dist');
          fse.copy(directory, destDir);
        });
      });
    })
    .catch((error) => {
      throw error;
    });
  },

  minifyStatic() {
    try {
      let nodeModules = path.join(__dirname, 'node_modules');
      let clientLibs = path.join(__dirname, 'client', 'libs');
      fse.copySync(
          path.join(nodeModules, 'idb-keyval', 'idb-keyval.js'),
          path.join(clientLibs, 'idb-keyval.js'));
      fse.copySync(
          path.join(nodeModules, 'url-search-params', 'build',
              'url-search-params.max.js'),
          path.join(clientLibs, 'url-search-params.js'));
      fse.copySync(
          path.join(nodeModules, 'whatwg-fetch', 'fetch.js'),
          path.join(clientLibs, 'fetch.js'));
    } catch (error) {
      throw error;
    }
    const staticDir = path.join(__dirname, 'client');
    const distDir = path.join(__dirname, 'client', 'dist');
    let rootFiles = [];
    ls(staticDir)
    .then((files) => {
      let directories = files.filter((file) => {
        if (fs.lstatSync(file).isDirectory() && /css|js|libs$/.test(file)) {
          return true;
        }
        if (!fs.lstatSync(file).isDirectory()) {
          rootFiles.push(file);
        }
        return false;
      });
      return Promise.all(directories.map((file) => ls(file)));
    })
    .then((results) => {
      results.push(rootFiles);
      let jsFiles = [];
      let cssFiles = [];
      let indexHtml;
      results.forEach((directory) => {
        directory.forEach((file) => {
          const extension = path.extname(file);
          // All destination files should have a ".min." suffix, except
          // index.html
          const destFile = file.replace('client/', 'client/dist/')
              .replace(extension, (extension === '.html' ?
              extension : `.min${extension}`));
          const destDir = path.dirname(destFile);
          if (!/libs|css$/.test(destDir) && !fs.existsSync(destDir)) {
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
            indexHtml = minifyHtml(fs.readFileSync(file, {encoding: 'utf8'}),
                destFile, true);
          }
        });
      });
      // Bundle all JavaScript
      let jsCodes = [];
      jsFiles.map((file) => jsCodes.push(
          fs.readFileSync(file, {encoding: 'utf8'})));
      minifyJs(jsCodes.join('\n'), path.join(distDir, 'js', 'bundle.min.js'));
      // Bundle all CSS
      let cssCodes = [];
      cssFiles.map((file) => cssCodes.push(
          fs.readFileSync(file, {encoding: 'utf8'})));
      // Inline bundled CSS
      minifyCss(cssCodes.join('\n'),
          path.join(distDir, 'css', 'bundle.css'),
          path.join(distDir, 'css', 'bundle.min.css'), true)
      .then((css) => {
        const html = indexHtml.result.replace(/<style>.*?<\/style>/,
            `<style>${css}</style>`);
        fs.writeFileSync(indexHtml.destFile, html);
      });
    })
    .catch((error) => {
      throw error;
    });
  },
};

module.exports = minify;
