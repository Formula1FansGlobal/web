const timeline = document.getElementById('timeline');
const items = timeline.getElementsByTagName('li');

for (let i = 0; i < items.length; i++) {
  items[i].addEventListener('click', function() {
    // Aquí puedes agregar código para mostrar más información sobre el evento
    console.log('Hiciste clic en el evento:', this.textContent);
  });
}