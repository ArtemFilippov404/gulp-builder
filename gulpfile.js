const {src, dest, watch, parallel, series} = require('gulp');

const scss = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const browserSync = require('browser-sync').create();
const clean = require('gulp-clean');
const avif = require('gulp-avif');
const webp = require('gulp-webp');
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');
const include = require('gulp-include');

function pages() {
    return src('app/pages/*.html')
        .pipe(include({
            includePaths: 'app/components'
        }))
        .pipe(dest('app'))
        .pipe(browserSync.stream())
}

function images() {
    return src(['app/images/src/*.*', '!app/images/src/*.svg'])
    .pipe(newer('app/images'))
    .pipe(avif({ quality: 50 }))

    .pipe(src('app/images/src/*.*'))
    .pipe(newer('app/images'))
    .pipe(webp())

    .pipe(src('app/images/src/*.*'))
    .pipe(newer('app/images'))
    .pipe(imagemin())

    .pipe(dest('app/images'))
}

async function styles() {
    const autoprefixer = (await import('gulp-autoprefixer')).default;
    return src('app/scss/style.scss')
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 10 version']
        }))
        .pipe(concat('style.min.css'))
        .pipe(scss( {outputStyle: 'compressed'} ))
        .pipe(dest('app/css'))
        .pipe(browserSync.stream());
}

function scripts() {
    return src('app/js/main.js')
        .pipe(concat('main.min.js'))
        .pipe(uglify())
        .pipe(dest('app/js'))
        .pipe(browserSync.stream());
}

function watching() {
    browserSync.init({
        server: {
            baseDir: 'app/'
        }
    });
    watch(['app/scss/**/*.scss'], styles);
    watch(['app/images/src'], images);
    watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts);
    watch(['app/components/*', 'app/pages/*'], pages);
    watch(['app/*.html']).on('change', browserSync.reload);
}

function building() {
    return src([
        'app/css/style.min.css',
        'app/images/*.*',
        'app/fonts/*.*',
        'app/js/main.min.js',
        'app/**/*.html',
    ], {base: 'app'})
        .pipe(dest('dist'));
}

function cleanDist() {
    return src('dist')
        .pipe(clean());
}

exports.styles = styles;
exports.scripts = scripts;
exports.watching = watching;
exports.building = building;
exports.images = images;
exports.pages = pages;

// сборка проекта
exports.build = series(cleanDist, building);

// запуск сборки при изменении
exports.default = parallel(styles, scripts, pages, watching);