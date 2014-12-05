var metalSmith = require('metalsmith');
var Path = require('path');
var fs = require('fs');

metalSmith(__dirname)
    .destination('../site-build')
    .source('src')
    .use(require('metalsmith-collections')({
        assertions: {
            pattern: 'assertions/*/*.md'
        },
        pages: {
            pattern: '*.md'
        }
    }))
    .use(require('metalsmith-static')({
        src: 'static',
        dest: 'static'
    }))
    // Dynamicly generate metadata for assertion files
    .use(function (files, metalsmith, next) {
        function assertionTitleFromFileName(fileName) {
            var collection = fileName.match(/^assertions\/([^\/]+)/)[1];
            var assertionName = fileName.match(/([^\/]+)\.md$/)[1];
            assertionName = assertionName.replace(/-/g, ' ');
            return '[' + collection + '] ' + assertionName;
        }
        Object.keys(files).forEach(function (file) {
            if (files[file].collection.indexOf('assertions') !== -1) {
                // Set the template of all documents in the assertion collection
                files[file].template = 'assertion.ejs';
                files[file].title = assertionTitleFromFileName(file);
            }
        });
        next();
    })
    // Put type index pages in place
    .use(function (files, metalsmith, next) {
        Object.keys(files).forEach(function (file) {
            console.log(file);
            if (/^assertions-[a-z]*\.md$/.test(file)) {
                files[file.replace('assertions-', 'assertions/')] = files[file];
                delete files[file];
            }
        });
        next();
    })
    .use(function (files, metalsmith, next) {
        var metadata = metalsmith.metadata();
        // Set globally available meta data here
        // metadata.title = 'Unexpected.js';
        metadata.titleToId = function titleToId(title) {
            return title.replace(/ /g, '-');
        };
        fs.readFile(Path.resolve(__dirname, 'src','_data.json'), 'utf-8', function (err, data) {
            if (err) {
                return next(err);
            }
            metadata.assertions = JSON.parse(data);
            next();
        });
    })
    .use(require('metalsmith-markdown')())
    // permalinks with no options will just make pretty urls...
    .use(require('metalsmith-permalinks')())
    .use(function (files, metalsmith, next) {
        // Useful for debugging ;-)
        // require('uninspected').log(files);
        next();
    })
    .use(require('metalsmith-less')())
    .use(require('metalsmith-templates')('ejs'))
    .build(function (err) {
        if (err) { throw err; }
        console.log('wrote site to site-build');
    });
