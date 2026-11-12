# Cómo agregar videos a la página de Videos

La página `html/paginas/videos.html` se alimenta de `data/videos.json`. No hay que tocar código.

## Pasos

1. Sube tu video a YouTube (o toma uno de un canal oficial que permita incrustar).
2. Copia el ID: en `https://www.youtube.com/watch?v=ABCDEFGHIJK` el ID es `ABCDEFGHIJK` (11 caracteres).
3. Agrega un objeto a la lista `videos` de `data/videos.json`:

```json
{
  "videos": [
    {
      "id": "ABCDEFGHIJK",
      "titulo": "Análisis del Gran Premio de Las Vegas",
      "descripcion": "Lo mejor de la carrera en 5 minutos.",
      "fecha": "2026-11-23",
      "tipo": "propio",
      "categoria": "Análisis"
    }
  ]
}
```

| Campo | Obligatorio | Valores |
|---|---|---|
| `id` | sí | ID de YouTube de 11 caracteres |
| `titulo` | sí | Texto |
| `descripcion` | no | Una línea |
| `fecha` | no | `AAAA-MM-DD` (se ordena de más nuevo a más viejo) |
| `tipo` | no | `propio` u `oficial` |
| `categoria` | no | Texto libre; si hay 2 o más categorías aparecen filtros |
| `gp` | no | Liga el video a un Gran Premio del calendario, formato `AÑO_slug` (ej. `2026_gran_premio_de_las_vegas`). Aparece en `video_gp.html` al abrir esa carrera desde el calendario |

## Reglas (ver `POLITICA_DE_CONTENIDO.md`)

- Solo videos **propios** o de **canales oficiales** que permitan incrustar.
- Nunca videos con fragmentos de la señal de F1 subidos por terceros ni resubidos por ti.
- Si YouTube bloquea la incrustación de un video, no se podrá reproducir aquí: quítalo de la lista.
