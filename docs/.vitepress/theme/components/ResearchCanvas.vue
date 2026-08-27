<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { subscribeAnimation } from '../animationScheduler'

type AnimationKind = 'loop' | 'path' | 'barrier' | 'horizon' | 'health' | 'joint'

const props = defineProps<{
  kind: AnimationKind
  label: string
}>()

const canvas = ref<HTMLCanvasElement | null>(null)
let resizeObserver: ResizeObserver | undefined
let intersectionObserver: IntersectionObserver | undefined
let motionQuery: MediaQueryList | undefined
let stopScheduler: (() => void) | undefined
let isVisible = false

const palette = {
  cyan: '#39d8ec',
  violet: '#8d68ff',
  white: '#eefcff',
  muted: 'rgba(158, 174, 211, .42)',
  grid: 'rgba(129, 150, 196, .09)'
}

function setupCanvas() {
  const node = canvas.value
  if (!node) return null
  const width = Math.max(280, node.clientWidth)
  const height = Math.max(174, node.clientHeight)
  const dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth < 640 ? 1.15 : 1.7)

  if (node.width !== Math.round(width * dpr) || node.height !== Math.round(height * dpr)) {
    node.width = Math.round(width * dpr)
    node.height = Math.round(height * dpr)
  }

  const ctx = node.getContext('2d')
  if (!ctx) return null
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, width, height)
  return { ctx, width, height }
}

function drawGrid(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.strokeStyle = palette.grid
  ctx.lineWidth = 1
  for (let x = 24; x < width; x += 36) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()
  }
  for (let y = 22; y < height; y += 36) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }
}

function point(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.fill()
}

function glow(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string) {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
  gradient.addColorStop(0, color)
  gradient.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.fill()
}

function drawLoop(ctx: CanvasRenderingContext2D, width: number, height: number, time: number) {
  const cx = width / 2
  const cy = height / 2
  glow(ctx, cx, cy, Math.min(width, height) * 0.34, 'rgba(57,216,236,.18)')
  ctx.strokeStyle = 'rgba(57,216,236,.28)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.ellipse(cx, cy, width * 0.25, height * 0.29, -0.22, 0, Math.PI * 2)
  ctx.stroke()
  ctx.strokeStyle = 'rgba(141,104,255,.28)'
  ctx.beginPath()
  ctx.ellipse(cx, cy, width * 0.18, height * 0.36, 0.72, 0, Math.PI * 2)
  ctx.stroke()
  for (let index = 0; index < 6; index += 1) {
    const angle = time * 0.55 + (index * Math.PI * 2) / 6
    const x = cx + Math.cos(angle) * width * 0.25
    const y = cy + Math.sin(angle) * height * 0.29
    ctx.strokeStyle = 'rgba(57,216,236,.15)'
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(x, y)
    ctx.stroke()
    point(ctx, x, y, 3.5, index % 2 ? palette.violet : palette.cyan)
  }
  point(ctx, cx, cy, 7 + Math.sin(time * 2) * 1.5, palette.white)
}

function drawPath(ctx: CanvasRenderingContext2D, width: number, height: number, time: number) {
  const points = [
    [width * 0.1, height * 0.74],
    [width * 0.26, height * 0.58],
    [width * 0.42, height * 0.64],
    [width * 0.59, height * 0.35],
    [width * 0.78, height * 0.42],
    [width * 0.9, height * 0.22]
  ]
  ctx.fillStyle = 'rgba(141,104,255,.2)'
  ;[[.2, .25], [.48, .27], [.7, .68]].forEach(([x, y]) => {
    ctx.fillRect(width * x - 9, height * y - 9, 18, 18)
  })
  ctx.strokeStyle = palette.cyan
  ctx.lineWidth = 2
  ctx.setLineDash([5, 7])
  ctx.beginPath()
  points.forEach(([x, y], index) => index ? ctx.lineTo(x, y) : ctx.moveTo(x, y))
  ctx.stroke()
  ctx.setLineDash([])
  const segment = ((time * 0.36) % 1) * (points.length - 1)
  const index = Math.min(points.length - 2, Math.floor(segment))
  const ratio = segment - index
  const x = points[index][0] + (points[index + 1][0] - points[index][0]) * ratio
  const y = points[index][1] + (points[index + 1][1] - points[index][1]) * ratio
  glow(ctx, x, y, 26, 'rgba(57,216,236,.25)')
  point(ctx, x, y, 5.5, palette.white)
}

