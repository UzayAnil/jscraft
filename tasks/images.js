const gulp = require('gulp');
const gulpIf = require('gulp-if');
const imagemin = require('gulp-imagemin');
const lazypipe = require('lazypipe');

const cachebuster = require('./util/cachebuster');

const production = process.env.NODE_ENV === 'production';

gulp.task('images', () => {
  return gulp.src('src/client/img/**')
    .pipe(gulpIf(production, productionPipeline()))
    .pipe(gulp.dest('dist/client/img/'));
});

const productionPipeline =
  lazypipe()
    .pipe(imagemin)
    .pipe(() => {
      return cachebuster.resources();
    });