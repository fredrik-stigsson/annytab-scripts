var gulp = require('gulp');
var babel = require('gulp-babel');

gulp.task('transpile', function () {
    return gulp.src([
        './node_modules/regenerator-runtime/runtime.js',
        './wwwroot/js/annytab.effects.js',
        './wwwroot/js/annytab.form.methods.js',
        './wwwroot/js/annytab.html.editor.js',
        './wwwroot/js/annytab.html5.validation.js',
        './wwwroot/js/annytab.imagepreview.js',
        './wwwroot/js/annytab.lightbox.js',
        './wwwroot/js/annytab.modalbox.js',
        './wwwroot/js/annytab.notifier.js',
        './wwwroot/js/annytab.signature.js'])
        .pipe(babel())
        .pipe(gulp.dest('./wwwroot/tjs-babel/'));
});