function drawBarrier(ctx: CanvasRenderingContext2D, width: number, height: number, time: number) {
  const cx = width / 2
  const cy = height / 2
  const radius = Math.min(width, height) * 0.31
  ctx.strokeStyle = 'rgba(141,104,255,.48)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(cx, cy, radius, 0, Math.PI * 2)
  ctx.stroke()
  ctx.strokeStyle = 'rgba(57,216,236,.2)'
  ctx.setLineDash([4, 8])
  ctx.beginPath()
  ctx.arc(cx, cy, radius * 0.72, 0, Math.PI * 2)
  ctx.stroke()
  ctx.setLineDash([])
  const angle = time * 0.8
  const desiredX = cx + Math.cos(angle) * radius * 1.22
  const desiredY = cy + Math.sin(angle * 1.25) * radius * 0.9
  const dx = desiredX - cx
  const dy = desiredY - cy
  const length = Math.hypot(dx, dy)
  const scale = Math.min(1, radius * 0.82 / length)
  const safeX = cx + dx * scale
  const safeY = cy + dy * scale
  ctx.strokeStyle = 'rgba(57,216,236,.42)'
  ctx.beginPath()
  ctx.moveTo(desiredX, desiredY)
  ctx.lineTo(safeX, safeY)
  ctx.stroke()
  point(ctx, desiredX, desiredY, 3, palette.muted)
  glow(ctx, safeX, safeY, 24, 'rgba(57,216,236,.2)')
  point(ctx, safeX, safeY, 5, palette.cyan)
  point(ctx, cx, cy, 4, palette.white)
}

function drawHorizon(ctx: CanvasRenderingContext2D, width: number, height: number, time: number) {
  const left = width * 0.1
  const base = height * 0.76
  const chartWidth = width * 0.8
  ctx.strokeStyle = 'rgba(158,174,211,.2)'
  ctx.beginPath()
  ctx.moveTo(left, height * 0.2)
  ctx.lineTo(left, base)
  ctx.lineTo(left + chartWidth, base)
  ctx.stroke()
  const horizon = 11
  ctx.strokeStyle = palette.cyan
  ctx.lineWidth = 2
  ctx.beginPath()
  const predictedPoints: Array<[number, number]> = []
  for (let index = 0; index < horizon; index += 1) {
    const x = left + (chartWidth * index) / (horizon - 1)
    const y = base - height * (0.19 + 0.25 * Math.exp(-index / 4) + 0.06 * Math.sin(time + index * .7))
    index ? ctx.lineTo(x, y) : ctx.moveTo(x, y)
    predictedPoints.push([x, y])
  }
  ctx.stroke()
  predictedPoints.forEach(([x, y], index) => point(ctx, x, y, 2.6, index < 4 ? palette.white : palette.cyan))
  ctx.strokeStyle = 'rgba(141,104,255,.55)'
  ctx.beginPath()
  for (let index = 0; index < horizon; index += 1) {
    const x = left + (chartWidth * index) / (horizon - 1)
    const y = base - height * (0.14 + 0.13 * Math.sin(index * .52 + time * .55))
    index ? ctx.lineTo(x, y) : ctx.moveTo(x, y)
  }
  ctx.stroke()
}

