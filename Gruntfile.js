/*
 * sjpsega-grunt-contrib-stylus
 * https://github.com/apple/grunt-test
 *
 * Copyright (c) 2013 sjpsega
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= nodeunit.tests %>',
      ],
      options: {
        jshintrc: '.jshintrc',
      },
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['tmp'],
      stylus:['css']
    },

    // Configuration to be run (and then tested).
    fd_grunt_stylus: {
        compile: {
              options: {
                  compress: false,
                  charset:{
                      from:"utf-8",
                      to:"utf-8"
                  }
              },
              files: [{
                  src:"styl/**/*.styl",
                  dest:"css/**/*.css"
              }]
        }
    },
    watch: {
      js:{
        files: ['tasks/**/*.js','Gruntfile.js','test/*_test.js'],
        tasks: ['default']
      }
    },

    // Unit tests.
    nodeunit: {
      tests: ['test/*_test.js'],
    },

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'fd_grunt_stylus']);

  // By default, lint and run all tests.
  // grunt.registerTask('default', ['jshint', 'test']);
  grunt.registerTask('default', ['clean','fd_grunt_stylus','watch']);

};
