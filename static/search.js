/*global baseUrl, document, window, XMLHttpRequest*/
function setupSearch(searchIndex) {
    var search = document.getElementById('search');
    var searchDropDown = document.getElementById('searchDropDown');
    var searchResults = document.getElementById('searchResults');

    var keys = {
        escape: 27,
        up: 38,
        down: 40,
        pageUp: 33,
        pageDown: 34,
        enter: 13,
        tab: 9
    };

    var renderedMatches = [];
    var query = '';
    var activeIndex = 0;

    searchDropDown.addEventListener('mousedown', function (e) {
        if (e.button === 0 && e.target.hasAttribute('data-index')) {
            var index = e.target.getAttribute('data-index');
            window.location.href = baseUrl + renderedMatches[index].url;
        }
    });

    searchDropDown.addEventListener('touchstart', function (e) {
        if (e.target.hasAttribute('data-index')) {
            var index = e.target.getAttribute('data-index');
            window.location.href = baseUrl + renderedMatches[index].url;
        }
    });

    function htmlEncode(text) {
        return text.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
    }

    function renderMatches(matches) {
        if (matches.length > 0) {

            var html = matches.map(function (match, index) {
                return '<li' + (activeIndex === index ? ' class="active"' : '') + ' data-index="' + index + '"' +  '>' + htmlEncode(match.label) + '</li>';
            }).join('');


            searchResults.innerHTML = html;
            searchDropDown.style.visibility = 'visible';
        } else {
            searchResults.innerHTML = '';
            searchDropDown.style.visibility = 'hidden';
        }
        renderedMatches = matches;
    }

    function preventDefault(e) {
        if (e.preventDefault) { e.preventDefault(); }
        return false;
    }

    function selectPrevious() {
        var newIndex = (activeIndex - 1) % renderedMatches.length;

        if (newIndex < 0) {
            newIndex = renderedMatches.length - 1;
        }

        if (activeIndex !== newIndex) {
            activeIndex = newIndex;
            renderMatches(renderedMatches);
        }

        return true;
    }

    function selectNext() {
        var newIndex = (activeIndex + 1) % renderedMatches.length;

        if (activeIndex !== newIndex) {
            activeIndex = newIndex;
            renderMatches(renderedMatches);
        }

        return true;
    }

    function clearSearch() {
        if (renderedMatches.length > 0) {
            query = '';
            search.value = '';
            renderMatches([]);
        }
    }

    function selectActive() {
        if (renderedMatches.length === 0) {
            return false;
        }

        window.location.href = baseUrl + renderedMatches[activeIndex].url;
        clearSearch();

        return true;
    }

    search.addEventListener('keydown', function (e) {
        if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) {
            // This is a modified key event. Don't react to those.
            return true;
        }
        switch (e.which) {
        case keys.up:
            if (selectPrevious()) {
                return preventDefault(e);
            }
            break;
        case keys.down:
            if (selectNext()) {
                return preventDefault(e);
            }
            break;
        case keys.enter:
            if (selectActive()) {
                return preventDefault(e);
            }
            break;
        case keys.tab:
            selectActive();
            break;
        }
        return true;
    });

    search.addEventListener('blur', function () {
        clearSearch();
    });

    search.addEventListener('keyup', function (e) {
        if (e.which === keys.escape) {
            query = '';
            search.value = '';
            renderMatches([]);
            search.blur();
        } else if (e.which !== keys.enter && search.value !== query) {
            query = search.value.toLowerCase();
            var matches = !query ? [] : searchIndex.filter(function (entry) {
                return entry.label.toLowerCase().indexOf(query) !== -1;
            });

            activeIndex = 0;
            renderMatches(matches.slice(0, 8));
        }
    });

    search.style.visibility = 'visible';
}

var getJSON = function (url, successHandler, errorHandler) {
    var xhr = new XMLHttpRequest();
    xhr.open('get', url, true);
    xhr.responseType = 'json';
    xhr.onload = function () {
        var status = xhr.status;
        if (status === 200) {
            if (successHandler) { successHandler(status, xhr.response); }
        } else {
            if (errorHandler) { errorHandler(status); }
        }
    };
    xhr.send();
};

getJSON(baseUrl + '/searchIndex.json', function (status, data) {
    if (data.length > 0) {
        setupSearch(data);
    }
});
