import type { Route } from '@/types'

export interface ShareCardData {
  title: string
  distanceLabel: string
  durationLabel: string
  paceLabel: string
  dateLabel: string
  route: Route
}

const WIDTH = 1080
const HEIGHT = 1350

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

/**
 * Renders the share card to a canvas and returns it as a PNG blob.
 * Everything is drawn locally — no server, no third-party library.
 */
export async function renderShareCard(data: ShareCardData): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = WIDTH
  canvas.height = HEIGHT
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas is not supported in this browser')

  const ink = '#0d0e10'
  const accent = '#d4fb3c'
  const muted = 'rgba(255,255,255,0.55)'

  ctx.fillStyle = ink
  ctx.fillRect(0, 0, WIDTH, HEIGHT)

  // Route panel
  const panelX = 80
  const panelY = 190
  const panelW = WIDTH - 160
  const panelH = 620
  ctx.fillStyle = '#17191c'
  roundedRect(ctx, panelX, panelY, panelW, panelH, 56)
  ctx.fill()

  // Route polyline, fitted into the panel with padding.
  const pad = 90
  const xs = data.route.points.map((p) => p.x)
  const ys = data.route.points.map((p) => p.y)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  const spanX = maxX - minX || 1
  const spanY = maxY - minY || 1
  const scale = Math.min((panelW - pad * 2) / spanX, (panelH - pad * 2) / spanY)
  const offsetX = panelX + (panelW - spanX * scale) / 2
  const offsetY = panelY + (panelH - spanY * scale) / 2

  const project = (point: { x: number; y: number }) => ({
    x: offsetX + (point.x - minX) * scale,
    y: offsetY + (point.y - minY) * scale,
  })

  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'

  // Catmull-Rom → Bézier, matching the smoothing the in-app map uses.
  const projected = data.route.points.map(project)
  ctx.beginPath()
  if (projected.length > 0) {
    ctx.moveTo(projected[0]!.x, projected[0]!.y)
    for (let i = 0; i < projected.length - 1; i++) {
      const p0 = projected[Math.max(0, i - 1)]!
      const p1 = projected[i]!
      const p2 = projected[i + 1]!
      const p3 = projected[Math.min(projected.length - 1, i + 2)]!
      ctx.bezierCurveTo(
        p1.x + (p2.x - p0.x) / 6,
        p1.y + (p2.y - p0.y) / 6,
        p2.x - (p3.x - p1.x) / 6,
        p2.y - (p3.y - p1.y) / 6,
        p2.x,
        p2.y,
      )
    }
  }
  ctx.strokeStyle = 'rgba(212,251,60,0.22)'
  ctx.lineWidth = 34
  ctx.stroke()
  ctx.strokeStyle = accent
  ctx.lineWidth = 10
  ctx.stroke()

  const first = data.route.points[0]
  const last = data.route.points[data.route.points.length - 1]
  if (first) {
    const { x, y } = project(first)
    ctx.fillStyle = accent
    ctx.beginPath()
    ctx.arc(x, y, 18, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = ink
    ctx.beginPath()
    ctx.arc(x, y, 7, 0, Math.PI * 2)
    ctx.fill()
  }
  if (last) {
    const { x, y } = project(last)
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(x, y, 16, 0, Math.PI * 2)
    ctx.fill()
  }

  // Wordmark
  ctx.fillStyle = '#ffffff'
  ctx.font = '700 40px Inter, -apple-system, "Segoe UI", sans-serif'
  ctx.letterSpacing = '10px'
  ctx.fillText('MOTION', 80, 120)
  ctx.letterSpacing = '0px'

  ctx.fillStyle = muted
  ctx.font = '500 30px Inter, -apple-system, "Segoe UI", sans-serif'
  ctx.textAlign = 'right'
  ctx.fillText(data.dateLabel, WIDTH - 80, 120)
  ctx.textAlign = 'left'

  // Headline metrics
  ctx.fillStyle = '#ffffff'
  ctx.font = '600 150px Inter, -apple-system, "Segoe UI", sans-serif'
  ctx.fillText(data.distanceLabel.toUpperCase(), 80, 990)

  ctx.font = '600 90px Inter, -apple-system, "Segoe UI", sans-serif'
  ctx.fillStyle = accent
  ctx.fillText(data.durationLabel.toUpperCase(), 80, 1096)

  ctx.fillStyle = muted
  ctx.font = '500 34px Inter, -apple-system, "Segoe UI", sans-serif'
  ctx.letterSpacing = '4px'
  ctx.fillText(data.title.toUpperCase(), 80, 1176)
  ctx.letterSpacing = '0px'

  // Footer rule and pace
  ctx.strokeStyle = 'rgba(255,255,255,0.12)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(80, 1226)
  ctx.lineTo(WIDTH - 80, 1226)
  ctx.stroke()

  ctx.fillStyle = muted
  ctx.font = '500 30px Inter, -apple-system, "Segoe UI", sans-serif'
  ctx.fillText(data.paceLabel, 80, 1284)
  ctx.textAlign = 'right'
  ctx.fillText('MOVE MORE. LIVE BETTER.', WIDTH - 80, 1284)
  ctx.textAlign = 'left'

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('The image could not be generated'))
    }, 'image/png')
  })
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  // Give the browser a tick to start the download before revoking.
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
