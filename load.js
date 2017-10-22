'use strict'

var globby = require('globby')
var path = require('path')
var protobuf = require('protobufjs')

var COMMON_PROTO_GLOB_PATTERNS = path.join(__dirname, 'google', '**', '*.proto')
var COMMON_PROTO_FILES = globby.sync(COMMON_PROTO_GLOB_PATTERNS)

class GoogleProtoFilesRoot extends protobuf.Root {
  constructor() {
    super([].slice.apply(arguments))
  }

  // Causes the loading of an included proto to check if it is a common
  // proto. If it is a common proto, use the google-proto-files proto.
  resolvePath(_, includePath) {
    // Fully qualified paths don't need to be resolved.
    if (includePath.startsWith('/')) {
      return includePath
    }

    for (var i = 0, len = COMMON_PROTO_FILES.length; i < len; i++) {
      if (COMMON_PROTO_FILES[i].indexOf(includePath) > -1) {
        return COMMON_PROTO_FILES[i]
      }
    }

    return protobuf.util.path.resolve.apply(null, [].slice.call(arguments))
  }
}

module.exports.loadSync = function(filename) {
  return protobuf.loadSync(filename, new GoogleProtoFilesRoot())
}

module.exports.load = function(filename, callback) {
  return protobuf.load(filename, new GoogleProtoFilesRoot())
}
