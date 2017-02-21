'use strict';

var _ = require('lodash');
var data = require('gulp-data');
var frontMatter = require('gulp-front-matter');
var path = require('path');
var pluck = require('gulp-pluck');

var metaData = require('../pipelines/metaData');
var util = require('../util');

module.exports = function(options) {
	var apiConfig = options.apiConfig;
	var gulp = options.gulp;
	var pathSrc = options.pathSrc;
	var taskPrefix = options.taskPrefix;

	gulp.task(taskPrefix + 'front-matter', function() {
		return gulp.src(path.join(pathSrc, 'pages/**/*.+(fm|md|soy)'))
			.pipe(frontMatter())
			.pipe(metaData())
			.pipe(pluck('frontMatter', 'site.json'))
			.pipe(data(function(file) {
				var siteData = normalizeSiteData(file, require(path.join(process.cwd(), pathSrc, 'site.json')));

				if (apiConfig) {
					configureApiDocs(apiConfig, siteData);
				}

				util.sortChildren(siteData.index);
				util.configureBlog(siteData.index);

				file.contents = new Buffer(JSON.stringify(siteData));
			}))
			.pipe(gulp.dest(options.pathDest));
	});
};

function configureApiDocs(apiConfig, siteData) {
	siteData.index.children.api = apiConfig.page;
}

function normalizeSiteData(file, json) {
	var siteData = _.reduce(file.frontMatter, function(result, item) {
		var treeLocation = util.getTreeLocation(item.srcFilePath);

		_.merge(result, _.set({}, treeLocation, item));

		return result;
	}, json);

	return siteData;
}
