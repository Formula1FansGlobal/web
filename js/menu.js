fetch('menu.html')
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.text();
    })
    .then(html => {
        const container = document.getElementById('nav-container');
        if (container) {
            container.innerHTML = html;
        } else {
            document.body.insertAdjacentHTML('afterbegin', html);
        }
        // Ajustar enlace de temporada actual al año en curso
        const seasonLink = document.querySelector('nav.site-nav .nav-links a[data-nav-current-season]');
        const currentSeasonYear = new Date().getFullYear();
        if (seasonLink) {
            seasonLink.setAttribute('href', `calendario_temporada.html?year=${currentSeasonYear}`);
            seasonLink.textContent = `📅 Temporada ${currentSeasonYear}`;
        }

        // Marcar enlace activo según la URL (ignorando query params)
        const links = document.querySelectorAll('nav.site-nav .nav-links a');
        const current = window.location.pathname.split('/').pop() || 'index.html';
        links.forEach(a => {
            const href = a.getAttribute('href');
            if (!href) return;
            const linkPath = href.split('?')[0];
            if (current === linkPath) {
                a.setAttribute('aria-current', 'page');
                a.classList.add('is-active');
            }
        });

    })
    .catch(error => {
        console.error('Error cargando el menú:', error);
    });
