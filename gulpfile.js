var gulp = require('gulp');
var ghpages = require('gh-pages');
var path = require('path');

gulp.task('deploy', function() {
  return ghpages.publish(path.join(__dirname, 'src'), function(err) {
    console.log(err);
  });
});
