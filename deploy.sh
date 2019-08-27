#!/bin/bash

set -e

mv build/index.html build/404.html
mv build/real_index.html build/index.html

rm -rf tracesapp2015.github.io
git clone --depth 1 git@github.com:TracesApp2015/tracesapp2015.github.io.git

rm tracesapp2015.github.io/static/css/*
rm tracesapp2015.github.io/static/js/*

cp -r build/* tracesapp2015.github.io
cd tracesapp2015.github.io
git add .
git commit -am "update"
git push

rm -rf tracesapp2015.github.io
