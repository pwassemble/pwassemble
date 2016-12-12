const imagemin = require('imagemin');
const path = require('path');
const fs = require('fs');
const fse = require('fs-extra');

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

const optimize = {
  optimizeStatic() {
    const pattern = '*.{jpg,jpeg,png,gif,svg,webp}';
    const input = path.join(__dirname, 'client', 'static');
    const output = path.join(__dirname, 'client', 'dist', 'static');
    imagemin([path.join(input, pattern)], output, {
      plugins: [
        require('imagemin-svgo')(),
        require('imagemin-gifsicle')(),
        require('imagemin-jpegtran')(),
        require('imagemin-optipng')(),
        require('imagemin-webp')(),
        require('imagemin-zopfli')({more: true})
      ]})
    .then(() => {
      return ls(output);
    })
    // For WebP images, copy the fallback .jp(e)g, .png, or .gif files over
    .then(files => {
      files.filter(file => /\.webp$/.test(file)).map(file => {
        ['jpg', 'jpeg', 'png', 'gif'].map(extension => {
          const basename = `${path.basename(file, 'webp')}${extension}`;
          try {
            fse.copySync(path.join(input, basename),
                path.join(output, basename));
          } catch (e) {
            // no-op
          }
          return true;
        });
        return true;
      });
    })
    .catch(error => {
      throw error;
    });
  }
};

module.exports = optimize;
