const gulp = require('gulp'),
    prefixer = require('gulp-autoprefixer'),
    htmlmin = require('gulp-htmlmin'),
    rimraf = require('rimraf'),
    rigger = require('gulp-rigger'),
    plumber = require('gulp-plumber'),
    sass = require('gulp-sass'),
    terser = require('gulp-terser'),
    imagemin= require('gulp-imagemin'),
    browserSync = require('browser-sync'),
    reload = browserSync.reload

path = {
    build: {
        html:'build/',
        css: 'build/css/',
        js:'build/js/',
        img:'build/img/'
    },
    src: {
        html:'src/*.{html,htm}',
        scss: 'src/scss/style.scss',
        js:['src/js/app.js', 'src/js/modernizr.js'],
        img:'src/img/*.{jpg,jpeg,gif,png,svg}'
    },
    watch: {
        html:'src/*.{html,htm}',
        scss: 'src/scss/**/*.scss',
        js: 'src/js/app.js',
        img:'src/img/**/*.{jpg,jpeg,gif,png,svg}'
    },
    clean: 'build'
};
config = {
    server: {
        baseDir: "build/", // base directory
        index:"index.html", // start page
    },
    // tunnel: "i-can-more", // tunnel
    // tunnel: true,
    host: 'localhost',
    port: 7787
};


gulp.task('clean',function (done){
    rimraf(path.clean,done);
});

gulp.task('html:dev',function (done){
    gulp.src(path.src.html)
        .pipe(plumber())
        .pipe(htmlmin({
            collapseWhitespace:true
        }))
        .pipe(gulp.dest(path.build.html))
        .pipe(reload({stream:true}));
    done();
});

gulp.task('scss:dev',function (done){
    gulp.src(path.src.scss,{sourcemaps:true})
        .pipe(plumber())
        .pipe(sass({
            outputStyle: "compressed",
            sourcemaps:true
        }))
        .pipe(prefixer({
            remove:true,
            cascade:false
        }))
        .pipe(gulp.dest(path.build.css,{sourcemaps:'.'}))
        .pipe(reload({stream:true}));
    done();
});

gulp.task('js:dev',function (done){
    gulp.src(path.src.js)
        .pipe(plumber())
        .pipe(rigger())
        .pipe(terser())
        .pipe(gulp.dest(path.build.js))
        .pipe(reload({stream:true}));
    done();
});

gulp.task('mv:img',function (done){
    gulp.src(path.src.img)
        .pipe(plumber())
        .pipe(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.mozjpeg({quality: 60, progressive: true}),
            imagemin.optipng({optimizationLevel: 5}),
            imagemin.svgo({
                plugins: [
                    {removeViewBox: false},
                    {cleanupIDs: false}
                ]
            })
        ]))
        .pipe(gulp.dest(path.build.img))
        .pipe(reload({stream:true}));
    done();
});

gulp.task('watch',function (done){
    gulp.watch(path.watch.html, gulp.parallel('html:dev'));
    gulp.watch(path.watch.scss, gulp.series('scss:dev'));
    gulp.watch(path.watch.js, gulp.series('js:dev'));
    gulp.watch(path.watch.img, gulp.series('mv:img'));
    done();
});

gulp.task('myServer',function (done){
    browserSync(config);
    done();
});


gulp.task('default', gulp.series('clean', gulp.parallel('html:dev','scss:dev', 'js:dev','mv:img'), 'watch', 'myServer'));