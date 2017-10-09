/**
 * Clean files in directory before building
 */

const gulp = require('gulp');
const del = require('del');

gulp.task('clean', () => {
  return del([
    'dist/client/**'
  ]);
});

gulp.task('clean:templates', () => {
  return del([
    'dist/client/**/*.html'
  ]);
});

gulp.task('clean:images', () => {
  return del([
    'dist/client/img/**'
  ]);
});

gulp.task('clean:javascript', () => {
  return del([
    'dist/client/js/**'
  ]);
});

gulp.task('clean:styles', () => {
  return del([
    'dist/client/css/**'
  ]);
});