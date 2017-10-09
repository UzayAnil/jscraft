/**
 * Final touches to improve performance
 */

const critical = require('critical').stream;
const gulp = require('gulp');
const wbBuild = require('workbox-build');
const uncss = require('gulp-uncss');

gulp.task('polish', ['polish:css', 'polish:documents', 'polish:serviceworker']);

gulp.task('polish:css', () => {
  return gulp.src('dist/client/css/style.*.css')
    .pipe(uncss({
      html: ['dist/client/*.html']
    }))
    .pipe(gulp.dest('dist/client/css/'));
});

gulp.task('polish:documents', () => {
  return gulp.src('dist/client/*.html')
    .pipe(critical({base: 'dist/client/', inline: true}))
    .on('error', function(err) { console.log(err.message); })
    .pipe(gulp.dest('dist/client'));
});

gulp.task('polish:serviceworker', (cb) => {
  return wbBuild.generateSW({
    globDirectory: './dist/client/',
    swDest: './dist/client/sw.js',
    globPatterns: ['**\/*.{html,js,css}'],
  })
  .then(() => {
    console.log('Service worker generated.');
  })
  .catch((err) => {
    console.log('[ERROR] This happened: ' + err);
  });
});