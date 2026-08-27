type AnimationTask = (time: number) => void

const tasks = new Set<AnimationTask>()
const frameInterval = 1000 / 30
let animationFrame = 0
let lastFrame = 0
let listening = false

function tick(time: number) {
  if (typeof document !== 'undefined' && document.hidden) {
    animationFrame = 0
    return
  }

  if (time - lastFrame >= frameInterval) {
    lastFrame = time
    tasks.forEach((task) => task(time))
  }

  animationFrame = tasks.size ? requestAnimationFrame(tick) : 0
}

function ensureRunning() {
  if (!animationFrame && tasks.size && typeof requestAnimationFrame !== 'undefined') {
    animationFrame = requestAnimationFrame(tick)
  }
}

function listenForVisibility() {
  if (listening || typeof document === 'undefined') return
  listening = true
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) ensureRunning()
  })
}

export function subscribeAnimation(task: AnimationTask) {
  listenForVisibility()
  tasks.add(task)
  ensureRunning()

  return () => {
    tasks.delete(task)
    if (!tasks.size && animationFrame) {
      cancelAnimationFrame(animationFrame)
      animationFrame = 0
    }
  }
}
