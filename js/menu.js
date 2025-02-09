fetch('../menu.html')
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.text();
    })
    .then(data => {
        document.body.insertAdjacentHTML('afterbegin', data);
    })
    .catch(error => {
        console.error('Error cargando el menú:', error);
    });
