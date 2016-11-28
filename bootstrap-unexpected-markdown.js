/*global unexpected:true*/
unexpected = require('./lib/');
unexpected.output.preferredWidth = 80;
if (typeof Promise === 'undefined') {
    Promise = require('rsvp').Promise;
}
