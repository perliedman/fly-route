#!/bin/sh
npm run build
watchify -o site.js index.js &
http-server
