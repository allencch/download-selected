# Download Selected

Download selected URLs as Zip.

## Introduction

This project is inspired by [save-images](https://github.com/belaviyo/save-images).

Due to Firefox 57 and above drops the support of legacy add-on and `DownThemAll` is not updated with **WebExtensions** API, 
this project is created so that one can download a batch of selected URLs as a Zip file, such as URLs of images.

The filenames in the Zip is based on the HTML text instead of filenames from the URLs.

This extension is also Chrome compatible.

## Personal use case

1. Generate a list of links (`<a href />`), probably using Greasemonkey.
2. Highlight (select) the list of links.
3. Right-click, select **Download Selected**.
4. Wait for the browser to `fetch` the files and store as Zip.
5. When fetches and zip are completed, browser will popup a Save As dialog, save it and extract will get all the files.
