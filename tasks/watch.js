/**
 * Watch tasks to ease development
 */

const gulp = require('gulp');
const gulpSequence = require('gulp-sequence');
const watch = require('gulp-watch');

const production = process.env.NODE_ENV === 'production';

if (!production) {
  const sync = require('./util/sync');

  gulp.task('watch', ['watch:documents', 'watch:images', 'watch:javascript', 'watch:styles']);

  gulp.task('watch:documents', () => {
    return watch('src/client/**/*.html', () => {
      gulpSequence('documents', () => {
        sync.reload();
      });
    });
  });

  gulp.task('watch:images', () => {
    return watch('src/client/img/**', () => {
      gulpSequence('images', () => {
        sync.reload();
      });
    });
  });

  gulp.task('watch:javascript', () => {
    return watch('src/client/js/**/*.js', () => {
      gulpSequence('javascript', () => {
        sync.reload();
      });
    });
  });

  gulp.task('watch:styles', () => {
    return watch('src/client/scss/**/*.scss', () => {
      gulpSequence('styles', () => {
        sync.reload();
      });
    });
  });
}