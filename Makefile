all: download-selected.zip

download-selected.zip: src/*.js src/*.json
	cd src; zip -FS "../$@" *
