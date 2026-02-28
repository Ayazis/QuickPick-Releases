function renderTopbar() {
    return `
<nav class="nav" aria-label="Primary">
    <div class="container nav-container home-nav-container">
        <a href="index.html" class="nav-logo">QuickPick</a>
        <ul class="nav-links home-nav-links">
            <li><a href="index.html" data-page="index">Home</a></li>
            <li><a href="about.html" data-page="about">About</a></li>
            <li><a href="download.html" data-page="download">Download</a></li>
            <li><a href="community.html" data-page="community">Community</a></li>
            <li><a href="changelog.html" data-page="changelog">Changelog</a></li>
            <li><a href="privacy.html" data-page="privacy">Privacy</a></li>
        </ul>
    </div>
</nav>`;
}

function loadTopbar() {
    const mountPoint = document.getElementById('topbar-root');

    if (!mountPoint) {
        return;
    }

    mountPoint.innerHTML = renderTopbar();

    const bodyPage = document.body.dataset.page;
    const fileName = window.location.pathname.split('/').pop() || 'index.html';
    const inferredPage = fileName.replace('.html', '').toLowerCase();
    const currentPage = (bodyPage || inferredPage).toLowerCase();

    const activeLink = mountPoint.querySelector(`[data-page="${currentPage}"]`);

    if (activeLink) {
        activeLink.classList.add('is-active');
        activeLink.setAttribute('aria-current', 'page');
    }
}

document.addEventListener('DOMContentLoaded', loadTopbar);