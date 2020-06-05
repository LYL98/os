// Define plugins
const gulp = require('gulp'),
  postcss = require('gulp-postcss'),
  sass = require('gulp-sass'),
  minifyCss = require('gulp-clean-css'),
  rename = require('gulp-rename');

// Make it dynamic by changing core variables. Sensitive to location: make sure
// the paths are correct if you need to use a custom assets location
gulp.task('build', function() {
  return gulp
    .src('src/component/_scss/pg-ui.scss')
    .pipe(sass())
    .pipe(postcss())
    .pipe(gulp.dest('public/css'))
    .pipe(
      minifyCss({
        level: { 1: { specialComments: 0 } },
      })
    )
    .pipe(
      rename({
        suffix: '.min',
      })
    )
    .pipe(gulp.dest('public/css'));
});

//
// Watch files for changes
//

// Listen for changes in all SCSS files and automatically re-compile
gulp.task('dev', function() {
  gulp.watch('src/component/**/*.scss', gulp.series(['build']));
});
