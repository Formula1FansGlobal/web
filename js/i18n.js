// i18n.js - Versión en inglés del sitio (traducción en el navegador).
//
// Cómo funciona: el texto del sitio está escrito en español. Si el visitante elige English en Ajustes
// (clave f1fg:lang = "en"), este script traduce los textos con el diccionario DIC y con unas pocas reglas
// para frases con números. Observa el DOM, así que también traduce lo que otros scripts pintan después.
//
// - Lo que no esté en el diccionario se queda en español (nunca se rompe nada).
// - Para traducir algo nuevo basta con agregar una línea "texto en español": "English text" a DIC.
// - Las páginas legales (privacidad y términos) siguen en español; el español es la versión vinculante.

(function () {
    'use strict';

    let lang = '';
    try { lang = localStorage.getItem('f1fg:lang') || ''; } catch (e) { lang = ''; }
    if (lang !== 'en') return;

    const DIC = {
        /* ---- Menú y comunes ---- */
        'Saltar al contenido': 'Skip to content',
        'Inicio': 'Home', 'Noticias': 'News', 'Sesiones': 'Sessions', 'Videos': 'Videos', 'Calendario': 'Calendar', 'Tienda': 'Shop',
        'Explorar': 'Explore', 'Pilotos': 'Drivers', 'Equipos': 'Teams', 'Circuitos': 'Circuits', 'Comparador': 'Compare',
        'Estadísticas': 'Stats', 'Quiniela': 'Predictor', 'Temporadas': 'Seasons',
        'Abrir menú': 'Open menu', 'Cerrar menú': 'Close menu', 'Navegación principal': 'Main navigation',
        'Buscar en el sitio (Ctrl+K)': 'Search the site (Ctrl+K)', 'Buscar (Ctrl+K)': 'Search (Ctrl+K)', 'Ajustes': 'Settings',
        'Ajustes: tamaño de letra, contraste, zona horaria e idioma': 'Settings: text size, contrast, time zone and language',
        'Formula 1 Fans Global - Inicio': 'Formula 1 Fans Global - Home',

        /* ---- Ajustes y buscador ---- */
        'Tamaño de letra': 'Text size', 'Alto contraste': 'High contrast', 'Zona horaria de los horarios': 'Time zone for schedules',
        'Zona horaria': 'Time zone', 'Automática (la de tu dispositivo)': 'Automatic (your device)', 'Idioma / Language': 'Language',
        'Idioma': 'Language', 'Normal': 'Normal', 'Grande': 'Large', 'Muy grande': 'Extra large', 'No': 'No', 'Sí': 'Yes', 'Listo': 'Done',
        'Tus ajustes se guardan solo en este navegador.': 'Your settings are saved only in this browser.',
        'Buscador': 'Search', 'Buscar en el sitio': 'Search the site',
        'Buscar pilotos, equipos, carreras, páginas…': 'Search drivers, teams, races, pages…',
        'Usa ↑ ↓ y Enter. Esc para cerrar.': 'Use ↑ ↓ and Enter. Esc to close.',
        'Sin resultados. Prueba con otro nombre.': 'No results. Try another name.',
        'Página': 'Page', 'Piloto': 'Driver', 'Equipo': 'Team', 'Gran Premio': 'Grand Prix',
        'Sesiones y horarios': 'Sessions and schedule', 'Calendario de la temporada': 'Season calendar',
        'Archivo de temporadas': 'Season archive', 'Comparador de pilotos': 'Driver comparison',
        'Términos de servicio': 'Terms of service', 'Privacidad': 'Privacy',

        /* ---- Portada ---- */
        'Sitio de aficionados · independiente': 'Independent fan site',
        'Toda la Fórmula 1,': 'All of Formula 1,', 'en español': 'in your language',
        'Calendario, clasificación, noticias y la cuenta regresiva de cada sesión del fin de semana, en tu hora local.':
            'Calendar, standings, news and a countdown to every session of the weekend, in your local time.',
        'Ver sesiones del fin de semana': 'See the weekend sessions', 'Explorar el calendario': 'Explore the calendar',
        'Próxima sesión': 'Next session', 'Cuenta regresiva': 'Countdown', 'días': 'days', 'horas': 'hours', 'min': 'min', 'seg': 'sec',
        'Horario del fin de semana': 'Weekend schedule',
        'Última carrera': 'Latest race', 'Ver resultado completo': 'See full result',
        'Clasificación del campeonato': 'Championship standings', 'Pilotos ': 'Drivers', 'Constructores': 'Constructors',
        'Tipo de clasificación': 'Standings type', 'Temporada': 'Season', 'en curso': 'current',
        'Datos: Jolpica F1 API (compatible con Ergast). Pueden tardar unos minutos en actualizarse.':
            'Data: Jolpica F1 API (Ergast compatible). It may take a few minutes to update.',
        'Datos: Jolpica F1 API (compatible con Ergast).': 'Data: Jolpica F1 API (Ergast compatible).',
        'Datos: Jolpica F1 API.': 'Data: Jolpica F1 API.',
        'Al día': 'Latest', 'Últimas noticias': 'Latest news', 'Ver todas': 'See all',
        'Todo lo que necesitas para seguir la F1': 'Everything you need to follow F1',
        'Horario del fin de semana en tu hora local y dónde verlo de forma oficial.': 'The weekend schedule in your local time and where to watch it officially.',
        'Todas las carreras de la temporada y de años anteriores.': 'Every race of the season and of previous years.',
        'Historia': 'History', 'De Silverstone 1950 a la nueva era de 2026, en una línea del tiempo.': 'From Silverstone 1950 to the new 2026 era, on a timeline.',
        'Selección de productos de aficionados con enlaces de afiliados.': 'A fan-made selection of products with affiliate links.',
        'Historia viva': 'Living history',
        'La historia de la Fórmula 1, en una línea del tiempo': 'The history of Formula 1, on a timeline',
        'Hitos, rivalidades y las tragedias que cambiaron las reglas para hacer los coches más seguros. Se actualiza sola con cada campeonato.':
            'Milestones, rivalries and the tragedies that changed the rules to make the cars safer. It updates itself with every championship.',
        'Ver más': 'Show more', 'Comunidad': 'Community', 'Vive la F1 con otros aficionados': 'Live F1 with other fans',
        'Síguenos para ver análisis, resúmenes y opiniones de cada Gran Premio.': 'Follow us for analysis, recaps and opinions on every Grand Prix.',
        'Tu piloto y tu equipo': 'Your driver and your team', 'Tus favoritos': 'Your favorites',
        'Elige un piloto y un equipo favoritos y los verás aquí, con su posición en el campeonato.':
            'Pick a favorite driver and team and you will see them here, with their championship position.',
        'Elegir mi piloto': 'Choose my driver', 'Elegir mi equipo': 'Choose my team',
        'Tu piloto': 'Your driver', 'Tu equipo': 'Your team', 'Quitar': 'Remove',
        'Aún no tiene puntos esta temporada': 'No points yet this season',
        'Jugar a la quiniela': 'Play the predictor', 'Pronostica el podio y la pole de la próxima carrera.': 'Predict the podium and pole of the next race.',
        'Estadísticas y récords': 'Stats and records', 'Campeones, títulos y la evolución de cada temporada.': 'Champions, titles and how each season unfolded.',
        'Pilotos y equipos': 'Drivers and teams', 'Fichas con victorias, podios, poles y resultados por temporada.': 'Profiles with wins, podiums, poles and results by season.',
        'Circuitos del calendario': 'Calendar circuits', 'Dónde se corre y quién ganó en cada pista.': 'Where races are held and who won at each track.',

        /* ---- Sesiones ---- */
        'Cargando el calendario del fin de semana…': 'Loading the weekend calendar…',
        'Todos los horarios están en tu zona horaria.': 'All times are shown in your time zone.',
        'Dónde verlo de forma oficial': 'Where to watch it officially',
        'No retransmitimos sesiones ni carreras: los derechos pertenecen a la Fórmula 1 y a sus emisoras. Estos son los canales legales.':
            'We do not broadcast sessions or races: the rights belong to Formula 1 and its broadcasters. These are the legal channels.',
        'F1 TV (servicio oficial)': 'F1 TV (official service)', 'F1 TV (oficial)': 'F1 TV (official)',
        'Sesiones en vivo y repeticiones. Disponibilidad según tu país.': 'Live sessions and replays. Availability depends on your country.',
        'Canal oficial de F1 en YouTube': 'Official F1 YouTube channel', 'Resúmenes, highlights y contenido gratuito.': 'Recaps, highlights and free content.',
        'Calendario oficial': 'Official calendar', 'Confirma siempre los horarios en formula1.com.': 'Always confirm times on formula1.com.',
        'Calendario en nuestra web': 'Calendar on our site', 'Carreras de la temporada y de años anteriores.': 'Races of this season and previous years.',
        'Resultados': 'Results', 'Última carrera:': 'Latest race:', 'Guía rápida: qué es cada sesión': 'Quick guide: what each session is',
        'Prácticas libres (P1, P2, P3)': 'Free practice (FP1, FP2, FP3)', 'Clasificación': 'Qualifying', 'Sprint': 'Sprint', 'Carrera': 'Race',
        'Los equipos prueban configuraciones, neumáticos y estrategia. Son sesiones de una hora; en fines de semana Sprint solo hay una práctica.':
            'Teams test setups, tyres and strategy. Sessions last an hour; on Sprint weekends there is only one practice.',
        'Define la parrilla de salida en tres rondas (Q1, Q2 y Q3). El más rápido de Q3 sale en la pole position.':
            'Sets the starting grid in three rounds (Q1, Q2 and Q3). The fastest in Q3 starts from pole position.',
        'Carrera corta de unos 100 km que se disputa solo en algunos fines de semana y reparte puntos a los primeros lugares.':
            'A short race of about 100 km held only on some weekends, awarding points to the top finishers.',
        'El Gran Premio completo, de unos 300 km (o dos horas como máximo). Reparte los puntos del campeonato.':
            'The full Grand Prix, about 300 km (or two hours at most). It awards the championship points.',
        'Sesión': 'Session', 'Fecha y hora (local)': 'Date and time (local)', 'Estado': 'Status', 'Próxima': 'Next',
        'Horario de sesiones en tu hora local': 'Session schedule in your local time', 'Puntos': 'Points', 'Victorias': 'Wins',
        'Tiempo / estado': 'Time / status', 'Resultado de la última carrera': 'Latest race result',
        'Carrera anterior': 'Previous race', 'Siguiente carrera': 'Next race',

        /* ---- Calendario / temporadas / carrera ---- */
        'Archivo': 'Archive', 'Todas las temporadas de la F1': 'Every Formula 1 season',
        'Desde 1950 hasta hoy. Elige una década y abre la temporada que quieras: calendario, ganadores y clasificación.':
            'From 1950 to today. Pick a decade and open any season: calendar, winners and standings.',
        'Aún no hay calendario publicado para esta temporada.': 'No calendar has been published for this season yet.',
        'Aún no hay clasificación para esta temporada.': 'There are no standings for this season yet.',
        'Aún no hay resultados para esta carrera.': 'There are no results for this race yet.',
        'No pudimos cargar el calendario en este momento. Intenta de nuevo en unos minutos o consulta formula1.com.':
            'We could not load the calendar right now. Try again in a few minutes or check formula1.com.',
        'No pudimos cargar la clasificación en este momento.': 'We could not load the standings right now.',
        'Elige una carrera desde el calendario de una temporada.': 'Pick a race from a season calendar.',
        'Sin datos disponibles por ahora. Intenta de nuevo en unos minutos.': 'No data available right now. Try again in a few minutes.',
        'Pos': 'Pos', 'Parrilla': 'Grid', 'Vueltas': 'Laps', 'Pts': 'Pts', 'Ronda': 'Round', 'Llegada': 'Finish',

        /* ---- Videos / noticias / tienda ---- */
        'Muy pronto, más videos': 'More videos soon',
        'Estamos preparando análisis y resúmenes de cada Gran Premio. Mientras tanto, síguenos en YouTube.':
            'We are preparing analysis and recaps of every Grand Prix. Meanwhile, follow us on YouTube.',
        'Ir a nuestro canal': 'Go to our channel',
        'Contenido propio y videos oficiales incrustados desde YouTube. Los videos solo se cargan cuando les das clic.':
            'Our own content and official videos embedded from YouTube. Videos only load when you click them.',
        'Propio': 'Own', 'Oficial': 'Official',

        /* ---- Pie de página ---- */
        'Sobre Nosotros': 'About us',
        'Sitio de aficionados con noticias, calendario e información de la Fórmula 1. Únete a nuestra comunidad global.':
            'A fan site with news, calendar and Formula 1 information. Join our global community.',
        'Navegación': 'Navigation', '🏠 Inicio': '🏠 Home', '⏱️ Sesiones': '⏱️ Sessions', '📰 Noticias': '📰 News', '🎬 Videos': '🎬 Videos',
        '📚 Temporadas': '📚 Seasons', '📅 Temporada': '📅 Season', 'Categorías': 'Categories', '🛍️ Tienda': '🛍️ Shop',
        '📧 Contacto': '📧 Contact', '🔒 Privacidad': '🔒 Privacy', '⚖️ Términos': '⚖️ Terms', 'Síguenos': 'Follow us',
        'Conecta con nosotros en las redes sociales.': 'Connect with us on social media.',
        'Política de Privacidad': 'Privacy Policy', 'Gestión de Cookies': 'Cookie settings', 'Términos de Servicio': 'Terms of Service', 'Contacto': 'Contact',
        'Avisa aquí': 'Tell us here',

        /* ---- Pilotos, equipos, circuitos, comparador ---- */
        'Pilotos de la Fórmula 1': 'Formula 1 drivers',
        'Elige un piloto para ver sus victorias, podios, poles y resultados carrera por carrera.': 'Pick a driver to see their wins, podiums, poles and race-by-race results.',
        'Buscar piloto': 'Search driver', 'Buscar piloto…': 'Search driver…',
        'Sin fotos de terceros.': 'No third-party photos.',
        'Datos: Jolpica F1 API (compatible con Ergast). Sin fotos de terceros.': 'Data: Jolpica F1 API (Ergast compatible). No third-party photos.',
        'No hay pilotos que coincidan.': 'No drivers match.', 'No hay datos de pilotos para esta temporada.': 'There is no driver data for this season.',
        'No pudimos cargar los pilotos ahora. Intenta de nuevo en unos minutos.': 'We could not load the drivers right now. Try again in a few minutes.',
        'No encontramos a ese piloto.': 'We could not find that driver.', 'Volver a la parrilla': 'Back to the grid', '← Todos los pilotos': '← All drivers',
        'Nacimiento': 'Born', 'Nacionalidad': 'Nationality', 'Número': 'Number',
        '☆ Hacer mi favorito': '☆ Make my favorite', '★ Es mi favorito': '★ My favorite',
        'Comparar con otro piloto': 'Compare with another driver', 'Títulos': 'Titles', 'Podios': 'Podiums', 'Poles': 'Poles', 'Carreras': 'Races',
        'Resultados por temporada': 'Results by season',
        'No pudimos cargar sus estadísticas ahora.': 'We could not load their stats right now.',
        'No pudimos cargar esa temporada ahora.': 'We could not load that season right now.',
        'Equipos de la Fórmula 1': 'Formula 1 teams', 'Constructores de cada temporada con sus pilotos, victorias y campeonatos.': 'Constructors of every season with their drivers, wins and championships.',
        'No hay datos de equipos para esta temporada.': 'There is no team data for this season.',
        'No pudimos cargar los equipos ahora. Intenta de nuevo en unos minutos.': 'We could not load the teams right now. Try again in a few minutes.',
        'No encontramos a ese equipo.': 'We could not find that team.', 'Volver a los equipos': 'Back to the teams', '← Todos los equipos': '← All teams',
        'Títulos de constructores': 'Constructors titles',
        'Este equipo no tiene pilotos recientes en los datos.': 'This team has no recent drivers in the data.',
        'Elige dos pilotos y mira sus cifras de carrera y su temporada, lado a lado.': 'Pick two drivers and see their career figures side by side.',
        'Primer piloto': 'First driver', 'Segundo piloto': 'Second driver', 'Elige un piloto…': 'Pick a driver…',
        'Elige dos pilotos para compararlos.': 'Pick two drivers to compare them.', 'Elige dos pilotos distintos.': 'Pick two different drivers.',
        '% de victorias': 'Win rate', 'Dato': 'Stat',
        'Cifras de toda la carrera del piloto en el campeonato mundial. Datos: Jolpica F1 API.': 'Figures from the driver’s whole world championship career. Data: Jolpica F1 API.',
        'No pudimos cargar la comparación ahora. Intenta de nuevo en unos minutos.': 'We could not load the comparison right now. Try again in a few minutes.',
        'Circuitos de la Fórmula 1': 'Formula 1 circuits', 'Dónde se corre cada Gran Premio y quién ha ganado en cada pista a lo largo de la historia.':
            'Where each Grand Prix is held and who has won at each track through history.',
        'Circuitos de la temporada': 'Circuits of the season', '← Todos los circuitos': '← All circuits',
        'Carreras disputadas': 'Races held', 'Primera carrera': 'First race', 'Última carrera ': 'Last race', 'Ganadores': 'Winners', 'Año': 'Year', 'Ganador': 'Winner',
        'Aún no hay ganadores registrados en este circuito.': 'There are no recorded winners at this circuit yet.',
        'Más información en Wikipedia': 'More on Wikipedia', 'No encontramos ese circuito.': 'We could not find that circuit.', 'Volver a los circuitos': 'Back to the circuits',
        'Datos: Jolpica F1 API. El mapa muestra la ubicación aproximada del circuito en el mundo.': 'Data: Jolpica F1 API. The map shows the approximate location of the circuit.',

        /* ---- Estadísticas ---- */
        'Estadísticas de la Fórmula 1': 'Formula 1 statistics',
        'Quién ha ganado más campeonatos y cómo se decidió cada temporada, ronda por ronda.': 'Who has won the most championships and how each season was decided, round by round.',
        'Más títulos': 'Most titles', 'Constructores (desde 1958)': 'Constructors (since 1958)', 'Campeones por década': 'Champions by decade',
        'Cómo se decidió cada temporada': 'How each season was decided', 'Década': 'Decade', 'Campeones': 'Champions',
        'Ver los datos en una tabla': 'See the data as a table', 'Aún no hay carreras en esta temporada.': 'There are no races in this season yet.',
        'Datos: Jolpica F1 API. Los títulos de la temporada en curso se cuentan cuando termina el campeonato.': 'Data: Jolpica F1 API. Titles of the current season are counted when the championship ends.',
        'No pudimos cargar las estadísticas ahora. Intenta de nuevo en unos minutos.': 'We could not load the stats right now. Try again in a few minutes.',

        /* ---- Quiniela ---- */
        'Quiniela de la próxima carrera': 'Next race predictor', 'Elige tu podio y tu pole. Cuando termine la carrera, calculamos tus puntos automáticamente.':
            'Pick your podium and pole. When the race ends, we work out your points automatically.',
        'Próxima carrera': 'Next race', 'Pole position': 'Pole position', '1.º lugar': '1st place', '2.º lugar': '2nd place', '3.º lugar': '3rd place', 'Elige…': 'Pick…',
        'Guardar pronóstico': 'Save prediction', 'Actualizar pronóstico': 'Update prediction', 'Tus puntos': 'Your points',
        'La carrera ya empezó: los pronósticos están cerrados.': 'The race has started: predictions are closed.',
        'Completa los cuatro puestos.': 'Fill in all four positions.', 'El podio no puede repetir pilotos.': 'The podium cannot repeat drivers.',
        'Pronóstico guardado en este navegador.': 'Prediction saved in this browser.',
        'Reglas: 3 puntos por cada puesto del podio exacto, 1 si el piloto sube al podio en otro puesto y 2 por la pole.':
            'Rules: 3 points for each exact podium position, 1 if the driver reaches the podium in another position and 2 for pole.',
        'Cuando termine una carrera en la que hayas pronosticado, verás aquí tus puntos.': 'When a race you predicted ends, you will see your points here.',
        'Esperando resultado': 'Waiting for result', 'Carrera ': 'Race ', 'Detalle': 'Details',
        'Tus pronósticos se guardan solo en este navegador (no hay cuentas ni servidores). Si borras los datos del sitio, se pierden. Es un juego entre aficionados, sin premios.':
            'Your predictions are saved only in this browser (no accounts or servers). If you clear the site data, they are lost. It is a game between fans, with no prizes.',
        'No pudimos cargar la próxima carrera ahora. Intenta de nuevo en unos minutos.': 'We could not load the next race right now. Try again in a few minutes.',
        'Pendiente': 'Upcoming', 'Finalizada': 'Finished', 'En curso (aprox.)': 'Live (approx.)', 'Agregar sesiones a mi calendario (.ics)': 'Add sessions to my calendar (.ics)',
        '📅 Agregar sesiones a mi calendario (.ics)': '📅 Add sessions to my calendar (.ics)',
        'No retransmitimos': 'We do not broadcast', 'No encontramos productos con esos filtros.': 'We found no products for those filters.',
        'Personaje ilustrado, no es una foto del piloto. Haz clic para saludar.': 'Illustrated character, not a photo of the driver. Click it to say hi.',
        'Tienda (pronto)': 'Shop (soon)', 'Próximamente': 'Coming soon', 'Tienda (próximamente)': 'Shop (coming soon)', 'Próximamente: ropa, gorras y accesorios para aficionados.': 'Coming soon: apparel, caps and accessories for fans.',
        'Estamos preparando una selección de ropa, gorras, miniaturas y accesorios para aficionados a la F1.': 'We are preparing a selection of apparel, caps, models and accessories for F1 fans.',
        'Muy pronto, más novedades': 'Much more soon', 'Ir al inicio': 'Go home', 'Jugar a la quiniela': 'Play the predictor', 'Nuestro YouTube': 'Our YouTube',
        'La tienda todavía no está disponible. Mientras tanto puedes seguir la temporada, jugar a la quiniela o revisar las estadísticas.': 'The shop is not available yet. Meanwhile you can follow the season, play the predictor or check the stats.',
        'Para el aficionado a la F1': 'For the F1 fan', 'Selección': 'Selection', 'Destacados': 'Featured',
        'Podio:': 'Podium:', 'Clasificación de pilotos': 'Drivers standings', 'Clasificación de constructores': 'Constructors standings',
        'Clasificación Sprint': 'Sprint Qualifying', 'Calendario por confirmar': 'Calendar to be confirmed',
        'Todo': 'All', 'Hitos': 'Milestones', 'Seguridad': 'Safety', 'Técnica': 'Technical', 'Campeonatos': 'Championships',
        'Próximo aniversario': 'Upcoming anniversary', 'Ver en la línea del tiempo →': 'See on the timeline →',
        '↓ Del más antiguo al más reciente': '↓ Oldest to newest', '↑ Del más reciente al más antiguo': '↑ Newest to oldest',
        'Ver la clasificación completa →': 'See the full standings →',
        'No hay una sesión próxima disponible. Consulta el calendario oficial.': 'No upcoming session available. Check the official calendar.',
        'Aún no tiene puntos esta temporada': 'No points yet this season',
        'Juego': 'Game', 'Herramienta': 'Tool'
    };

    const PAISES = {
        'Mónaco': 'Monaco', 'España': 'Spain', 'Italia': 'Italy', 'Alemania': 'Germany', 'Francia': 'France', 'Bélgica': 'Belgium',
        'Países Bajos': 'Dutch', 'Gran Bretaña': 'British', 'Japón': 'Japan', 'Brasil': 'Brazil', 'México': 'Mexico', 'Ciudad de México': 'Mexico City',
        'Estados Unidos': 'United States', 'Canadá': 'Canada', 'Hungría': 'Hungary', 'Singapur': 'Singapore', 'Catar': 'Qatar', 'Abu Dabi': 'Abu Dhabi',
        'Arabia Saudita': 'Saudi Arabian', 'Bahréin': 'Bahrain', 'Azerbaiyán': 'Azerbaijan', 'Australia': 'Australia', 'Austria': 'Austria', 'China': 'China',
        'Las Vegas': 'Las Vegas', 'Miami': 'Miami', 'Portugal': 'Portugal', 'Turquía': 'Turkish', 'Emilia-Romaña': 'Emilia Romagna'
    };

    const REGLAS = [
        [/^Ronda (\d+)$/, 'Round $1'],
        [/^Práctica (\d)$/, 'Practice $1'],
        [/^Tras la ronda (\d+)$/, 'After round $1'],
        [/^(\d+) pts · (\d+) victorias$/, '$1 pts · $2 wins'],
        [/^Horarios en tu zona: (.+)$/, 'Times in your zone: $1'],
        [/^Temporada (\d{4})$/, 'Season $1'],
        [/^Temporada (\d{4}) de la Fórmula 1$/, '$1 Formula 1 season'],
        [/^(\d+) pts$/, '$1 pts'],
        [/^(\d+) victorias$/, '$1 wins'],
        [/^(\d+) puntos en total$/, '$1 points in total'],
        [/^(\d+) años\)?$/, '$1 years old'],
        [/^Gran Premio de (.+)$/, (m, p) => `${PAISES[p] || p} Grand Prix`],
        [/^Más victorias: (.+)$/, 'Most wins: $1'],
        [/^Resultados de (.+) en (\d{4})$/, 'Results of $1 in $2'],
        [/^(.+) no tiene carreras registradas en (\d{4})\.$/, '$1 has no races recorded in $2.'],
        [/^¡(.+) ya comenzó!? ?.*$/, '$1 has started!']
    ];

    const NO_TRADUCIR = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'CODE']);
    const legal = /\/(privacidad|terminos)\.html$/.test(location.pathname);

    function limpiar(s) { return s.replace(/ /g, ' ').replace(/\s+/g, ' ').trim(); }

    function traducir(s) {
        const k = limpiar(s);
        if (!k) return null;
        if (Object.prototype.hasOwnProperty.call(DIC, k)) return DIC[k];
        for (const [re, sal] of REGLAS) {
            if (re.test(k)) return k.replace(re, sal);
        }
        // "Ronda 21 · Circuito · Ciudad": se traduce cada parte por separado
        if (k.includes(' · ')) {
            const partes = k.split(' · ');
            let alguna = false;
            const sal = partes.map((p) => { const t = traducir(p); if (t != null) alguna = true; return t != null ? t : p; });
            if (alguna) return sal.join(' · ');
        }
        return null;
    }

    function enLegal(nodo) {
        return legal && nodo.parentElement && nodo.parentElement.closest('main');
    }

    function textoNodo(n) {
        if (!n.parentElement || NO_TRADUCIR.has(n.parentElement.tagName) || n.parentElement.closest('[data-no-i18n]') || enLegal(n)) return;
        const original = n.nodeValue;
        const t = traducir(original);
        if (t == null || t === limpiar(original)) return;
        const ini = original.match(/^\s*/)[0];
        const fin = original.match(/\s*$/)[0];
        n.nodeValue = ini + t + fin;
    }

    const ATRIBUTOS = ['placeholder', 'aria-label', 'title', 'alt'];
    function atributos(el) {
        if (enLegal(el.firstChild || el)) return;
        ATRIBUTOS.forEach((a) => {
            const v = el.getAttribute && el.getAttribute(a);
            if (!v) return;
            const t = traducir(v);
            if (t != null) el.setAttribute(a, t);
        });
    }

    function recorrer(raiz) {
        if (raiz.nodeType === 3) { textoNodo(raiz); return; }
        if (raiz.nodeType !== 1 || NO_TRADUCIR.has(raiz.tagName)) return;
        atributos(raiz);
        const w = document.createTreeWalker(raiz, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
        let n = w.nextNode();
        while (n) {
            if (n.nodeType === 3) textoNodo(n);
            else if (!NO_TRADUCIR.has(n.tagName)) atributos(n);
            n = w.nextNode();
        }
    }

    function metadatos() {
        const parte = document.title.split(' | ');
        const t = traducir(parte[0]);
        if (t != null) { parte[0] = t; document.title = parte.join(' | '); }
        const d = document.querySelector('meta[name="description"]');
        if (d) { const x = traducir(d.getAttribute('content') || ''); if (x != null) d.setAttribute('content', x); }
    }

    let pendiente = false;
    const nuevos = new Set();
    const obs = new MutationObserver((muts) => {
        muts.forEach((m) => {
            if (m.type === 'characterData') nuevos.add(m.target);
            m.addedNodes.forEach((n) => nuevos.add(n));
        });
        if (pendiente) return;
        pendiente = true;
        requestAnimationFrame(() => {
            pendiente = false;
            obs.disconnect();
            const lote = Array.from(nuevos);
            nuevos.clear();
            lote.forEach((n) => { if (n.isConnected) recorrer(n); });
            obs.observe(document.body, { childList: true, subtree: true, characterData: true });
        });
    });

    function iniciar() {
        document.documentElement.setAttribute('lang', 'en');
        recorrer(document.body);
        metadatos();
        if (legal) {
            const main = document.querySelector('main');
            if (main) {
                const aviso = document.createElement('p');
                aviso.className = 'notice';
                aviso.setAttribute('data-no-i18n', '');
                aviso.textContent = 'This legal text is available in Spanish only. The Spanish version is the binding one.';
                main.prepend(aviso);
            }
        }
        obs.observe(document.body, { childList: true, subtree: true, characterData: true });
    }

    if (document.body) iniciar(); else document.addEventListener('DOMContentLoaded', iniciar);
})();
