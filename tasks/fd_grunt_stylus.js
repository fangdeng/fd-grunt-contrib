/*
 * sjpsega-grunt-contrib-stylus
 * https://github.com/sjpsega/s-grunt-stylus
 *
 * Copyright (c) 2013 sjpsega
 * Licensed under the MIT license.
 */

'use strict';

var COMMENT_REG = /\/\*[\s\S]*?\*\//;
var NO_COMPILE = '!!cmd:stylusbuild=false';
var COMMENT_SIGN = '/* create by stylus! */';
var DEST_SUFFIX = ".css";
var SRC_SUFFIX = ".styl";
var MERGE = "merge";
var DEFAULT_CHARSET = "gbk";

module.exports = function(grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('fd_grunt_stylus', 'compile stylus to css', function() {
    // Merge task-specific and/or target-specific options with these defaults.

    var done = this.async();
    var options = this.options({
      compress: false
    });

    // grunt.log.writeln("files",this.files);

    var writeOptions,readOptions;
    if(options.charset){
        writeOptions = grunt.util._.extend({
          encoding:options.charset.to || DEFAULT_CHARSET
        },options);

        readOptions = grunt.util._.extend({
          encoding:options.charset.from || DEFAULT_CHARSET
        },options);
    }

    // Iterate over all specified file groups.
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
      // console.log("-----",destSuffix,destPrefix,srcSuffix,srcPrefix);
      // console.log("f.src",f.src);

      f.src.filter(function(filepath) {
        // Warn on and remove invalid source files (if nonull was set).
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file "' + filepath + '" not found.');
          return false;
        } else {
          return true;
        }
      }).forEach(function(filepath) {
          // Read file source.

          destFilepath = filepath.replace(srcPrefix,destPrefix).replace(srcSuffix,destSuffix);

          //若file的名字为"merge.styl"则自动不编译，复制内容，生成merge.css文件
          if(filepath.lastIndexOf(MERGE+srcSuffix)>-1){
            writeAndLog(destFilepath,grunt.file.read(filepath,readOptions || options),writeOptions || options);
            return;  
          }

          compileStylus(filepath,options,readOptions || options, function(css, err) {
              if (!err) {
                //若生成的css为空,或只有注释,则不生成
                var copycss = css;
                copycss = copycss.replace(COMMENT_REG,'');
                if(grunt.util._.isBlank(copycss)){
                  return;
                }
                writeAndLog(destFilepath,css,writeOptions || options);
              }
            });
      });
    });

    done();
    grunt.log.success('stylus done!');
  });

var writeAndLog = function(destFilepath,css,writeOptions){
  css = COMMENT_SIGN + grunt.util.linefeed + css;
  grunt.file.write(destFilepath, css, writeOptions);
  grunt.log.writeln('File "' + destFilepath.cyan + '" created.');
}

//获得地址前缀
var getAddPrefix = function(address){
    var suffix = getAddSuffix(address);
    if(suffix){
        address = address.substr(0,address.lastIndexOf(suffix));
    }
    return address.replace(/\/\*\*|\/\*/g,'');
}

//获得地址后缀
var getAddSuffix = function(address){
    var suffix = "";
    if(address.indexOf(".")>-1){
      suffix = address.substr(address.lastIndexOf("."));
    }
    return suffix;
}

var compileStylus = function(srcFile, options, readOptions, callback) {
  options = grunt.util._.extend({filename: srcFile}, options);

  // Never compress output in debug mode
  if (grunt.option('debug')) {
    options.compress = false;
  }

  var srcCode = grunt.file.read(srcFile,readOptions);

  //若注释中有'compile=false'则不编译
  var comment = srcCode.match(COMMENT_REG);
  if(comment && comment[0] && comment[0].indexOf(NO_COMPILE)>-1){
      var logStr = 'File ' + srcFile +' not compile';
      grunt.log.writeln(logStr.yellow);
      callback('', true);
      return;
  }

  var stylus = require('stylus');
  var s = stylus(srcCode);

  grunt.util._.each(options, function(value, key) {
    if (key === 'urlfunc') {
      // Custom name of function for embedding images as Data URI
      s.define(value, stylus.url());
    } else if (key === 'use') {
      value.forEach(function(func) {
        if (typeof func === 'function') {
          s.use(func());
        }
      });
    } else if (key === 'define') {
      for (var defineName in value) {
        s.define(defineName, value[defineName]);
      }
    } else if (key === 'import') {
      value.forEach(function(stylusModule) {
        s.import(stylusModule);
      });
    } else {
      s.set(key, value);
    }
  });

  // Load Nib if available
  try {
    s.use(require('nib')());
  } catch (e) {
    grunt.util.warn("error",e);
  }

  s.render(function(err, css) {
    if (err) {
      grunt.log.error(err);
      grunt.fail.warn('Stylus failed to compile.');

      callback(css, true);
    } else {
      callback(css, null);
    }
  });
};

};