function drawHealth(ctx: CanvasRenderingContext2D, width: number, height: number, time: number) {
  const left = width * 0.08
  const top = height * 0.18
  const chartWidth = width * 0.7
  const chartHeight = height * 0.56
  ctx.strokeStyle = palette.cyan
  ctx.lineWidth = 2
  ctx.beginPath()
  for (let index = 0; index <= 32; index += 1) {
    const x = left + (chartWidth * index) / 32
    const event = Math.exp(-Math.pow(index - 21, 2) / 8) * .28
    const y = top + chartHeight * (.22 + index / 56 + event + Math.sin(index * .7 + time) * .025)
    index ? ctx.lineTo(x, y) : ctx.moveTo(x, y)
  }
  ctx.stroke()
  const level = .72 + Math.sin(time * .7) * .03
  ctx.strokeStyle = 'rgba(141,104,255,.65)'
  ctx.lineWidth = 2
  ctx.strokeRect(width * .82, height * .28, width * .09, height * .42)
  ctx.fillStyle = 'rgba(141,104,255,.4)'
  ctx.fillRect(width * .835, height * (.68 - level * .36), width * .06, height * .36 * level)
  ctx.fillStyle = palette.muted
  ctx.fillRect(width * .85, height * .235, width * .03, height * .045)
}

function drawJoint(ctx: CanvasRenderingContext2D, width: number, height: number, time: number) {
  const baseX = width * 0.25
  const baseY = height * 0.72
  const a1 = -1.05 + Math.sin(time * .65) * .16
  const a2 = -.42 + Math.sin(time * .85 + 1.2) * .25
  const length1 = Math.min(width * .23, height * .48)
  const length2 = Math.min(width * .22, height * .42)
  const jointX = baseX + Math.cos(a1) * length1
  const jointY = baseY + Math.sin(a1) * length1
  const endX = jointX + Math.cos(a1 + a2) * length2
  const endY = jointY + Math.sin(a1 + a2) * length2
  ctx.lineCap = 'round'
  ctx.strokeStyle = 'rgba(141,104,255,.58)'
  ctx.lineWidth = 12
  ctx.beginPath()
  ctx.moveTo(baseX, baseY)
  ctx.lineTo(jointX, jointY)
  ctx.stroke()
  ctx.strokeStyle = 'rgba(57,216,236,.72)'
  ctx.lineWidth = 9
  ctx.beginPath()
  ctx.moveTo(jointX, jointY)
  ctx.lineTo(endX, endY)
  ctx.stroke()
  ;[[baseX, baseY], [jointX, jointY], [endX, endY]].forEach(([x, y], index) => {
    glow(ctx, x, y, 22, index === 1 ? 'rgba(57,216,236,.2)' : 'rgba(141,104,255,.15)')
    point(ctx, x, y, index === 1 ? 8 : 6, palette.white)
  })
  ctx.strokeStyle = 'rgba(57,216,236,.24)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.arc(endX, endY, 34 + Math.sin(time * 2) * 3, 0, Math.PI * 2)
  ctx.stroke()
}

function render(time = 0) {
  const setup = setupCanvas()
  if (!setup) return
  const { ctx, width, height } = setup
  drawGrid(ctx, width, height)
  const drawers = { loop: drawLoop, path: drawPath, barrier: drawBarrier, horizon: drawHorizon, health: drawHealth, joint: drawJoint }
  drawers[props.kind](ctx, width, height, time)
}

function stop() {
  stopScheduler?.()
  stopScheduler = undefined
}

function syncAnimation() {
  const reduced = motionQuery?.matches ?? false
  if (!isVisible || reduced) {
    stop()
    render(0)
    return
  }
  if (!stopScheduler) stopScheduler = subscribeAnimation((time) => render(time / 1000))
}

onMounted(() => {
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  motionQuery.addEventListener('change', syncAnimation)
  resizeObserver = new ResizeObserver(() => render(0))
  if (canvas.value) resizeObserver.observe(canvas.value)
  intersectionObserver = new IntersectionObserver(([entry]) => {
    isVisible = entry.isIntersecting
    syncAnimation()
  }, { threshold: 0.08 })
  if (canvas.value) intersectionObserver.observe(canvas.value)
  render(0)
})

onBeforeUnmount(() => {
  stop()
  resizeObserver?.disconnect()
  intersectionObserver?.disconnect()
  motionQuery?.removeEventListener('change', syncAnimation)
})
</script>

<template>
  <div class="research-canvas">
    <canvas
      ref="canvas"
      width="560"
      height="280"
      role="img"
      :aria-label="`${label}研究方向的抽象动态示意；低动态模式下显示静态图`"
    />
    <span class="sr-only">{{ label }}：动画仅用于方向意象，不表达研究规模或排名。</span>
  </div>
</template>
