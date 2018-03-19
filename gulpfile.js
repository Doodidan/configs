"use strict"

let
// подключение

// общие модули галпа
  gulp         = require("gulp"),
  plumber      = require("gulp-plumber"),
  rename       = require("gulp-rename"),
  del          = require("del"),
  run          = require("run-sequence"),

// модули для сервера
  server       = require("browser-sync").create(),

// модули для css
  postcss      = require("gulp-postcss"),
  sourcemaps   = require("gulp-sourcemaps"),
  csso         = require("gulp-csso"),
  doiuse       = require("doiuse"),
  sorting      = require("postcss-sorting"),
// файл настроек сортировки css-свойств
  cssorder     = require("./cssorder").order,

// модули для картинок
  imagemin     = require("gulp-imagemin"),
  svgstore     = require("gulp-svgstore"),
  injectSvg    = require("gulp-inject-svg"),

// модули для js
  uglify       = require("gulp-uglify");

// объект используемых для сборки модулей postcss
let processors = [
  require("precss"),
  require("cssnext"),
  require("autoprefixer")
];

// пути, используемые при сборке
let paths = {
  source: "./sources/",
  dev: "./build_dev/",
  prod: "./build_prod/"
};

// запуск сервера (синхронизация браузера)
let serve = {
  dev: function () {
    // инициация
    server
      .init({
        server: paths.dev,
        "notify": false,
        "open": true,
        "cors": true,
        "ui": false
      });

    // отслеживание изменений файлов
    // css
    gulp
      .watch(`${paths.source}css/**/*.css`, ["styles_dev"]);
    // файлы без изменений (шрифты)
    gulp
      .watch(`${paths.source}fonts/**`, ["copy_dev"]);
    // картинки
    gulp
      .watch([
        `${paths.source}img/**`,
        `!${paths.source}img/icons/**/*.svg`
      ], ["img_dev"]);
    // свг-иконки (спрайт) + инъекция в html
    gulp
      .watch(`${paths.source}img/icons/**/*.svg`, ["html_dev"]);
    // скрипты
    gulp
      .watch(`${paths.source}js/**/*.js`), ["scripts_dev"];
    // html
    gulp
      .watch(`${paths.source}*.@(html|php)`, ["html_dev"]);
  }
};

// очистка (удаление) папок со сборками
let clean = {
  // разработка
  dev: {
    // шрифты
    fonts: function () {
      return del( `${paths.dev}fonts/` );
    },
    // стили
    styles: function () {
      return del( `${paths.dev}css/` );
    },
    // скрипты
    js: function () {
      return del( `${paths.dev}js/` );
    },
    // картинки
    img: function () {
      return del( `${paths.dev}img/` );
    },
    sprite: function () {
      return del( `${paths.dev}img/${sprite.filename}` );
    },
    // html
    html: function () {
      return del( `${paths.dev}*.html` );
    },
    // всё
    full: function () {
      return del( paths.dev );
    }
  },
  // продакшн
  prod: {
    // шрифты
    fonts: function () {
      return del( `${paths.prod}fonts/` );
    },
    // стили
    styles: function () {
      return del( `${paths.prod}css/` );
    },
    // скрипты
    js: function () {
      return del( `${paths.prod}js/` );
    },
    // картинки
    img: function () {
      return del( `${paths.prod}img/` );
    },
    sprite: function () {
      return del( `${paths.prod}img/${sprite.filename}` );
    },
    // html
    html: function () {
      return del( `${paths.prod}*.html` );
    },
    // всё
    full: function () {
      return del( paths.prod );
    }
  },
  // все папки
  full: function () {
    clean.dev.full();
    clean.prod.full();
  }
};

// копирование файлов без изменений
let copy = {
  // общее
  main: function () {
    return gulp
      .src( `${paths.source}fonts/**`, {
        "base": paths.source
      })
      .pipe( plumber() );
  },
  // разработка
  dev: function () {
    return copy.main()
      .pipe( gulp.dest( paths.dev ) )
      .pipe( server.stream() );
  },
  // продакшн
  prod: function () {
    return copy.main()
      .pipe( gulp.dest( paths.prod ) );
  }
};

// сборка стилей
let styles = {
  // общее
  main: function () {
    return gulp
      .src( `${paths.source}css/*.css` )
      .pipe( plumber() );
  },
  // разработка
  dev: function () {
    return styles.main()
      // начало отслеживания sourcemaps
      .pipe( sourcemaps.init() )
      // сборка стилей через postcss
      .pipe( postcss(processors) )
      // переименование, чтобы нормально работал html
      .pipe( rename(function (path) {
        path.basename += ".min";
      }))
      // запись конечных sourcemaps
      .pipe( sourcemaps.write(".") )
      .pipe( gulp.dest(`${paths.dev}css/`) )
      .pipe( server.stream() );
  },
  // продакшн
  prod: function () {
    return styles.main()
      // сборка стилей через postcss
      .pipe( postcss(processors) )
      // минификация css
      .pipe( csso() )
      // переименование
      .pipe( rename(function (path) {
        path.basename += ".min";
      }))
      .pipe( gulp.dest(`${paths.prod}css/`) );
  }
};

// обработка скриптов
let scripts = {
  // общее
  main: function () {
    return gulp
      .src( `${paths.source}js/**/*.js` )
      .pipe( plumber() );
  },
  // разработка
  dev: function () {
    return scripts.main()
      .pipe( gulp.dest(`${paths.dev}js`) )
      .pipe( server.stream() );
  },
  // продакшн
  prod: function () {
    return scripts.main()
      .pipe( uglify() )
      .pipe( gulp.dest(`${paths.prod}js`) );
  }
};

