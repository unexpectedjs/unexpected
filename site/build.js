var metalSmith = require('metalsmith');
var Path = require('path');
var fs = require('fs');

function titleToId(title) {
    return title.replace(/ /g, '-');
}

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
    // Build documentation tests
    .use(require('./build-documentation-tests'))
    // Dynamicly generate metadata for assertion files
    .use(function (files, metalsmith, next) {
        Object.keys(files).forEach(function (file) {
            if (files[file].collection.indexOf('assertions') !== -1) {
                // Set the template of all documents in the assertion collection

                var type = file.match(/^assertions\/([^\/]+)/)[1];
                var assertionName = file.match(/([^\/]+)\.md$/)[1];
                assertionName = titleToId(assertionName);

                files[file].template = 'assertion.ejs';
                files[file].name = assertionName;
                files[file].title = type + ' - ' + assertionName;
                files[file].type = type;
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
        metadata.titleToId = titleToId;
        metadata.isActiveAssertion = function (path, type, assertionName) {
            var currentType = path.match(/^assertions\/([^\/]+)/);
            var currentAssertionName = path.match(/([^\/]+)\/?$/);
            return currentType && currentAssertionName && titleToId(type) === currentType[1] && titleToId(assertionName) === currentAssertionName[1];
        };
        fs.readFile(Path.resolve(__dirname, 'src','_data.json'), 'utf-8', function (err, data) {
            if (err) {
                return next(err);
            }
            metadata.assertions = JSON.parse(data);
            next();
        });
    })
    .use(function (files, metalsmith, next) {
        Object.keys(files).forEach(function(file){
            var data = files[file];
            var cleaned = data.contents.toString().replace(/^<!-- ?\/?evaluate ?-->\n?/gm, '');
            data.contents = new Buffer(cleaned);
        });
        next();
    })
    .use(require('./syntax-highlight'))
    .use(require('metalsmith-markdown')())
    // permalinks with no options will just make pretty urls...
    .use(require('metalsmith-permalinks')())
    .use(function (files, metalsmith, next) {
        // Useful for debugging ;-)
        // require('uninspected').log(files);
        next();
    })
    .use(require('metalsmith-templates')('ejs'))
    .build(function (err) {
        if (err) { throw err; }
        console.log('wrote site to site-build');
    });
