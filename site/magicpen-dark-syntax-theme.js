module.exports = {
    name: 'dark-syntax-theme',
    installInto: function (pen) {
        pen.installTheme('html', {
            jsComment: 'gray',
            jsFunctionName: 'jsKeyword',
            jsKeyword: '#939393',
            jsNumber: [],
            jsPrimitive: 'white',
            jsRegexp: 'green',
            jsString: '#3CDAFF',
            jsKey: '#939393',
            diffAddedHighlight: ['bgGreen', 'black'],
            diffRemovedHighlight: ['bgRed', 'black'],

            'prism:comment': 'jsComment',
            'prism:symbol': 'jsPrimitive',
            'prism:string': 'jsString',
            'prism:operator': 'jsString',
            'prism:keyword': 'jsKeyword',
            'prism:regex': 'jsRegexp',
            'prism:function': []
        });
    }
};
