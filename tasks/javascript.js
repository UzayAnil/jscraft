/**
 * Basic JavaScript building and minification
 */

const babel = require('rollup-plugin-babel');
const buffer = require('vinyl-buffer');
const commonjs = require('rollup-plugin-commonjs');
const gulp = require('gulp');
const gulpIf = require('gulp-if');
const lazypipe = require('lazypipe');
const rename = require('gulp-rename');
const resolve = require('rollup-plugin-node-resolve');
const rollup = require('rollup-stream');
const uglify = require('uglify-es');
const composer = require('gulp-uglify/composer');
const source = require('vinyl-source-stream');

const cachebuster = require('./util/cachebuster');

const minify = composer(uglify, console);
const production = process.env.NODE_ENV === 'production';

gulp.task('javascript', () => {
  return rollup({
    input: 'src/client/js/index.js',
    format: 'iife',
    plugins: [
      babel({
        presets: [
          [
            "env",
            {
              "modules": false
            }
          ]
        ],
        plugins: [
          "external-helpers",
        ],
        babelrc: false,
        exclude: 'node_modules/**'
      }),
      resolve({ jsnext: true, main: true }),
      commonjs()
    ]
  })
    .pipe(source('app.js'))
    .pipe(gulpIf(production, productionPipeline()))
    .pipe(gulp.dest('dist/client/js'));
});

const productionPipeline =
  lazypipe()
    .pipe(buffer)
    .pipe(() => {
      return minify()
    })
    .pipe(() => {
      return cachebuster.resources();
    })
    .pipe(() => {
      // We have resources that are loaded via Javascript
      return cachebuster.references();
    });
