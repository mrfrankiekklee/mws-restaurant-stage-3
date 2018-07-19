var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var eslint = require('gulp-eslint');
var jasmine = require('gulp-jasmine-phantom');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify-es').default;
var sourcemaps = require('gulp-sourcemaps');
var imagemin = require('gulp-imagemin');
var imageminJpegtran = require('imagemin-jpegtran');
var imageminPngquant = require('imagemin-pngquant');


gulp.task('default', function () {

    // place code for your default task here
    gulp.watch('sass/**/*.scss', ['styles']);
    //    gulp.watch('js/**/*.js', ['lint']);
    done();
});


gulp.task('styles', function (done) {
    gulp.src('sass/**/*.scss').pipe(sass({
            outputStyle: 'compressed'
        }).on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 2 versions']
        })).pipe(gulp.dest('dist/css'));
    done();

});



gulp.task('lint', function (done) {
    return gulp.src(['js/**/*.js'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failOnError());

    done();
});

gulp.task('tests', function () {
    gulp.src('tests/spec/extraSpec.js')
        .pipe(jasmine({
            integration: true,
            vendor: 'js/**/*.js'
        }));
    done();
});

gulp.task('copy-html', function (done) {
    gulp.src('./index.html')
        .pipe(gulp.dest('./dist'));
    gulp.src('./restaurant.html')
        .pipe(gulp.dest('./dist'));
    done();
});

gulp.task('copy-images', function (done) {
    gulp.src('img/*')
        .pipe(imagemin({
            progressive: true

        }))
        .pipe(gulp.dest('dist/img'));

    done();
});

gulp.task('scripts', function (done) {
    gulp.src('js/**/*.js')
        .pipe(concat('all.js'))
        .pipe(gulp.dest('dist/js'));
    done();
});

gulp.task('scripts-dist', function (done) {
    gulp.src('js/**/*.js')
        .pipe(sourcemaps.init())
        .pipe(concat('all.js'))
        .pipe(uglify())
        .on('error', function (err) {
            console.log(err.toString());
            this.emit('end');
        })
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('dist/js'));
    done();
});
