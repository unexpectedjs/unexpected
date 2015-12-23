/*global unexpected:true, expect:true, weknowhow*/
unexpected = typeof weknowhow === 'undefined' ?
    require('../lib/').clone() :
    weknowhow.expect.clone();

expect = unexpected.clone();

unexpected.output.preferredWidth = 80;
