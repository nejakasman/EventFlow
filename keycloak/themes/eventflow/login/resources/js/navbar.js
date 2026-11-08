
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.eventflow-navbar')) return

    const navbar = document.createElement('header')
    navbar.className = 'eventflow-navbar'

    navbar.innerHTML = `
        <a href="http://localhost:5173/" class="eventflow-brand">
            <span class="eventflow-brand-icon">E</span>
            <span>eventflow</span>
        </a>

        <nav class="eventflow-nav-links">
            <a href="http://localhost:5173/#about">O platformi</a>
            <a href="http://localhost:5173/#features">Kaj ponujamo</a>
        </nav>

        <div class="eventflow-nav-actions">
            <a href="http://localhost:5173/" class="eventflow-home-button">
                ← Začetna stran
            </a>
        </div>
    `

    document.body.prepend(navbar)
})
