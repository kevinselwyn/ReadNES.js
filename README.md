# ReadNES.js

ReadNES.js is a Javascript port of [readnes](http://www.raphnet.net/electronique/nes_cart/nes_cart_en.php) by Raphaël Assénat. It splits ROMs for the Nintendo Entertainment System into a PRG (program data) and a CHR (character data) for writing onto physical game cartridges.

[View live demo](http://kevinselwyn.com/ReadNES.js/)

## Usage

Clone this repo and navigate your browser to `demo/index.html`.

Drag-and-drop a ROM onto the cart to recieve the component parts.

## Shiv

Since FileReader (and the HTML5 File API in general) is not available on some browsers, a shiv is included to allow the demo to work.

The shiv utilizes a PHP script to retrieve the file data, so the demo needs to be running on an Apache Linux server with PHP installed.

## Support

ReadNES.js has been tested and is working on:

**Mac**

*	Chrome
*	Firefox
*	Safari
*	Opera

**PC**

*	IE8\*
*	IE9\*
*	IE10
*	Chrome
*	Firefox
*	Safari
*	Opera

\* The splitting process works, but downloading base64-encoded URLs does not

## Disclaimer

Please read Nintendo's [rules](http://www.nintendo.com/corp/legal.jsp) regarding ROMs and emulation. I do not provide ROMs in this project and all intellectual property belongs to Nintendo with all rights reserved.
