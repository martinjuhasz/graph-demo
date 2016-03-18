.PHONY: build builddir

build: build/vivagraph.js build/sigma.js build/*.html

build/vivagraph.js: package.json vivagraph.js src/*.js
	mkdir -p build
	./node_modules/.bin/browserify vivagraph.js -o $@

build/sigma.js: package.json sigma.js src/*.js
	mkdir -p build
	./node_modules/.bin/browserify sigma.js -o $@
	cp ./node_modules/sigma/build/sigma.min.js build/
	cp ./node_modules/sigma/build/plugins/sigma.layout.forceAtlas2.min.js build/

build/*.html: *.html
	mkdir -p build
	cp *.html build/