// обработка картинок
let img = {
  // общее
  main: function () {
    return gulp
      .src([
        `${paths.source}img/**`,
        // исключить свг-иконки из обработки
        `!${paths.source}img/icons/**/*.svg`
      ])
      .pipe( plumber() );
  },
  // разработка
  dev: function () {
    return img.main()
      .pipe( gulp.dest(`${paths.dev}img/`) )
      .pipe( server.stream() );
  },
  // продакшн
  prod: function () {
    return img.main()
      .pipe( imagemin([
        imagemin.optipng({optimizationLevel: 3}),
        imagemin.jpegtran({progressive: true}),
        imagemin.svgo()
      ]))
      .pipe( gulp.dest(`${paths.prod}img/`) );
  },
};

// свг-спрайт
let sprite = {
  // название файла спрайта
  filename: "sprite.svg",
  // общее
  main: function () {
    return gulp
      .src( `${paths.source}img/icons/**/*.svg` )
      .pipe( plumber() )
      .pipe( imagemin([
        imagemin.svgo()
      ]))
      .pipe( svgstore({
        "inlineSvg": true
      }))
      .pipe( rename( sprite.filename ) );
  },
  // разработка
  dev: function () {
    return sprite.main()
      .pipe( gulp.dest(`${paths.dev}img/`) )
      .pipe( server.stream() );
  },
  // продакшн
  prod: function () {
    return sprite.main()
      .pipe( gulp.dest(`${paths.prod}img/`) );
  }
};

// сборка html
let html = {
  // общее
  main: function () {
    return gulp
      .src( `${paths.source}*.@(html|php)` )
      .pipe( plumber() );
  },
  // разработка
  dev: function () {
    return html.main()
      .pipe( injectSvg({
        base: paths.dev
      }))
      .pipe( gulp.dest( paths.dev ) )
      .pipe( server.stream() );
  },
  // продакшн
  prod: function () {
    return html.main()
      .pipe( injectSvg({
        base: paths.prod
      }))
      .pipe( gulp.dest( paths.prod ) );
  }
};

// анализ и автоматическая обработка исходников
let improve = {
  dev: function () {
    return gulp
      .src([
        `${paths.source}css/**/*.css`,
        `!**/normalize?(.min).@(css|scss|sass|less)`
      ])
      .pipe( plumber() )
      .pipe( postcss([
        // сортировка css
        sorting( cssorder ),
        // проверка свойств на поддержку в браузерах
        doiuse({
          "onFeatureUsage": function (usageInfo) {
            console.log(usageInfo.message);
          }
        })
      ]))
      // (пере)запись в исходниках
      .pipe( gulp.dest(`${paths.source}css/`) );
  }
};

// регистрация тасков
// сервер
gulp
  .task("serve", ["build_dev"], serve.dev);

// очистка
gulp
  .task("clean_dev_fonts", clean.dev.fonts);
gulp
  .task("clean_dev_styles", clean.dev.styles);
gulp
  .task("clean_dev_js", clean.dev.js);
gulp
  .task("clean_dev_img", clean.dev.img);
gulp
  .task("clean_dev_sprite", clean.dev.sprite);
gulp
  .task("clean_dev_html", clean.dev.html);
gulp
  .task("clean_dev", clean.dev.full);
gulp
  .task("clean_prod_fonts", clean.prod.fonts);
gulp
  .task("clean_prod_styles", clean.prod.styles);
gulp
  .task("clean_prod_js", clean.prod.js);
gulp
  .task("clean_prod_img", clean.prod.img);
gulp
  .task("clean_prod_sprite", clean.prod.sprite);
gulp
  .task("clean_prod_html", clean.prod.html);
gulp
  .task("clean_prod", clean.prod.full);
gulp
  .task("clean", clean.full);

// копирование
gulp
  .task("copy_dev", ["clean_dev_fonts"], copy.dev);
gulp
  .task("copy_prod", ["clean_prod_fonts"], copy.prod);

// стили
gulp
  .task("styles_dev", ["clean_dev_styles"], styles.dev);
gulp
  .task("styles_prod", ["clean_prod_styles"], styles.prod);

// скрипты
gulp
  .task("scripts_dev", ["clean_dev_js"], scripts.dev);
gulp
  .task("scripts_prod", ["clean_prod_js"], scripts.prod);

// картинки
gulp
  .task("img_dev", ["clean_dev_img"], img.dev);
gulp
  .task("img_prod", ["clean_prod_img"], img.prod);
gulp
  .task("sprite_dev", ["clean_dev_sprite"], sprite.dev);
gulp
  .task("sprite_prod", ["clean_prod_sprite"], sprite.prod);

// html
gulp
  .task("html_dev", ["clean_dev_html", "sprite_dev"], html.dev);
gulp
  .task("html_prod", ["clean_prod_html", "sprite_prod"], html.prod);

// анализ
gulp
  .task("improve", improve.dev);

// такси сборки (составные, последовательные)
gulp
  .task("build_dev", [
    "copy_dev",
    "styles_dev",
    "scripts_dev",
    "img_dev",
    "html_dev"
  ]);
gulp
  .task("build_prod", [
    "copy_prod",
    "styles_prod",
    "scripts_prod",
    "img_prod",
    "html_prod"
  ]);
