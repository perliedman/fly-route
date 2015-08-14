#!/bin/sh

mkdir -p assets
cp -a node_modules/mapbox-gl/dist/font node_modules/mapbox-gl/dist/*.css assets/
browserify -o site.js index.js
