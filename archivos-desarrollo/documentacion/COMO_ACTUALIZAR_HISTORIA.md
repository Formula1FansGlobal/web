# Cómo funciona y cómo actualizar la "Historia viva" (portada)

La línea del tiempo de la portada mezcla tres fuentes. **No son noticias**: es historia que se va escribiendo.

| Fuente | Qué muestra | ¿Quién la actualiza? |
|---|---|---|
| `data/historia.json` | Hitos, seguridad, técnica y campeonatos curados | Tú (editando el archivo) |
| API de la temporada (Jolpica) | Campeón de pilotos y de constructores de cada año desde **2025** | Automático, cuando termina la temporada |
| Tarjetas superiores | «Un día como hoy» / «Próximo aniversario» y la temporada en curso | Automático (fecha del día y clasificación actual) |

## Agregar un evento

Abre `data/historia.json` y añade un objeto a la lista `eventos`:

```json
{
  "id": "2027-01",
  "anio": 2027,
  "fecha": "03-14",
  "categoria": "hito",
  "titulo": "Título corto y claro",
  "texto": "Dos o tres frases con el hecho, sin opinión.",
  "cambio": "Solo para seguridad: qué cambió después."
}
```

| Campo | Obligatorio | Detalle |
|---|---|---|
| `id` | sí | Único, sin espacios (ej. `2027-01`) |
| `anio` | sí | Número de 4 cifras |
| `categoria` | sí | `hito`, `seguridad`, `tecnica` o `campeonato` |
| `titulo` y `texto` | sí | Texto plano (no HTML) |
| `fecha` | no | Formato `MM-DD`. Si la pones, el evento aparece en «Un día como hoy» cada año |
| `cambio` | no | Recuadro «Lo que cambió». Úsalo en eventos de seguridad |

Después de editar, sube `CACHE_VERSION` en `sw.js` y haz commit.

## Reglas de contenido

- **Verifica cada dato** en fuentes fiables (formula1.com, FIA, archivo de prensa) antes de publicar. Los eventos de seguridad involucran a personas reales: sé exacto y respetuoso, sin detalles morbosos.
- No copies textos de otros sitios: redacta con tus palabras.
- Evita cifras que cambian con el tiempo (récords vigentes) salvo que las actualices.
- Si ya escribes un evento `campeonato` para un año ≥ 2025, el automático de ese año se omite.

## Campeones automáticos

`js/historia.js` agrega, para cada año desde `AUTO_DESDE` (2025) hasta hoy, una tarjeta con el campeón de pilotos y el de constructores
**cuando la temporada ya terminó** (la fecha de la última carrera es anterior a hoy). Se marcan como «Automático».
Si la API falla, simplemente no aparecen y el resto de la línea del tiempo sigue funcionando.
