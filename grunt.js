/*global module:false*/
module.exports = function (grunt) {
	"use strict";

	grunt.initConfig({
		pkg: '<json:package.json>',
		meta: {
			banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
					'<%= grunt.template.today("yyyy-mm-dd") %>\n' +
					'<%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %>' +
					'* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
					' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */'
		},
		lint: {
			files: ['grunt.js', 'src/**/*.js', 'shiv/**/*.js']
		},
		min: [
			{
				src: ['<banner:meta.banner>', 'src/ReadNES.js'],
				dest: 'dist/ReadNES.min.js'
			},
			{
				src: ['<banner:meta.banner>', 'shiv/ReadNESshiv.js'],
				dest: 'dist/ReadNESshiv.min.js'
			}
		],
		watch: {
			files: '<config:lint.files>',
			tasks: 'lint test'
		},
		jshint: {
			options: {
				curly: true,
				eqeqeq: true,
				immed: true,
				latedef: true,
				newcap: true,
				noarg: true,
				sub: true,
				undef: true,
				boss: true,
				eqnull: true
			},
			globals: {}
		},
		uglify: {}
	});

	grunt.registerTask('default', 'lint min');
};