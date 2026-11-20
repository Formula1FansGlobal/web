# actualizar-noticias.ps1 - Descarga noticias de F1 (NewsData.io) y las guarda en data/noticias.json.
#
# Lo ejecuta el workflow .github/workflows/noticias.yml cada hora. La clave llega como secreto de
# GitHub (NEWSDATA_API_KEY) y NUNCA se imprime ni se escribe en ningún archivo.
#
# - Solo guarda título, descripción corta, enlace https, imagen https, fuente y fecha.
# - Acumula noticias: mezcla las nuevas con las ya guardadas (máx. 24, de los últimos 14 días).
# - Si la API falla o no devuelve nada, NO toca el archivo (el sitio sigue mostrando lo anterior).
#
# Uso local de prueba (sin red): ./actualizar-noticias.ps1 -Entrada ejemplo.json -Salida prueba.json

param(
    [string]$Salida = 'data/noticias.json',
    [string]$Entrada = ''
)

$ErrorActionPreference = 'Stop'
$MAX = 24
$DIAS = 14

function Solo-Https([object]$valor) {
    if (-not ($valor -is [string])) { return $null }
    try {
        $u = [System.Uri]$valor
        if ($u.Scheme -eq 'https') { return $u.AbsoluteUri }
    } catch { }
    return $null
}

function Texto([object]$valor, [int]$max) {
    if (-not ($valor -is [string])) { return '' }
    $t = ($valor -replace '\s+', ' ').Trim()
    if ($t.Length -gt $max) { $t = $t.Substring(0, $max) }
    return $t
}

# 1) Leer la respuesta de la API (o un archivo de prueba)
if ($Entrada) {
    $datos = Get-Content -Raw -Encoding UTF8 $Entrada | ConvertFrom-Json
} else {
    if (-not $env:NEWSDATA_API_KEY) { Write-Host 'Falta el secreto NEWSDATA_API_KEY: no se actualizan las noticias.'; exit 0 }
    $url = 'https://newsdata.io/api/1/latest?apikey=' + [uri]::EscapeDataString($env:NEWSDATA_API_KEY) + '&q=formula1&language=es'
    try {
        $datos = Invoke-RestMethod -Uri $url -Headers @{ Accept = 'application/json' } -TimeoutSec 40
    } catch {
        # No mostramos $_ porque podría incluir la URL con la clave.
        Write-Host 'No se pudo consultar NewsData.io (se conserva el archivo anterior).'
        exit 0
    }
}

$nuevas = @()
foreach ($n in @($datos.results)) {
    $enlace = Solo-Https $n.link
    $titulo = Texto $n.title 300
    if (-not $enlace -or -not $titulo) { continue }
    $fecha = ''
    if ($n.pubDate -is [string]) { $fecha = $n.pubDate } elseif ($n.pubDate) { $fecha = ([datetime]$n.pubDate).ToString('yyyy-MM-dd HH:mm:ss') }
    $nuevas += [pscustomobject][ordered]@{
        title       = $titulo
        description = Texto $n.description 400
        link        = $enlace
        image_url   = Solo-Https $n.image_url
        source_name = Texto $n.source_name 80
        pubDate     = $fecha
    }
}
if ($nuevas.Count -eq 0) { Write-Host 'La API no devolvió noticias válidas: no se cambia nada.'; exit 0 }

# 2) Mezclar con lo que ya había
$previas = @()
if (Test-Path $Salida) {
    try { $previas = @((Get-Content -Raw -Encoding UTF8 $Salida | ConvertFrom-Json).results) } catch { $previas = @() }
}
$vistos = @{}
$todas = @()
foreach ($n in ($nuevas + $previas)) {
    if (-not $n -or -not $n.link -or $vistos.ContainsKey($n.link)) { continue }
    $vistos[$n.link] = $true
    $todas += $n
}
$limite = (Get-Date).ToUniversalTime().AddDays(-$DIAS)
$todas = @($todas | Where-Object {
    $d = [datetime]::MinValue
    -not [datetime]::TryParse([string]$_.pubDate, [ref]$d) -or $d -ge $limite
} | Sort-Object { $d = [datetime]::MinValue; [void][datetime]::TryParse([string]$_.pubDate, [ref]$d); $d } -Descending | Select-Object -First $MAX)

# 3) Guardar (UTF-8 sin BOM) solo si cambió el contenido
$salidaObj = [ordered]@{
    actualizado = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ')
    results     = $todas
}
$json = ConvertTo-Json -InputObject $salidaObj -Depth 5
$dir = Split-Path -Parent $Salida
if ($dir -and -not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }
[System.IO.File]::WriteAllText($ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($Salida), $json, (New-Object System.Text.UTF8Encoding($false)))
Write-Host ("Guardadas {0} noticias en {1}." -f $todas.Count, $Salida)
