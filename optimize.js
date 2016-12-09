// const imagemin = require('imagemin');

const optimize = {
  optimizeStatic() {
    /*
    imagemin(['images/*.{jpg,png}'], 'build/images', {
        plugins: [
            imageminMozjpeg(),
            imageminPngquant({quality: '65-80'})
        ]
    }).then(files => {
        console.log(files);
        //=> [{data: <Buffer 89 50 4e …>, path: 'build/images/foo.jpg'}, …]
    });
    */
  }
};

module.exports = optimize;
