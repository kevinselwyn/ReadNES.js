/*globals alert, CustomEvent, define, document, FileReader, module, ReadNESshiv, window*/
/*jslint bitwise: true, evil: true, plusplus: true*/

(function (document, window, undefined) {
	"use strict";

	var ReadNES = {
		rom: {
			size: 0,
			header: {
				prg: "",
				chr: "",
				mapper: "",
				mapper1: "",
				reserved: ""
			},
			prg: 16 * 1024,
			chr: 8 * 1024,
			data: {
				main: "",
				name: "",
				chr: "",
				prg: ""
			}
		},
		output: [],
		vars: {
			chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
			cursor: 0,
			reader: {},
			file: {}
		},
		el: {
			drag: document.getElementById("drag"),
			input: document.getElementById("input"),
			output: document.getElementById("output"),
			message: document.getElementById("message"),
			prg: document.getElementById("prg"),
			chr: document.getElementById("chr")
		},
		util: {
			support: function () {
				return (typeof FileReader !== "undefined");
			},
			error: function (msg) {
				if (Error) {
					throw new Error(msg);
				}

				alert(msg);

				return false;
			},
			printf: function () {
				var $this = ReadNES, args = [], str = "", i = 0, l = 0;

				for (i = 0, l = arguments.length; i < l; i += 1) {
					args.push(arguments[i]);
				}

				str = args[0];

				for (i = 1, l = args.length; i < l; i += 1) {
					str = str.replace(/%\w{1}/, args[i]);
				}

				$this.output.push(str);

				return this;
			},
			dec2hex: function (dec) {
				var int = 0, hex = "";

				int = dec.charCodeAt(0);
				hex = int.toString(16).toUpperCase();

				return hex;
			},
			hex2dec: function (hex) {
				var int = 0, dec = "";

				int = parseInt(hex.toLowerCase(), 16);
				dec = String.fromCharCode(int);

				return dec;
			},
			index: function (input) {
				var $this = ReadNES, chars = $this.vars.chars, i = 0, l = 0;

				for (i = 0, l = chars.length; i < l; i += 1) {
					if (chars[i] === input) {
						return i;
					}
				}

				return 0;
			},
			base64_encode: function (input) {
				var $this = ReadNES, output = "", chr = [], enc = [],
					i = 0, j = 0, l = 0;

				while (i < input.length) {
					chr[0] = input.charCodeAt(i);
					chr[1] = input.charCodeAt(i + 1);
					chr[2] = input.charCodeAt(i + 2);

					i += 3;

					enc[0] = chr[0] >> 2;
					enc[1] = ((chr[0] & 3) << 4) | (chr[1] >> 4);
					enc[2] = ((chr[1] & 15) << 2) | (chr[2] >> 6);
					enc[3] = chr[2] & 63;

					if (isNaN(chr[1])) {
						enc[2] = enc[3] = 64;
					} else if (isNaN(chr[2])) {
						enc[3] = 64;
					}

					for (j = 0, l = 4; j < l; j += 1) {
						output += $this.vars.chars[enc[j]];
					}
				}

				return output;
			},
			base64_decode: function (input) {
				var $this = ReadNES, output = "", chr = [], enc = [], i = 0;

				while (i < input.length) {
					enc[0] = $this.util.index(input[i]);
					enc[1] = $this.util.index(input[i + 1]);
					enc[2] = $this.util.index(input[i + 2]);
					enc[3] = $this.util.index(input[i + 3]);

					i += 4;

					chr[0] = (enc[0] << 2) | (enc[1] >> 4);
					chr[1] = ((enc[1] & 15) << 4) | (enc[2] >> 2);
					chr[2] = ((enc[2] & 3) << 6) | enc[3];

					output += String.fromCharCode(chr[0]);

					if (enc[2] !== 64) {
						output += String.fromCharCode(chr[1]);
					}
					if (enc[3] !== 64) {
						output += String.fromCharCode(chr[2]);
					}
				}

				return output;
			},
			extension: function (name, ext) {
				var parts = name.split(".");

				parts[parts.length - 1] = ext;

				return parts.join(".");
			},
			str_repeat: function (input, mult) {
				return new Array(parseInt(mult, 10) + 1).join(input);
			},
			json: function (str) {
				if (JSON.parse !== "undefined") {
					return JSON.parse(str);
				}

				str = (str === "") ? '""' : str;
				return eval("(" + str + ");");
			}
		},
		extend: function (obj) {
			var i = 0;

			for (i in obj) {
				if (obj.hasOwnProperty(i)) {
					this[i] = obj[i];
				}
			}

			return this;
		},
		trigger: function (name) {
			var event = new CustomEvent(name);

			document.dispatchEvent(event);

			return this;
		},
		drag: {
			over: function (e) {
				e.stopPropagation();
				e.preventDefault();
				e.dataTransfer.dropEffect = "copy";

				this.className = "over";

				return false;
			},
			drop: function (e) {
				var files = e.dataTransfer || e.target, $this = ReadNES;

				$this.vars.file = files.files[0];
				$this.rom.data.name = files.files[0].name;
				$this.trigger("file/read");

				this.className = "";

				e.stopPropagation();
				e.preventDefault();

				return false;
			}
		},
		events: function () {
			var drag = this.el.drag, input = this.el.input;

			drag.addEventListener("dragover", this.drag.over, false);
			drag.addEventListener("drop", this.drag.drop, false);

			input.addEventListener("change", this.drag.drop, false);

			document.addEventListener("file/read", this.read, false);
			document.addEventListener("file/loaded", this.loaded, false);

			return this;
		},
		read: function () {
			var $this = ReadNES, reader = new FileReader(),
				file = $this.vars.file;

			reader.onloadend = function (e) {
				if (e.target.readyState === FileReader.DONE) {
					$this.rom.data.main = e.target.result;
					$this.trigger("file/loaded");
				}
			};

			reader.readAsBinaryString(file);

			return this;
		},
		loaded: function () {
			var $this = ReadNES, parse = $this.parse, i = 0;

			for (i in parse) {
				if (parse.hasOwnProperty(i)) {
					parse[i].call();
				}
			}
		},
		parse: {
			size: function () {
				var $this = ReadNES, data = $this.rom.data.main;

				$this.util.printf("File length: %d Bytes", data.length);

				$this.rom.size = data.length;

				return this;
			},
			magic: function () {
				var $this = ReadNES, cursor = $this.vars.cursor,
					data = $this.rom.data.main;

				if (!(data[cursor++] === "N" &&
					data[cursor++] === "E" &&
					data[cursor++] === "S" &&
					data[cursor++] === $this.util.hex2dec("1A"))) {
					$this.util.error("Bad header");
				}

				$this.vars.cursor = cursor;

				return this;
			},
			header: function () {
				var $this = ReadNES, cursor = $this.vars.cursor,
					data = $this.rom.data.main, header = {}, i = 0, l = 0;

				header = {
					prg: data[cursor++],
					chr: data[cursor++],
					mapper: data[cursor++],
					mapper1: data[cursor++],
					reserved: ""
				};

				for (i = 0, l = 8; i < l; i += 1) {
					header.reserved += data[cursor++];
				}

				$this.util.printf("NES PRG: %d CHR: %d MAPPER: %d %d",
                    header.prg.charCodeAt(0),
                    header.chr.charCodeAt(0),
                    header.mapper.charCodeAt(0),
                    header.mapper1.charCodeAt(0));

				$this.vars.cursor = cursor;
				$this.rom.header = header;

				return this;
			},
			mapper: function () {
				var $this = ReadNES,
					mapper = $this.rom.header.mapper.charCodeAt(0),
					output = [];

				switch (mapper >> 4) {
				case 0:
					output.push("No mapper");
					$this.util.printf("No mapper");
					break;
				case 1:
					$this.util.printf("Nintendo MMC1");
					break;
				case 2:
					$this.util.printf("PRG Switch (konami)");
					break;
				case 3:
					$this.util.printf("VROM (CHR) Switch");
					break;
				case 4:
					$this.util.printf("Nintendo MMC3");
					break;
				case 5:
					$this.util.printf("Nintendo MMC5");
					break;
				default:
					$this.util.printf("Mapper number: %d", mapper >> 4);
					break;
				}

				return this;
			},
			flags: function () {
				var $this = ReadNES,
					mapper = $this.rom.header.mapper & $this.util.hex2dec("0F").charCodeAt(0);

				$this.util.printf("Flags: %d", mapper);

				switch (mapper) {
				case 0:
					$this.util.printf("H");
					break;
				case 1:
					$this.util.printf("V");
					break;
				case 2:
					$this.util.printf("H + Bat");
					break;
				case 3:
					$this.util.printf("V + Bat");
					break;
				default:
					break;
				}

				return this;
			},
			split: function () {
				var $this = ReadNES, rom = $this.rom, data = $this.rom.data.main,
					cursor = $this.vars.cursor,
					prg = {
						data: "",
						header: parseInt($this.rom.header.prg.charCodeAt(0), 10),
						length: $this.rom.prg
					},
					chr = {
						data: "",
						header: parseInt($this.rom.header.chr.charCodeAt(0), 10),
						length: $this.rom.chr
					},
					i = 0, l = 0;

				prg.length *= prg.header;
				chr.length *= chr.header;

				$this.util.printf("PRG %d page%d of 16kb (%d bytes)", prg.header, (prg.header > 1) ? "s" : "", prg.length);
				$this.util.printf("CHR %d page%d of 8kb (%d bytes)", chr.header, (chr.header > 1) ? "s" : "", chr.length);

				for (i = 0, l = prg.length; i < l; i += 1) {
					prg.data += data[cursor++];
				}

				for (i = 0, l = chr.length; i < l; i += 1) {
					chr.data += data[cursor++];
				}

				$this.util.printf("End at %d", cursor);
				$this.util.printf("Remaining bytes: %d", rom.size - cursor);

				$this.rom.data.prg = prg.data;
				$this.rom.data.chr = chr.data;

				return this;
			},
			output: function () {
				var $this = ReadNES, rom = $this.rom, output = $this.output,
					prg = [], chr = [], mult = [], message = $this.el.message;

				mult[0] = $this.util.str_repeat(rom.data.prg, $this.el.prg.value);
				mult[1] = $this.util.str_repeat(rom.data.chr, $this.el.chr.value);

				prg[0] = message.getElementsByTagName("a")[0];
				chr[0] = message.getElementsByTagName("a")[1];

				prg[0].href = "data:application/octet-stream;base64," + $this.util.base64_encode(mult[0]);
				chr[0].href = "data:application/octet-stream;base64," + $this.util.base64_encode(mult[1]);

				prg[1] = document.createTextNode($this.util.extension(rom.data.name, "prg"));
				chr[1] = document.createTextNode($this.util.extension(rom.data.name, "chr"));

				prg[0].appendChild(prg[1]);
				chr[0].appendChild(chr[1]);

				message.getElementsByTagName("p")[0].innerHTML = output.join("<br />");

				message.className = "show";
			}
		},
		init: function () {
			if (!this.util.support()) {
				ReadNESshiv.init();
			}

			this.events();

			return true;
		}
	};

	window.ReadNESshiv = window.ReadNESshiv || {
		init: function () {
			ReadNES.util.error("ReadNESshiv has not been activated");
		}
	};

	if (typeof module === "object" && module && typeof module.exports === "object") {
		module.exports = ReadNES;
	} else {
		window.ReadNES = ReadNES;

		if (typeof define === "function" && define.amd) {
			define("ReadNES", [], function () {
				return ReadNES;
			});
		}
	}
}(document, window));