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
        // Marcar enlace activo según la URL
        const links = document.querySelectorAll('nav.site-nav .nav-links a');
        const current = window.location.pathname.split('/').pop() || 'index.html';
        links.forEach(a => {
            const href = a.getAttribute('href');
            if (href && current === href) {
                a.setAttribute('aria-current', 'page');
                a.classList.add('is-active');
            }
        });
    })
    .catch(error => {
        console.error('Error cargando el menú:', error);
    });
