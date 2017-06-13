Automation for grunt
================================

## Installation

1. Install [Node.js](http://nodejs.org) (and [npm](https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager) on Linux).

3. Copy files to your project folder.

2. Install dependencies by typing the following in a terminal (in project folder):
```
npm i
```

## Structure

build/
| - [result of build tasks]
fonts/
| - [fonts files *.woff, *.woff2]
html/
| - [all *.html files]
img/
| - [images in *.gif, *.png, *.jpg, *.svg formats]
| - icons/
| - | - [*.svg icons]
js/
| - [scripts *.js files]
sass/
| - style.scss
| - [global *.scss files]
| - blocks/
| - | - [BEM blocks *.scss files]

## Tasks

Travis test running:
```
npm run test
```

Csscomb *.scss running:
```
npm run comb
```

Production build running:
```
npm run build
```

Developer build running:
```
npm run build-dev
```

Brouser sync and watch tak running:
```
npm run start
```
