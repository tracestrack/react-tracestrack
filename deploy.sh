#!/bin/bash

mv build/index.html build/404.html
mv build/real_index.html build/index.html

rm -rf tracestrack.github.io
git clone --depth 1 git@github.com:tracestrack/tracestrack.github.io.git

rm tracestrack.github.io/static/css/*
rm tracestrack.github.io/static/js/*
rm precache-manifest*

cp -r build/* tracestrack.github.io
cd tracestrack.github.io
git add .
git commit -am "update"
git push

rm -rf tracestrack.github.io
