const gulp = require('gulp');
const gulpSequence = require('gulp-sequence');
const requireDir = require('require-dir');

requireDir('./tasks');

gulp.task('dev', (cb) => {
  gulpSequence('clean', ['images', 'javascript', 'styles'], 'documents', 'watch')(cb);
});

gulp.task('build', (cb) => {
  gulpSequence('clean', ['images', 'javascript', 'styles'], 'documents', 'polish')(cb);
});
