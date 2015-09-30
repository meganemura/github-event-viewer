var babel   = require('gulp-babel');
var ghpages = require('gh-pages');
var gulp    = require('gulp');
var notify  = require('gulp-notify');
var path    = require('path');
var plumber = require('gulp-plumber');
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

gulp.task('babel', () => {
  gulp.src('./src/*.es6')
  .pipe(plumber({errorHandler: notify.onError("<%= error.message %>")}))
  .pipe(babel())
  .pipe(gulp.dest('./src'))
});

gulp.task('babel:watch', () => {
  gulp.watch('./src/*.es6', ['babel']);
});

gulp.task('watch', ['sass:watch', 'babel:watch']);

gulp.task('server', function() {
  gulp.src('.')
  .pipe(server({
    host: '0.0.0.0',
    livereload: true,
    open: true
  }));
});
