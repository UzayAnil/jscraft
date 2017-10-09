/**
 * SCSS compiling and minification
 */

const autoprefixer = require("gulp-autoprefixer");
const cssmin = require("gulp-cssmin");
const gulp = require('gulp');
const gulpIf = require('gulp-if');
const lazypipe = require('lazypipe');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const source = require('vinyl-source-stream');
const wait = require('gulp-wait');

const cachebuster = require('./util/cachebuster');

const production = process.env.NODE_ENV === 'production';

gulp.task('styles', () => {
  return gulp.src('src/client/scss/*.scss')
    .pipe(wait(1000))
    .pipe(sass().on('error', (err) => { console.log(err); }))
    .pipe(gulpIf(production, productionPipeline()))
    .pipe(rename('app.css'))
    .pipe(gulp.dest('dist/client/css'));
});

const productionPipeline =
  lazypipe()
    .pipe(cssmin)
    .pipe(() => {
      return cachebuster.resources();
    });