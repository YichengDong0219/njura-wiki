import { defineConfig } from 'vitepress'
import content from './data/content.json'
import courseOutlines from './data/course-outlines.json'
import type { ContentDatabase, CourseOutline } from './data/contracts'

const siteUrl = 'https://yichengdong0219.github.io/njura-wiki/'
const database = content as ContentDatabase
const outlines = courseOutlines as CourseOutline[]

interface SearchSection {
  anchor: string
  titles: string[]
  text: string
}

function defaultSearchSections(html: string): SearchSection[] {
  const headingRegex = /<h(\d*).*?>(.*?<a.*? href="#.*?".*?>.*?<\/a>)<\/h\1>/gi
  const headingContentRegex = /(.*?)<a.*? href="#(.*?)".*?>.*?<\/a>/i
  const chunks = html.split(headingRegex)
  chunks.shift()
  const sections: SearchSection[] = []
  let parentTitles: string[] = []

  for (let index = 0; index < chunks.length; index += 3) {
    const level = Number.parseInt(chunks[index]) - 1
    const heading = chunks[index + 1]
    const headingResult = headingContentRegex.exec(heading)
    const title = (headingResult?.[1] ?? '').replace(/<[^>]*>/g, '').trim()
    const anchor = headingResult?.[2] ?? ''
    const sectionHtml = chunks[index + 2]
    if (!title || !sectionHtml) continue

    let titles = parentTitles.slice(0, level)
    titles[level] = title
    titles = titles.filter(Boolean)
    sections.push({
      anchor,
      titles,
      text: sectionHtml.replace(/<[^>]*>/g, '')
    })

    if (level === 0) parentTitles = [title]
    else parentTitles[level] = title
  }

  return sections
}

function syntheticSearchSections(file: string): SearchSection[] {
  const normalized = file.replaceAll('\\', '/')
  const relative = normalized.includes('/docs/') ? normalized.split('/docs/').at(-1)! : normalized

  const facultyMatch = relative.match(/^faculty\/([^/]+)\/index\.md$/)
  if (facultyMatch) {
    const person = database.faculty.find((item) => item.id === facultyMatch[1])
    if (!person) return []
    const domains = person.domainIds
      .map((id) => database.editorialDomains.find((domain) => domain.id === id)?.label)
      .filter(Boolean)
    return [{
      anchor: '',
      titles: [person.name],
      text: [person.title, ...person.officialDirections, ...domains].join(' ')
    }]
  }

  const courseMatch = relative.match(/^courses\/([^/]+)\/index\.md$/)
  if (courseMatch && courseMatch[1] !== 'template') {
    const course = database.courses.find((item) => item.id === courseMatch[1])
    const outline = outlines.find((item) => item.courseId === courseMatch[1])
    if (!course) return []
    const chapterText = outline?.stages
      .flatMap((stage) => stage.chapters.flatMap((chapter) => [chapter.title, chapter.summary, ...chapter.topics]))
      .join(' ') ?? ''
    return [{
      anchor: '',
      titles: [course.name],
      text: [course.courseCode, course.term, ...course.instructors, course.assessment, chapterText].join(' ')
    }]
  }

  const directionMatch = relative.match(/^research\/directions\/([^/]+)\/index\.md$/)
  if (directionMatch) {
    const domain = database.editorialDomains.find((item) => item.id === directionMatch[1])
    if (!domain) return []
    const people = database.faculty
      .filter((person) => person.domainIds.includes(domain.id))
      .map((person) => person.name)
    return [{
      anchor: '',
      titles: [domain.label],
      text: [domain.english, domain.summary, ...domain.tags, ...people].join(' ')
    }]
  }

  if (relative === 'research/map/index.md') {
    return [{
      anchor: '',
      titles: ['研究图谱'],
      text: database.editorialDomains.flatMap((domain) => [domain.label, domain.english, domain.summary, ...domain.tags]).join(' ')
    }]
  }

  if (relative === 'courses/index.md') {
    return database.courses
      .filter((course) => !course.detailPath)
      .map((course) => ({
        anchor: `course-${course.id}`,
        titles: [course.name],
        text: [course.courseCode, course.term, ...course.instructors, course.assessment].join(' ')
      }))
  }

  if (relative === 'projects/student/index.md' || relative === 'projects/research/index.md') {
    const kind = relative.includes('/student/') ? 'student_practice' : 'research_project'
    return database.projects
      .filter((project) => project.kind === kind)
      .map((project) => ({
        anchor: `project-${project.id}`,
        titles: [project.title],
        text: [project.status, project.summary, project.participation, project.lead, ...project.team].join(' ')
      }))
  }

  if (relative === 'index.md') {
    return [{
      anchor: '',
      titles: ['南大机器人学生 Wiki'],
      text: '查课程 按方向找老师 项目与竞赛 科研入门 学习经验 参与共建'
    }]
  }

  return []
}

