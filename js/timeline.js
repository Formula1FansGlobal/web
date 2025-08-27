window.onload = function() {
    var timelineData = {
        "title": {
            "text": {
                "headline": "La historia de la Fórmula 1",
                "text": "Desde sus inicios hasta la era moderna (1894-2024)"
            },
            "media":{
                "url": "img/linea de tiempo/LA HISTORIA DE LA F1.png",
                "caption": "LA HISTORIA DE LA FORMULA 1 (1894-2024)"
            }
        },
        "events": [
            {
                "start_date": { "year": "1950" },
                "text": {
                    "headline": "1950 – El gran debut",
                    "text": "- Campeón: Giuseppe Farina (Alfa Romeo 158) <br>- Subcampeón: Juan Manuel Fangio (Alfa Romeo)<br>- Calendario: 7 Grandes Premios puntuables, incluyendo Indianápolis 500 (reglamento distinto, pocos europeos asistieron).<br>- Lo clave: Alfa Romeo dominó con su 158 “Alfetta”, un diseño pre-Segunda Guerra Mundial mejorado, 1.5 L sobrealimentado, ~350 CV.<br>- Momentos icónicos:- 13 de mayo: Silverstone inaugura la era con victoria de Farina ante la realeza británica.<br>- Fangio y Farina intercambian victorias, pero la fiabilidad favorece a Farina en Monza.<br>- Impacto: Se establece el formato de campeonato anual; inicio de la hegemonía italiana en la F1."
                },
                "media": {
                    "url": "img/linea de tiempo/1950 – El gran debut.jpg",
                    "caption": "Alfa Romeo 158"
                }
            },
            {
                "start_date": { "year": "1951" },
                "text": {
                    "headline": "1951 – El primer reinado de Fangio",
                    "text": "- Campeón: Juan Manuel Fangio (Alfa Romeo)<br>- Batalla clave: Ferrari logra su primera victoria en Silverstone (José Froilán González), rompiendo el invicto de Alfa Romeo.<br>- Técnica: Motores todavía sobrealimentados de 1.5 L, pero Ferrari usa 4.5 L atmosférico, más eficiente en consumo<br>- Final de temporada: Fangio gana en Montjuïc y Monza para coronarse.<br>- Impacto: Primer título del hombre que se convertiría en leyenda con 5 campeonatos."
                },
                "media": {
                    "url": "img/linea de tiempo/1951 – El primer reinado de Fangio.jpg",
                    "caption": "Alfa Romeo 158"
                }
            },
            {
                "start_date": { "year": "1952" },
                "text": {
                    "headline": "Motores Turbo",
                    "text": "Comienza la era de los motores turbo en la Fórmula 1."
                }
            },
            {
                "start_date": { "year": "1953" },
                "text": {
                    "headline": "Mejoras de Seguridad",
                    "text": "La FIA implementa mejoras de seguridad tras accidentes fatales."
                },
                "media": {
                    "url": "img/halo_f1.jpg",
                    "caption": "Sistema Halo"
                }
            },
            {
                "start_date": { "year": "1954" },
                "text": {
                    "headline": "Era Híbrida",
                    "text": "Se inicia la era híbrida con motores eléctricos y de combustión."
                }
            }
        ]
    };

    window.timeline = new TL.Timeline('timeline-embed', timelineData);
};