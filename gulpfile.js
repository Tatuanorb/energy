import gulp from 'gulp';
import plumber from 'gulp-plumber';
import sass from 'gulp-dart-sass';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import browser from 'browser-sync';
import htmlmin from 'gulp-htmlmin';
import csso from 'gulp-csso';
import rename from 'gulp-rename';
import svgstore from 'gulp-svgstore';
import imageMin from 'gulp-imagemin';
import webp from 'gulp-webp';
import cleaner from 'del';

// Styles

export const styles = () => {
  return gulp.src('source/sass/style.scss', { sourcemaps: true })
    .pipe(plumber())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(csso())
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/css', { sourcemaps: '.' }))
    .pipe(browser.stream());
}


// html
const html = () => {
  return gulp.src('source/*.html')
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest('build'));
}

const imagesOptimaze = () => {
  return gulp.src('source/img/**/*.{png,jpg,svg}')
    .pipe(imageMin())
    .pipe(gulp.dest('build/img'));
}

const imagesCopy = () => {
  return gulp.src('source/img/**/*.{jpg,png,svg}')
    .pipe(gulp.dest('build/img'));
}

//svgsprites
const sprite = () => {
  return gulp.src('source/img/icons/*.svg')
    .pipe(svgstore({ inlineSvg: true }))
    .pipe(rename('sprite.svg'))
    .pipe(gulp.dest('build/img'));

}

//webp
const webpConveter = () => {
  return gulp.src('source/img/**/*.{jpg,png}')
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest('build/img'));
}

//copy
const copy = () => {
  return gulp.src([
    'source/fonts/*.{woff,woff2}',
    'source/*.ico',
    'source/manifest.webmanifest',
    'source/**/*.svg',
    '!source/icons/*.svg',
    'source/img/**/*.{jpg,png}',


  ],
    { base: 'source' }
  )
    .pipe(gulp.dest('build'))
  done();
}

//clean
const clean = () => {
  return cleaner('build');
}

// Server

const server = (done) => {
  browser.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

// Watcher

export const reload = (done) => {
  browser.reload()
  done()
}

const watcher = () => {
  gulp.watch("source/sass/**/*.scss", gulp.series("styles"));
  gulp.watch("source/*.html", gulp.series(html, reload));
}


export const build = gulp.series(
  clean,
  copy,
  imagesOptimaze,
  gulp.parallel(
    styles,
    html,
    sprite,
    webpConveter
  ),
);


export default gulp.series(
  clean,
  copy,
  imagesCopy,
  gulp.parallel(
    styles,
    html,
    sprite,
    webpConveter
  ),

  gulp.series(
    server,
    watcher)
);
