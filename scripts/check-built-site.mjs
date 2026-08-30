import { access, readFile, readdir } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const outputDir = path.join(root, 'docs', '.vitepress', 'dist')
const siteOrigin = 'https://yichengdong0219.github.io'
const siteBase = '/njura-wiki/'

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = await Promise.all(entries.map(async (entry) => {
    const target = path.join(directory, entry.name)
    return entry.isDirectory() ? walk(target) : [target]
  }))
  return files.flat()
}

async function exists(target) {
  try {
    await access(target)
    return true
  } catch {
    return false
  }
}

function pageUrl(file) {
  const relative = path.relative(outputDir, file).split(path.sep).join('/')
  const route = relative.endsWith('/index.html')
    ? relative.slice(0, -'index.html'.length)
    : relative === 'index.html'
      ? ''
      : relative
  return new URL(`${siteBase}${route}`, siteOrigin)
}

function candidatesFor(url) {
  let relative
  try {
    relative = decodeURIComponent(url.pathname.slice(siteBase.length))
  } catch {
    return []
  }

  if (url.pathname.endsWith('/')) {
    return [path.join(outputDir, relative, 'index.html')]
  }

  if (path.extname(relative)) {
    return [path.join(outputDir, relative)]
  }

  return [
    path.join(outputDir, `${relative}.html`),
    path.join(outputDir, relative, 'index.html')
  ]
}

const files = await walk(outputDir)
const htmlFiles = files.filter((file) => file.endsWith('.html'))
const errors = []
let checkedLinks = 0

for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8')
  const relative = path.relative(outputDir, file)

  if (relative === 'index.html') {
    for (const label of ['查课程', '按方向找老师', '看同学做过什么', '第一次进实验室', '找一条可走的学习路径']) {
      if (!html.includes(label)) errors.push(`index.html: 缺少首页入口“${label}”`)
    }
    if (html.includes('research-canvas')) errors.push('index.html: 首页不应再渲染多路 Canvas')
    if (!html.includes('class="research-loop"')) errors.push('index.html: 缺少单一研究反馈环')
  }

  if (relative === path.join('research', 'map', 'index.html')) {
    const mainHeadings = [...html.matchAll(/<h1\b/g)].length
    if (mainHeadings !== 1) errors.push(`research/map/index.html: 应有且仅有一个 h1，当前为 ${mainHeadings}`)
  }

  if (relative === path.join('courses', 'data-structures-robotics', 'index.html')) {
    if (!html.includes('data-course-resources-state="empty"')) {
      errors.push('courses/data-structures-robotics/index.html: 缺少课程资料空状态')
    }
    if (html.includes('github.com/YichengDong0219/njura-resources')) {
      errors.push('courses/data-structures-robotics/index.html: 不应出现未开放的资料仓库链接')
    }
    for (const match of html.matchAll(/\b(?:href|src)=(['"])(.*?)\1/g)) {
      if (/\.(?:pdf|pptx?|docx?)(?:$|[?#])/i.test(match[2])) {
        errors.push(`courses/data-structures-robotics/index.html: 不应出现课程文件链接 ${match[2]}`)
      }
    }
  }

  if (!/<link rel="canonical" href="[^"]+">/.test(html)) {
    errors.push(`${relative}: 缺少 canonical`)
  }
  if (!/<meta property="og:title" content="[^"]+">/.test(html)) {
    errors.push(`${relative}: 缺少 og:title`)
  }
  if (html.includes('· 南大机器人学生 Wiki · 南大机器人学生 Wiki')) {
    errors.push(`${relative}: 分享标题重复站名`)
  }

  const currentUrl = pageUrl(file)
  for (const match of html.matchAll(/\b(?:href|src)=(['"])(.*?)\1/g)) {
    const value = match[2]
    if (!value || value.startsWith('data:') || value.startsWith('mailto:') || value.startsWith('tel:')) {
      continue
    }

    let targetUrl
    try {
      targetUrl = new URL(value, currentUrl)
    } catch {
      errors.push(`${relative}: 无法解析链接 ${value}`)
      continue
    }

    if (targetUrl.origin !== siteOrigin || !targetUrl.pathname.startsWith(siteBase)) {
      continue
    }

    checkedLinks += 1
    const candidates = candidatesFor(targetUrl)
    if (!candidates.length || !(await Promise.all(candidates.map(exists))).some(Boolean)) {
      errors.push(`${relative}: 站内目标不存在 ${targetUrl.pathname}`)
    }
  }
}

const sitemap = await readFile(path.join(outputDir, 'sitemap.xml'), 'utf8')
if (sitemap.includes('404.html')) {
  errors.push('sitemap.xml: 不应收录 404.html')
}

const searchIndexFiles = files.filter((file) => path.basename(file).startsWith('@localSearchIndex'))
if (!searchIndexFiles.length) {
  errors.push('本地搜索索引缺失')
} else {
  const searchIndexSource = (await Promise.all(searchIndexFiles.map((file) => readFile(file, 'utf8')))).join('\n')
  for (const term of ['陈春林', '汪秒', '数据结构与算法设计（机器人）', '自然行为学习机器狗', '学习与具身智能']) {
    if (!searchIndexSource.includes(term)) errors.push(`本地搜索索引缺少“${term}”`)
  }
}

if (errors.length) {
  console.error(`构建产物校验失败（${errors.length} 项）：`)
  for (const error of errors) console.error(`- ${error}`)
  process.exit(1)
}

console.log(`构建产物校验通过：${htmlFiles.length} 个 HTML 页面，${checkedLinks} 个站内链接/资源引用。`)
