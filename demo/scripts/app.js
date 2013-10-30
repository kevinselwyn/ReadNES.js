/*globals define, document, Modernizr, require, requirejs, window*/

(function (document, window, undefined) {
	"use strict";

	requirejs.config({
		baseUrl: ".",
		paths: {
			"ReadNES": "../src/ReadNES",
			"ReadNESshiv": "../shiv/ReadNESshiv"
		}
	});

	require(["ReadNES", "ReadNESshiv"], function (ReadNES, ReadNESshiv) {
		ReadNES.init();
	});
}(document, window));