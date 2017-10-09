/**
 * HTML handling
 */

const gulp = require('gulp');
const gulpIf = require('gulp-if');
const lazypipe = require('lazypipe');

const cachebuster = require('./util/cachebuster');

const production = process.env.NODE_ENV === 'production';

gulp.task('documents', () => {
  return gulp.src('src/client/**/*.html')
    .pipe(gulpIf(production, productionPipeline()))
    .pipe(gulp.dest('dist/client'));
});

const productionPipeline =
lazypipe()
  .pipe(() => {
    return cachebuster.references();
  });
