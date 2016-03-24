.DEFAULT_GOAL := help
.PHONY: build builddir help

build: build/vivagraph.js build/sigma.js build/*.html build/avatar.png ## build the demo

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

build/avatar.png: avatar.png
	cp $< $@

help: ## (default), display the list of make commands
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
