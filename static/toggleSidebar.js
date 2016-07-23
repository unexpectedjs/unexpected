function toggleSidebar() { // eslint-disable-line no-unused-vars
    var body = document.body;
    body.className = body.className.replace(/\bsidebar-(visible|hidden)\b/, function ($0, $1) {
        return 'sidebar-' + ($1 === 'visible' ? 'hidden' : 'visible');
    });

    try {
        localStorage.setItem('sidebar-state', body.className.match(/\bsidebar-visible/) ? 'visible' : 'hidden');
    } catch (e) {
        // Ignore
    }
}
function hideSidebar() {
    var body = document.body;
    body.className = body.className.replace(/\bsidebar-visible\b/, 'sidebar-hidden');
    try {
        localStorage.setItem('sidebar-state', 'hiddden');
    } catch (e) {
        // Ignore
    }
}

function showSidebar() {
    var body = document.body;
    body.className = body.className.replace(/\bsidebar-hidden\b/, 'sidebar-visible');
    try {
        localStorage.setItem('sidebar-state', 'visible');
    } catch (e) {
        // Ignore
    }
}

document.querySelector('.main').onclick = function () {
    hideSidebar();
};

try {
    if (localStorage.getItem('sidebar-state') === 'visible') {
        showSidebar();
        setTimeout(function () {
            hideSidebar();
        }, 1);
    }
} catch (e) {
    // Ignore
}
