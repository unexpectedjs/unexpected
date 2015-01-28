module.exports = {
    name: 'dark-syntax-theme',
    installInto: function (pen) {
        pen.installTheme('html', {
            jsComment: 'gray',
            jsFunctionName: 'jsKeyword',
            jsKeyword: 'magenta',
            jsNumber: [],
            jsPrimitive: 'cyan',
            jsRegexp: 'green',
            jsString: 'cyan',
            jsKey: '#666',
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
