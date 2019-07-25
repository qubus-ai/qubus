[![Build Status](https://travis-ci.com/qubus-ai/qubus.svg?branch=master)](https://travis-ci.com/qubus-ai/qubus)
![GitHub Last Commit](https://img.shields.io/github/last-commit/qubus-ai/qubus.svg?style=flat)
![GutHub Languages](https://img.shields.io/github/languages/count/qubus-ai/qubus.svg?style=flat)
![GitHub Repo Size](https://img.shields.io/github/repo-size/qubus-ai/qubus.svg?style=flat)
![GitHub Code Size](https://img.shields.io/github/languages/code-size/qubus-ai/qubus.svg?style=flat)
![GitHub License](https://img.shields.io/github/license/qubus-ai/qubus.svg)

<p align="center">
  <img width="256" height="256" src="https://qubus.netlify.com/assets/256x256.png">
</p>

<p align="center" >
  cross platform geo-tagged image wiewer
</p>
 
## [About](http://qubus.netlify.com)

Desktop application build with Angular and Electron framework for browsing georefrenced images on OpenStreetMaps.


<p align="center">
  <img width="80%" height="auto" src="https://qubus.netlify.com/assets/qubus_mac_map.png">
</p>

---

<p align="center">
  <img width="80%" height="auto" src="https://qubus.netlify.com/assets/qubus_mac_list.png">
</p>

## Features
* Tiled and detailed view of images.
* Image positioning on the map
* Selection of map tiles overlay provider
* Thumbnails generation (Jimg or GraphicMagic)
* Image sorting methods.


## Build with
* [Angular](https://angular.io/) - The frontend - GUI
* [Electron](https://electronjs.org/) - Desktop App environment
* [Angular Material](https://material.angular.io/) - Material Design components for Angular
* [Electron Packager](https://github.com/electron/electron-packager) - Packaging of app
* [Material UI Icons](https://material.io/) - For the icons
* [npm](https://npmjs.org) - Installing packages
* [Openlayers](https://github.com/openlayers/openlayers) - Maps
* [Jimp](https://github.com/oliver-moran/jimp) - Image processing
* [gm](https://github.com/aheckmann/gm) - GraphicMagic
* [GeoJSON](https://github.com/caseycesari/GeoJSON.js) - Geojson
* [node-exif](https://github.com/gomfunkel/node-exif) - Extract of Exif metadata

## Build & Run

1. Build
```sh
git clone https://github.com/qubus-ai/qubus.git
npm install
npm run build-release
```

2.  Run
Just run application build in previous step:
```sh
npm run qubus
```
Build and run in production mode
```sh
npm run build-prod
```
Build and run in developlment mode (opened chrome devTools)
```sh
npm run build-dev
```
Build and run in developlment mode (opened chrome devTools)
```sh
npm run build-dev
```
 Build and run with front-end served by webpack-dev-server (changes automatically reloaded)
```sh
npm run build-dev
npm run qubus-remote
```


## License

The MIT License (MIT) © Qubus 2019
