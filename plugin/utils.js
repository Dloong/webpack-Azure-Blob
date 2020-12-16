var path = require("path");
var readDir = require("recursive-readdir");

var AZ_PATH_SEP = "/";
var PATH_SEP = path.sep;

function getAssetFiles(compilation) {
  var assets = [],
    compilationAssets = compilation.assets;
  for (var name in compilationAssets) {
    assets.push({
      name: name,
      path: compilationAssets[name].existsAt,
    });
  };
  return assets;
}

function translatePathFromFiles(rootPath) {
  return function(files) {
    return files.map(function(file) {
      return {
        name: file.replace(rootPath, "").replace(/^\//, "").split(PATH_SEP).join(AZ_PATH_SEP),
        path: file,
      };
    });
  };
}

function getDirectoryFilesRecursive(dir, ignores) {
  if (!ignores) { ignores = []; }
  return new Promise(function(resolve, reject) {
    readDir(dir, ignores, function(err, files) {
      return err ? reject(err) : resolve(files);
    });
  }).then(translatePathFromFiles(dir));
}

module.exports = {
  getAssetFiles,
  getDirectoryFilesRecursive,
};