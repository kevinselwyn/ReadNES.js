/*globals define, document, module, ReadNES, window*/

(function (document, window, undefined) {
	"use strict";

	var ReadNESshiv = {
		init: function () {
			ReadNES.vars.shiv = "../shiv/ReadNESshiv.php";

			ReadNES.extend({
				events: function () {
					var input = this.el.input;

					input.onchange = this.iframe;

					return this;
				},
				iframe: function () {
					var $this = ReadNES, drag = $this.el.drag, iframe = {};

					drag.action = $this.vars.shiv;
					drag.target = "iframe";

					iframe = document.createElement("iframe");
					iframe.name = "iframe";
					iframe.id = "iframe";
					iframe.width = 0;
					iframe.height = 0;
					iframe.frameborder = 0;

					drag.appendChild(iframe);
					drag.submit();

					$this.el.iframe = iframe;

					if (iframe.addEventListener) {
						iframe.addEventListener("load", $this.read, false);
					} else {
						iframe.attachEvent("onload", $this.read);
					}

					return this;
				},
				read: function () {
					var $this = ReadNES, iframe = $this.el.iframe, data = {},
						content = iframe.contentDocument || iframe.contentWindow.document;

					data = $this.util.json(content.getElementsByTagName("body")[0].innerHTML);

					$this.rom.data.main = $this.util.base64_decode(data.main);
					$this.rom.data.name = data.name;

					$this.loaded();
				}
			});
		}
	};

	if (typeof module === "object" && module && typeof module.exports === "object") {
		module.exports = ReadNESshiv;
	} else {
		window.ReadNESshiv = ReadNESshiv;

		if (typeof define === "function" && define.amd) {
			define("ReadNESshiv", [], function () {
				return ReadNESshiv;
			});
		}
	}
}(document, window));