export default defineConfig({
  lang: 'zh-CN',
  title: '南大机器人学生 Wiki',
  titleTemplate: ':title · 南大机器人学生 Wiki',
  description: '南京大学机器人与自动化学院学生共同维护的非官方知识站',
  base: '/njura-wiki/',
  lastUpdated: true,
  appearance: true,
  sitemap: {
    hostname: siteUrl,
    transformItems: (items) => items.filter((item) => !item.url.endsWith('404.html'))
  },
  vite: {
    server: {
      host: '127.0.0.1',
      cors: { origin: /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/ }
    }
  },
  transformHead({ page, title, description }) {
    const route = page === 'index.md'
      ? ''
      : page.endsWith('/index.md')
        ? page.slice(0, -'index.md'.length)
        : page.replace(/\.md$/, '.html')
    const url = new URL(route, siteUrl).href
    const shareTitle = title
    return [
      ['link', { rel: 'canonical', href: url }],
      ['meta', { property: 'og:title', content: shareTitle }],
      ['meta', { property: 'og:description', content: description }],
      ['meta', { property: 'og:url', content: url }],
      ['meta', { name: 'twitter:title', content: shareTitle }],
      ['meta', { name: 'twitter:description', content: description }]
    ]
  },
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/njura-wiki/mark.svg' }],
    ['meta', { name: 'theme-color', content: '#101226' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:locale', content: 'zh_CN' }],
    ['meta', { property: 'og:site_name', content: '南大机器人学生 Wiki' }],
    ['meta', { property: 'og:image', content: `${siteUrl}og.png` }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:image', content: `${siteUrl}og.png` }]
  ],
  themeConfig: {
    logo: '/mark.svg',
    siteTitle: 'NJURA Wiki',
    search: {
      provider: 'local',
      options: {
        miniSearch: {
          _splitIntoSections(file, html) {
            return [...defaultSearchSections(html), ...syntheticSearchSections(file)]
          }
        },
        translations: {
          button: { buttonText: '搜索', buttonAriaLabel: '搜索本站' },
          modal: {
            noResultsText: '没有找到相关内容',
            resetButtonTitle: '清除查询条件',
            footer: { selectText: '选择', navigateText: '切换', closeText: '关闭' }
          }
        }
      }
    },
    nav: [
      { text: '课程', link: '/courses/' },
      {
        text: '教师与方向',
        items: [
          { text: '按方向浏览', link: '/research/map/' },
          { text: '按姓名浏览', link: '/faculty/' }
        ]
      },
      { text: '项目与竞赛', link: '/projects/' },
      { text: '科研入门', link: '/research/' },
      { text: '学习经验', link: '/learning/' },
      {
        text: '共建',
        items: [
          { text: '参与共建', link: '/contribute/' },
          { text: '资料入口', link: '/resources/' },
          { text: '整理方法', link: '/about/methodology/' },
          { text: '免责声明', link: '/about/disclaimer/' }
        ]
      }
    ],
    sidebar: {
      '/projects/': [
        { text: '项目介绍', items: [
          { text: '栏目说明', link: '/projects/' },
          { text: '学生实践项目', link: '/projects/student/' },
          { text: '学院科研项目', link: '/projects/research/' }
        ] }
      ],
      '/courses/': [
        { text: '课程介绍', items: [
          { text: '课程索引', link: '/courses/' },
          { text: '数据结构与算法设计', link: '/courses/data-structures-robotics/' },
          { text: '课程投稿模板', link: '/courses/template/' }
        ] }
      ],
      '/faculty/': [
        { text: '师资百科', items: [
          { text: '人员索引', link: '/faculty/' },
          { text: '研究图谱', link: '/research/map/' },
          { text: '整理方法', link: '/about/methodology/' }
        ] }
      ],
      '/research/': [
        { text: '科研指南', items: [
          { text: '科研入门', link: '/research/' },
          { text: '研究图谱', link: '/research/map/' },
          { text: '论文阅读', link: '/research/reading-papers/' },
          { text: '联系导师', link: '/research/contacting-supervisors/' },
          { text: '进入实验室', link: '/research/joining-a-lab/' }
        ] },
        { text: '六类方向', items: [
          { text: '学习与具身智能', link: '/research/directions/embodied/' },
          { text: '自主机器人', link: '/research/directions/autonomy/' },
          { text: '控制与安全', link: '/research/directions/safety/' },
          { text: '优化与预测', link: '/research/directions/optimization/' },
          { text: '工业与能源', link: '/research/directions/industry/' },
          { text: '机电与装备', link: '/research/directions/equipment/' }
        ] }
      ],
      '/learning/': [
        { text: '学法分享', items: [
          { text: '栏目说明', link: '/learning/' },
          { text: '培养与学习路径', link: '/learning/roadmap/' },
          { text: '工具链', link: '/learning/toolkit/' },
          { text: '经验投稿模板', link: '/learning/template/' }
        ] }
      ],
      '/resources/': [
        { text: '资料入口', items: [
          { text: '入口说明', link: '/resources/' },
          { text: '贡献规范', link: '/contribute/' }
        ] }
      ],
      '/about/': [
        { text: '关于本站', items: [
          { text: '整理方法', link: '/about/methodology/' },
          { text: '免责声明', link: '/about/disclaimer/' }
        ] }
      ]
    },
    outline: { label: '本页目录', level: [2, 3] },
    docFooter: { prev: '上一页', next: '下一页' },
    notFound: {
      title: '页面未找到',
      quote: '这条路径尚未收录，或页面已经移动。',
      linkLabel: '返回首页',
      linkText: '返回首页'
    },
    lastUpdated: { text: '最后更新' },
    darkModeSwitchLabel: '外观',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
    skipToContentLabel: '跳到正文',
    sidebarMenuLabel: '目录',
    returnToTopLabel: '返回顶部',
    externalLinkIcon: true,
    editLink: {
      pattern: 'https://github.com/YichengDong0219/njura-wiki/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页'
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/YichengDong0219/njura-wiki' }
    ],
    footer: {
      message: '非官方学生 Wiki · 内容仅供参考，请以学院通知为准',
      copyright: '代码 MIT · 原创文本 CC BY-SA 4.0'
    }
  }
})
