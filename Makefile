.PHONY: build builddir

build: build/vivagraph.js build/*.html

build/vivagraph.js: package.json vivagraph.js
	mkdir -p build
	./node_modules/.bin/browserify vivagraph.js -o $@

build/*.html: *.html
	mkdir -p build
	cp *.html build/
