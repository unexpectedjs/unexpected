var elements = document.querySelectorAll('code.language-javascript-evaluate');
expect = weknowhow.expect;
Array.prototype.forEach.call(elements, function (element) {
    try {
        eval(element.textContent);
    } catch (e) {
        var evaluation = document.createElement('div');
        evaluation.setAttribute('class', 'evaluation');
        evaluation.innerHTML = e.htmlMessage;
        evaluation.children[0].style['font-family'] = "Consolas, Monaco, 'Andale Mono', monospace";
        element.parentNode.parentNode.insertBefore(evaluation, element.parentNode.nextSibling);
    }
});
