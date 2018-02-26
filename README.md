Front-end automation for gulp
================================

## Installation

1. Install [Node.js](http://nodejs.org) (and [npm](https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager) on Linux).

2. Copy files to your project folder.

3. Install dependencies by typing the following in a terminal (in project folder):
```
npm i
```

## Structure

- build/
  - [result of build tasks]
- sources/
  - fonts/
    - [fonts files *.woff, *.woff2]
  - img/
    - [images in *.gif, *.png, *.jpg, *.svg formats]
    - icons/
      - [*.svg icons]
  - js/
    - [scripts *.js files]
  - css/
    - style.css
    - [global *.css files]
    - blocks/
      - [BEM blocks *.css files]
  - [all *.html files]

## Tasks

Travis test running:
```
npm run test
```

Improve *.css sources and give some advice running:
```
npm run improve
```

Production build running:
```
npm run build
```

Serve and file watch task running:
```
npm run start
```
