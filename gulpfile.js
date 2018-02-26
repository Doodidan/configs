"use strict"

var
  gulp         = require("gulp"),
  plumber      = require("gulp-plumber"),
  rename       = require("gulp-rename"),
  del          = require("del"),
  run          = require("run-sequence"),

  lr           = require("tiny-lr"),
  server       = require("browser-sync").create(),

  postcss      = require("gulp-postcss"),
  sourcemaps   = require("gulp-sourcemaps"),
  csso         = require("gulp-csso"),
  doiuse       = require("doiuse"),

  sorting      = require("postcss-sorting"),

  imagemin     = require("gulp-imagemin"),
  svgstore     = require("gulp-svgstore"),
  webp         = require("gulp-webp"),

  uglify       = require("gulp-uglify"),
  cssorder     = require("./cssorder").order;


var processors = [
  require("precss"),
  require("cssnext"),
  require("autoprefixer")
];

function clean () {
  return del( "build" );
};
gulp
  .task("clean", clean);

function serve () {
  server
    .init({
      "server": "build/",
      "notify": false,
      "open": true,
      "cors": true,
      "ui": false
    });

  gulp
    .watch("sources/css/**/*.css", ["styles"]);
  gulp
    .watch([
      "source/fonts/**",
      "source/js/**"
    ], ["copy"]);
  gulp
    .watch("build/img/**", ["img"]);
  gulp
    .watch("sources/img/icons/*.svg", ["sprite"]);
  gulp
    .watch("sources/js/**"), ["scripts"];
  gulp
    .watch("sources/*.html", ["html"]);
};
gulp
  .task("serve", ["build"], serve);

function html () {
  return gulp
    .src( "sources/*.html" )
    .pipe( plumber() )
    .pipe( gulp.dest("build") )
    .pipe( server.stream() );
};
gulp
  .task("html", html);

function copy () {
  return gulp
    .src( "sources/fonts/**", {
      "base": "sources"
    })
    .pipe( plumber() )
    .pipe( gulp.dest("build") )
    .pipe( server.stream() );
};
gulp
  .task("copy", copy);

function img () {
  return gulp
    .src( "sources/img/**" )
    .pipe( plumber() )
    .pipe( imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true}),
      imagemin.svgo()
    ]))
    .pipe( webp({quality: 90}) )
    .pipe( gulp.dest("build/img") )
    .pipe( server.stream() );
};
gulp
  .task("img", img);

function sprite () {
  return gulp
    .src( "sources/img/icons/*.svg" )
    .pipe( plumber() )
    .pipe( svgstore({
      "inlineSvg": true
    }))
    .pipe( rename("sprite.svg") )
    .pipe( gulp.dest("build/img") )
    .pipe( server.stream() );
};
gulp
  .task("sprite", sprite);

function styles () {
  return gulp
    .src( "sources/css/*.css" )
    .pipe( plumber() )
    .pipe( sourcemaps.init() )
    .pipe( postcss(processors) )
    .pipe( csso() )
    .pipe( rename(function (path) {
      path.basename += ".min";
    }))
    .pipe( sourcemaps.write(".") )
    .pipe( gulp.dest("build/css") )
    .pipe( server.stream() );
};
gulp
  .task("styles", styles);

function improve () {
  gulp
    .src( "sources/css/**/*.css" )
    .pipe( plumber() )
    .pipe( postcss([
      sorting( cssorder ),
      doiuse({
        "ignoreFiles": ['**/normalize.css'],
        "onFeatureUsage": function (usageInfo) {
          console.log(usageInfo.message);
        }
      })
    ]))
    .pipe( gulp.dest("sources/css") );
};
gulp
  .task("improve", improve);

function scripts () {
  return gulp
    .src( "sources/js/**" )
    .pipe( plumber() )
    .pipe( uglify() )
    .pipe( gulp.dest("build/js") )
    .pipe( server.stream() );
};
gulp
  .task("scripts", scripts);

gulp
  .task("build", function(done){
    run(
      "clean",
      "copy",
      "styles",
      "scripts",
      "img",
      "sprite",
      "html",
      done
    );
  });
