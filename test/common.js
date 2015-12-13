/*global unexpected:true, weknowhow*/
unexpected = typeof weknowhow === 'undefined' ?
    require('../lib/').clone() :
    weknowhow.expect.clone();

unexpected.output.preferredWidth = 80;
