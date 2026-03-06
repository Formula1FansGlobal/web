// timeline.js - carga de datos para el componente de línea de tiempo
// Utiliza la librería TimelineJS de Knight Lab (incluida por CDN en index.html)

window.addEventListener('DOMContentLoaded', function() {
    const timelineData = {
        title: {
            text: {
                headline: "Historia rápida de la Fórmula 1",
                text: "Selecciona un año para ver los principales hitos."
            }
        },
        events: [
            {
                start_date: { year: "1950" },
                text: {
                    headline: "1950 – El gran debut",
                    text: "El Campeonato Mundial se inauguró en Silverstone con victoria de Giuseppe Farina (Alfa Romeo)."
                },
                media: {
                    url: "img/linea-de-tiempo/1950-–-El-gran-debut.jpg",
                    caption: "Alfa Romeo 158"
                }
            },
            {
                start_date: { year: "1961" },
                text: {
                    headline: "1961 – Nace John Barnard",
                    text: "El diseñador que décadas después traerá el chasis de fibra de carbono a la F1."
                }
            },
            {
                start_date: { year: "1970" },
                text: {
                    headline: "1970 – Revolución aerodinámica",
                    text: "Lotus estrena el 'efecto suelo' con el 78, cambiando para siempre la aerodinámica."
                }
            },
            {
                start_date: { year: "1988" },
                text: {
                    headline: "1988 – El año McLaren",
                    text: "El MP4/4 de Senna y Prost ganó 15 de 16 carreras, con motor Honda turbo."
                }
            },
            {
                start_date: { year: "1994" },
                text: {
                    headline: "1994 – San Marino",
                    text: "Las muertes de Senna y Ratzenberger obligan a rediseñar la seguridad."
                }
            },
            {
                start_date: { year: "2005" },
                text: {
                    headline: "2005 – Sexto doble título de Ferrari",
                    text: "Schumacher y Barrichello sellan la época dorada con el F2005."
                }
            },
            {
                start_date: { year: "2014" },
                text: {
                    headline: "2014 – Era híbrida",
                    text: "Mercedes inicia hegemonía con unidades de potencia V6 turbo híbridas."
                }
            },
            {
                start_date: { year: "2021" },
                text: {
                    headline: "2021 – Hamilton vs Verstappen",
                    text: "La temporada se decide en Abu Dhabi tras polémica del safety car."
                }
            },
            {
                start_date: { year: "2025" },
                text: {
                    headline: "2025 – F1 sostenible",
                    text: "Reglamentos de efecto suelo y combustibles sintéticos 100% renovables."
                }
            }
        ]
    };

    // inicializa la línea de tiempo en el contenedor
    if (typeof TL !== 'undefined') {
        new TL.Timeline('timeline-embed', timelineData);
    } else {
        console.warn('TimelineJS no se cargó, revisa la conexión al CDN.');
    }
});