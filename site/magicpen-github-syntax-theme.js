module.exports = {
    name: 'github-syntax-theme',
    installInto: function (pen) {
        pen.installTheme({
            // Mimic github theme
            'prism:comment': '#969896',
            'prism:cdata': '#708090',

            'prism:punctuation': '#000000',

            'prism:tag': '#63a35c',
            'prism:symbol': '#0086b3',

            'prism:attr-name': '#795da3',

            'prism:operator': '#a71d5d',
            'prism:variable': '#a67f59',

            'prism:string': '#df5000',
            'prism:url': 'prism:string',
            'css:string': 'prism:string',
            'prism:entity': 'prism:string',
            'prism:atrule': 'prism:string',
            'attr-value': 'prism:string',
            'prism:regex': 'prism:string',

            'prism:keyword': '#0086b3',

            'prism:function': '#000000',

            'prism:important': ['#0086b3', 'bold']
        });
    }
};
