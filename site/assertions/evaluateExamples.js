var elements = document.querySelectorAll('code.language-javascript');
expect = weknowhow.expect;
Array.prototype.forEach.call(elements, function (element) {
    try {
        eval(element.textContent);
    } catch (e) {
        var evaluation = document.createElement('div');
        evaluation.setAttribute('class', 'evaluation');
        evaluation.innerHTML = e.htmlMessage;
        element.parentNode.parentNode.insertBefore(evaluation, element.parentNode.nextSibling);
    }
});
