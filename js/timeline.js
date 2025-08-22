window.onload = function() {
    var timelineData = {
        "title": {
            "text": {
                "headline": "Historia de la Fórmula 1",
                "text": "Principales hitos desde 1950 hasta la actualidad"
            }
        },
        "events": [
            {
                "start_date": { "year": "1950" },
                "text": {
                    "headline": "Primer Campeonato Mundial",
                    "text": "Se celebra el primer campeonato mundial de F1 en Silverstone."
                },
                "media": {
                    "url": "img/f1_early.jpg",
                    "caption": "Silverstone 1950"
                }
            },
            {
                "start_date": { "year": "1955" },
                "text": {
                    "headline": "Chasis Monocasco",
                    "text": "Se introduce el chasis monocasco en los autos de F1."
                }
            },
            {
                "start_date": { "year": "1977" },
                "text": {
                    "headline": "Motores Turbo",
                    "text": "Comienza la era de los motores turbo en la Fórmula 1."
                }
            },
            {
                "start_date": { "year": "1994" },
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
                "start_date": { "year": "2014" },
                "text": {
                    "headline": "Era Híbrida",
                    "text": "Se inicia la era híbrida con motores eléctricos y de combustión."
                }
            }
        ]
    };

    window.timeline = new TL.Timeline('timeline-embed', timelineData);
};