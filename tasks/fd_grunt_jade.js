/*
 * fd-grunt-jade
 * https://github.com/sjpsega/fd-grunt-jade
 *
 * Copyright (c) 2013 sjpsega
 * Licensed under the MIT license.
 */

'use strict';

var COMMENT_REG = /<!--[\s\S]*?-->/g;
var NO_COMPILE = '!!cmd:jadebuild=false';
var COMMENT_SIGN = '<!-- create by jade! -->';
var DEST_SUFFIX = ".html";
var SRC_SUFFIX = ".jade";
var DEFAULT_CHARSET = "utf-8";

module.exports = function(grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('fd_grunt_jade', 'Your task description goes here.', function() {
    var options = this.options({
      pretty:true
    });
    grunt.verbose.writeflags(options, 'Options');

    var writeOptions,readOptions;
    if(options.charset){
        writeOptions = grunt.util._.extend({
            encoding:options.charset.to || DEFAULT_CHARSET
        },options);

        readOptions = grunt.util._.extend({
            encoding:options.charset.from || DEFAULT_CHARSET
        },options);
    }

    this.files.forEach(function(f) {

      var srcAddr = f.orig.src;
      if(grunt.util._.isArray(srcAddr)){
          srcAddr = srcAddr[0];
      }
      var srcPrefix = getAddPrefix(srcAddr);
      var srcSuffix = getAddSuffix(srcAddr) || SRC_SUFFIX;

      var destAddr = f.dest;
      var destPrefix = getAddPrefix(destAddr);
      var destSuffix = getAddSuffix(destAddr) || DEST_SUFFIX;

      var destFilepath;
      f.src.filter(function(filepath) {
        // Warn on and remove invalid source files (if nonull was set).
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file "' + filepath + '" not found.');
          return false;
        } else {
          return true;
        }
      })
      .forEach(function(filepath) {

          destFilepath = filepath.replace(srcPrefix,destPrefix).replace(srcSuffix,destSuffix);
          var src = grunt.file.read(filepath,readOptions || options);

          //若注释中有'!!cmd:jadebuild=false'则不编译
          var comment = src.match(COMMENT_REG);
          if(comment && comment[0] && comment[0].indexOf(NO_COMPILE)>-1){
              var logStr = 'File ' + filepath +' not compile';
              grunt.log.writeln(logStr.yellow);
              return;
          }

          var compiled;

          options = grunt.util._.extend(options, { filename: filepath });

          try {
            compiled = require('jade').compile(src, options);
            compiled = compiled({});
          } catch (e) {
            grunt.log.error(e);
            grunt.fail.warn('Jade failed to compile '+filepath+'.');
          }
          compiled = compiled.replace(COMMENT_REG,'');
          //不能在最前面加除了DOCTYPE之外的东西，否则IE下会有问题
          // compiled = COMMENT_SIGN + grunt.util.linefeed + compiled;

          grunt.file.write(destFilepath, compiled, writeOptions || options);
          grunt.log.writeln('File "' + destFilepath.cyan + '" created.');
      });
    });
  });

  //获得地址前缀
  var getAddPrefix = function(address){
      var suffix = getAddSuffix(address);
      if(suffix){
          address = address.substr(0,address.lastIndexOf(suffix));
      }
      return address.replace(/\/\*\*|\/\*/g,'');
  };

  //获得地址后缀
  var getAddSuffix = function(address){
      var suffix = "";
      if(address.indexOf(".")>-1){
          suffix = address.substr(address.lastIndexOf("."));
      }
      return suffix;
  };
};

