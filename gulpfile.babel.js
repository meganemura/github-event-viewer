var gulp    = require('gulp');
var ghpages = require('gh-pages');
var path    = require('path');
var server  = require('gulp-server-livereload');

gulp.task('deploy', ['sass'], function() {
  return ghpages.publish(path.join(__dirname, 'src'), function(err) {
    console.log(err);
  });
});

var sass = require('gulp-sass');
var pleeease = require('gulp-pleeease');

gulp.task('sass', function () {
  gulp.src('./src/stylesheets/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(pleeease())
    .pipe(gulp.dest('./src/stylesheets'));
});

gulp.task('sass:watch', function () {
  gulp.watch('./src/stylesheets/**/*.scss', ['sass']);
});

gulp.task('server', function() {
  gulp.src('.')
  .pipe(server({
    host: '0.0.0.0',
    livereload: true,
    open: true
  }));
});
