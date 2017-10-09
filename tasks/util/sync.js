const browserSync = require('browser-sync').create();

browserSync.init({
  proxy: {
    target: 'localhost:8080',
    ws: true
  }
});

module.exports = browserSync;
