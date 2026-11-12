// Cloudflare Worker: proxy de noticias para Formula 1 Fans Global.
//
// Por qué existe: el sitio es estático (GitHub Pages) y todo lo que se publica
// ahí es público. La clave de NewsData.io debe vivir como SECRETO del Worker
// (NEWSDATA_API_KEY), nunca en el repositorio ni en el navegador.
//
// Además: cachea la respuesta (ahorra cuota de la API) y devuelve solo los
// campos que el sitio necesita, con enlaces e imágenes únicamente https.

const NEWSDATA_URL = 'https://newsdata.io/api/1/news';
const CACHE_SECONDS = 900; // 15 minutos
const MAX_RESULTADOS = 12;

function soloHttps(valor) {
    try {
        const url = new URL(valor);
        return url.protocol === 'https:' ? url.toString() : null;
    } catch (e) {
        return null;
    }
}

function json(cuerpo, estado = 200, extra = {}) {
    return new Response(JSON.stringify(cuerpo), {
        status: estado,
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': `public, max-age=${CACHE_SECONDS}`,
            'X-Content-Type-Options': 'nosniff',
            ...extra
        }
    });
}

export default {
    async fetch(request, env, ctx) {
        if (request.method !== 'GET') {
            return json({ error: 'Método no permitido' }, 405, { Allow: 'GET' });
        }
        if (!env.NEWSDATA_API_KEY) {
            return json({ error: 'Servicio no configurado' }, 500, { 'Cache-Control': 'no-store' });
        }

        const cache = caches.default;
        const cacheKey = new Request(new URL(request.url).origin + '/__noticias_v1', { method: 'GET' });
        const enCache = await cache.match(cacheKey);
        if (enCache) return enCache;

        const destino = new URL(NEWSDATA_URL);
        destino.searchParams.set('apikey', env.NEWSDATA_API_KEY);
        destino.searchParams.set('q', 'formula1');
        destino.searchParams.set('language', 'es');

        let origen;
        try {
            origen = await fetch(destino.toString(), { headers: { Accept: 'application/json' } });
        } catch (e) {
            return json({ error: 'No se pudo contactar al proveedor de noticias' }, 502, { 'Cache-Control': 'no-store' });
        }
        if (!origen.ok) {
            return json({ error: 'El proveedor de noticias respondió con error' }, 502, { 'Cache-Control': 'no-store' });
        }

        const datos = await origen.json();
        const resultados = (Array.isArray(datos.results) ? datos.results : [])
            .map((n) => ({
                title: typeof n.title === 'string' ? n.title : '',
                description: typeof n.description === 'string' ? n.description.slice(0, 400) : '',
                link: soloHttps(n.link),
                image_url: soloHttps(n.image_url),
                source_name: typeof n.source_name === 'string' ? n.source_name : '',
                pubDate: typeof n.pubDate === 'string' ? n.pubDate : ''
            }))
            .filter((n) => n.title && n.link)
            .slice(0, MAX_RESULTADOS);

        const respuesta = json({ results: resultados });
        ctx.waitUntil(cache.put(cacheKey, respuesta.clone()));
        return respuesta;
    }
};
