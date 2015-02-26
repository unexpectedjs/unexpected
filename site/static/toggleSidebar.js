function toggleSidebar() {
    var body = document.body;
    body.className = body.className.replace(/\bsidebar-(visible|hidden)\b/, function ($0, $1) {
        return 'sidebar-' + ($1 === 'visible' ? 'hidden' : 'visible');
    });
}

document.querySelector('.main').onclick = function () {
    var body = document.body;
    body.className = body.className.replace(/\bsidebar-visible\b/, 'sidebar-hidden');
}
