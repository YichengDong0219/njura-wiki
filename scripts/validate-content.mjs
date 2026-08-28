import { readFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const dataPath = join(projectRoot, 'docs/.vitepress/data/content.json')
const data = JSON.parse(readFileSync(dataPath, 'utf8'))
const courseOutlinesPath = join(projectRoot, 'docs/.vitepress/data/course-outlines.json')
const courseOutlines = JSON.parse(readFileSync(courseOutlinesPath, 'utf8'))
const errors = []
const resourceRepositoryUrl = 'https://github.com/YichengDong0219/njura-resources'
const forbiddenResourceExtension = /\.(?:pdf|pptx?|docx?)(?:$|[?#])/i

function assert(condition, message) {
  if (!condition) errors.push(message)
}

function isHttpsUrl(value) {
  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}

function isIsoDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`))
}

function assertUnique(records, label) {
  const ids = records.map((record) => record.id)
  assert(new Set(ids).size === ids.length, `${label} id 必须唯一`)
}

const domainIds = new Set(data.editorialDomains.map((domain) => domain.id))
assert(data.officialDomains.length === 4, '学院公开研究域必须为 4 个')
assert(data.editorialDomains.length === 6, '编辑性研究方向必须为 6 个')
assertUnique(data.editorialDomains, '研究方向')
assertUnique(data.faculty, '人员')
assertUnique(data.courses, '课程')
assertUnique(data.projects, '项目')
assertUnique(courseOutlines.map((outline) => ({ ...outline, id: outline.courseId })), '课程大纲')

const teachers = data.faculty.filter((person) => person.role === 'faculty')
const researchStaff = data.faculty.filter((person) => person.role === 'research_staff')
const partTime = data.faculty.filter((person) => person.isPartTime)
assert(data.faculty.length === 29, `人员总数应为 29，当前为 ${data.faculty.length}`)
assert(teachers.length === 25, `教师档案应为 25，当前为 ${teachers.length}`)
assert(researchStaff.length === 4, `专职科研人员应为 4，当前为 ${researchStaff.length}`)
assert(partTime.length === 2, `兼职标记应为 2，当前为 ${partTime.length}`)
assert(partTime.map((person) => person.name).sort().join(',') === ['周东华', '鲁为民'].sort().join(','), '兼职标记必须对应周东华与鲁为民')

for (const domain of data.officialDomains) {
  assert(domain.name && domain.english, '学院公开研究域必须有中英文名称')
  assert(isHttpsUrl(domain.source), `${domain.name} 的来源必须为 HTTPS URL`)
}

for (const domain of data.editorialDomains) {
  assert(domain.label && domain.english && domain.summary, `${domain.id} 方向字段不完整`)
  assert(Array.isArray(domain.tags) && domain.tags.length >= 4, `${domain.label} 至少需要 4 个二级标签`)
  assert(['loop', 'path', 'barrier', 'horizon', 'health', 'joint'].includes(domain.animation), `${domain.label} 动画类型无效`)
  const directionPage = join(projectRoot, `docs/research/directions/${domain.id}/index.md`)
  assert(existsSync(directionPage), `${domain.label} 缺少方向详情页`)
  assert(data.faculty.some((person) => person.domainIds.includes(domain.id)), `${domain.label} 没有关联人员`)
}

for (const person of data.faculty) {
  assert(person.id && person.name && person.title, `人员记录字段不完整：${person.id || person.name}`)
  assert(Array.isArray(person.officialDirections) && person.officialDirections.length > 0, `${person.name} 缺少官网方向`)
  assert(Array.isArray(person.domainIds) && person.domainIds.length > 0, `${person.name} 缺少研究域引用`)
  person.domainIds.forEach((domainId) => assert(domainIds.has(domainId), `${person.name} 引用了未知研究域 ${domainId}`))
  assert(Array.isArray(person.links) && person.links.some((link) => link.kind === 'official'), `${person.name} 缺少学院官网链接`)
  person.links.forEach((link) => assert(isHttpsUrl(link.url), `${person.name} 的 ${link.label} 不是 HTTPS URL`))
  assert(isIsoDate(person.lastVerified), `${person.name} 的核验日期无效`)
  assert(existsSync(join(projectRoot, `docs/faculty/${person.id}/index.md`)), `${person.name} 缺少人员详情页`)
}

for (const course of data.courses) {
  assert(course.courseCode && course.name && course.term, `课程字段不完整：${course.id}`)
  assert(Array.isArray(course.instructors) && course.instructors.length > 0, `${course.name} 缺少教师`)
  assert(isHttpsUrl(course.officialSource), `${course.name} 缺少有效官方来源`)
  assert(Array.isArray(course.resourceLinks), `${course.name} 的资料链接必须为数组`)
  for (const link of course.resourceLinks ?? []) {
    assert(link.label && isHttpsUrl(link.url), `${course.name} 包含无效资料链接`)
    assert(!forbiddenResourceExtension.test(link.url), `${course.name} 不得直接链接课程文件：${link.url}`)
  }
  if (course.detailPath) {
    const detailDirectory = course.detailPath.replace(/^\/+|\/+$/g, '')
    assert(course.detailPath.startsWith('/courses/') && course.detailPath.endsWith('/'), `${course.name} 的详情路径无效`)
    assert(course.detailPath === `/courses/${course.id}/`, `${course.name} 的课程 ID 必须与详情路由一致`)
    assert(existsSync(join(projectRoot, 'docs', detailDirectory, 'index.md')), `${course.name} 缺少课程详情页`)
    assert(course.resourceLinks.length === 1, `${course.name} 必须且只能配置一个资料库入口`)
    assert(course.resourceLinks[0]?.url === resourceRepositoryUrl, `${course.name} 的资料入口必须指向指定仓库`)
    assert(courseOutlines.some((outline) => outline.courseId === course.id), `${course.name} 缺少课程知识地图`)
  }
  assert(['暂无投稿', '已有投稿'].includes(course.experienceStatus), `${course.name} 的经验状态无效`)
  assert(isIsoDate(course.lastVerified), `${course.name} 的核验日期无效`)
}

for (const outline of courseOutlines) {
  const course = data.courses.find((item) => item.id === outline.courseId)
  const stages = Array.isArray(outline.stages) ? outline.stages : []
  assert(Boolean(course), `课程知识地图引用了未知课程：${outline.courseId}`)
  assert(Array.isArray(outline.learningLenses) && outline.learningLenses.length === 4, `${outline.courseId} 必须包含四个学习视角`)
  assert(stages.length === 3, `${outline.courseId} 必须包含三个学习阶段`)
  assert(stages.map((stage) => stage.id).join(',') === 'foundations,nonlinear,search-and-sort', `${outline.courseId} 的学习阶段顺序无效`)
  for (const stage of stages) {
    assert(stage.index && stage.title && stage.english && stage.summary, `${outline.courseId} 的 ${stage.id} 阶段字段不完整`)
  }
  const chapters = stages.flatMap((stage) => stage.chapters ?? [])
  const chapterNumbers = chapters.map((chapter) => chapter.number)
  assert(new Set(chapterNumbers).size === chapterNumbers.length, `${outline.courseId} 的章节号必须唯一`)
  assert(chapterNumbers.join(',') === '1,2,3,4,5,6,7,9,10', `${outline.courseId} 的章节顺序必须为 1–7、9、10`)
  for (const chapter of chapters) {
    assert(chapter.title && chapter.summary && Array.isArray(chapter.topics) && chapter.topics.length > 0, `${outline.courseId} 的第 ${chapter.number} 章字段不完整`)
  }
  const chapterSix = chapters.find((chapter) => chapter.number === '6')
  assert(chapterSix?.sections?.length === 3, `${outline.courseId} 的第 6 章必须包含三个子阶段`)
  assert(chapterSix?.sections?.every((section) => section.label && section.summary), `${outline.courseId} 的第 6 章子阶段字段不完整`)
  assert(outline.missingChapters?.length === 1 && outline.missingChapters[0]?.number === '8', `${outline.courseId} 必须明确标注第 8 章缺失`)
  assert(isIsoDate(outline.lastVerified), `${outline.courseId} 的知识地图核验日期无效`)
  assert(!forbiddenResourceExtension.test(JSON.stringify(outline)), `${outline.courseId} 的知识地图不得包含课程文件路径`)
}

assert(data.projects.some((project) => project.kind === 'student_practice'), '至少需要一个学生实践项目')
assert(data.projects.some((project) => project.kind === 'research_project'), '至少需要一个学院科研项目')
for (const project of data.projects) {
  assert(project.title && project.status && project.participation && project.lead, `项目字段不完整：${project.id}`)
  assert(isHttpsUrl(project.source), `${project.title} 缺少有效来源`)
  if (project.paperUrl) assert(isHttpsUrl(project.paperUrl), `${project.title} 的论文链接无效`)
  assert(isIsoDate(project.date) && isIsoDate(project.lastVerified), `${project.title} 的日期无效`)
}

const config = readFileSync(join(projectRoot, 'docs/.vitepress/config.mts'), 'utf8')
assert(config.includes("base: '/njura-wiki/'"), 'VitePress base 必须为 /njura-wiki/')
assert(config.includes('yichengdong0219.github.io/njura-wiki'), '站点 URL 配置缺失')

if (errors.length) {
  console.error(`内容校验失败（${errors.length} 项）：`)
  errors.forEach((error) => console.error(`- ${error}`))
  process.exit(1)
}

console.log(`内容校验通过：${teachers.length} 个教师档案、${researchStaff.length} 位专职科研人员、${data.editorialDomains.length} 类方向、${data.courses.length} 门课程、${courseOutlines.length} 份课程知识地图、${data.projects.length} 个项目。`)
