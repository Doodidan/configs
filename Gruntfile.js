module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    clean: {
      build: ["build"],
      html: ["build/*.html"],
      style: ["build/css"],
      img: ["build/img"],
      js: ["build/js"]
    },

    copy: {
      fonts: {
        files: [{
          expand: true,
          src: ["fonts/**/*.{woff,woff2}"],
          dest: "build"
        }]
      },
      html: {
        files: [{
          expand: true,
          cwd: 'html',
          src: '*.html',
          dest: "build"
        }]
      },
      js: {
        files: [{
          expand: true,
          src: ["js/*.js"],
          dest: "build"
        }]
      },
      img: {
        files: [{
          expand: true,
          src: [
          "img/**",
          "!**/icons/**",
          ],
          dest: "build"
        }]
      },
    },

    svgmin: {
      symbols: {
        files: [{
          expand: true,
          src: ["build/img/*.svg"]
        }]
      }
    },

    imagemin: {
      img: {
        options: {
          optimizationLevel: 3,
          progressive: true
        },
        files: [{
          expand: true,
          src: ["build/img/**/*.{png,jpg,gif}"]
        }]
      }
    },

    csscomb: {
      options: {
        config: 'csscomb.json'
      },
      main: {
        expand: true,
        cwd: 'sass/',
        src: ['*.scss'],
        dest: 'sass/',
      },
      blocks: {
        expand: true,
        cwd: 'sass/blocks/',
        src: ['*.scss'],
        dest: 'sass/blocks',
      },
      result: {
        expand: true,
        cwd: 'build/css/',
        src: ['*.css'],
        dest: 'build/css',
      }
    },

    sass: {
      style: {
        options: {
          outputStyle: "expanded"
        },
        files: {
          "build/css/style.css": "sass/style.scss"
        }
      }
    },

    postcss: {
      style: {
        options: {
          processors: [
          require("autoprefixer")({browsers: [
            "last 2 versions"
            ]}),
          require("css-mqpacker")({
            sort: true
          })
          ]
        },
        src: "build/css/*.css"
      }
    },

    csso: {
      style: {
        options: {
          report: "gzip"
        },
        files: {
          "build/css/style.min.css": ["build/css/style.css"]
        }
      }
    },

    svgstore: {
      options: {
        svg: {
          style: "display: none"
        }
      },
      symbols: {
        files: {
          "build/img/symbols.svg": ["img/icons/*.svg"]
        }
      }
    },

    browserSync: {
      server: {
        bsFiles: {
          src: ["build/**"]
        },
        options: {
          server: "build/",
          watchTask: true
        }
      }
    },

    watch: {
      html: {
        files: ["html/**"],
        tasks: [
          "clean:html",
          "copy:html"
        ]
      },
      js: {
        files: ["js/**"],
        tasks: [
          "clean:js",
          "copy:js"
        ]
      },
      img: {
        files: ["img/**"],
        tasks: [
          "clean:img",
          "copy:img",
          "svgstore"
        ]
      },
      style: {
        files: ["sass/**"],
        tasks: ["build-css"]
      }
    }
  });

  grunt.registerTask("serve", [
    "browserSync",
    "watch"
    ]);

  grunt.registerTask("build-css", [
    "sass",
    "csscomb:result",
    "postcss",
    "csso"
    ]);

  grunt.registerTask("build-common", [
    "clean:build",
    "copy",
    "build-css"
    ]);
  grunt.registerTask("build-dev", [
    "build-common",
    "svgstore"
    ]);
  grunt.registerTask("build", [
    "build-common",
    "svgmin",
    "svgstore",
    "imagemin"
    ]);
};
