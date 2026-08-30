export type CourseResourceType = 'slides' | 'notes' | 'exam' | 'document'

export interface CourseResource {
  id: string
  courseId: string
  title: string
  type: CourseResourceType
  term?: string
  updatedAt: string
}

export interface CourseResourceProvider {
  readonly mode: 'empty' | 'remote'
  list(courseId: string): Promise<readonly CourseResource[]>
  get(courseId: string, resourceId: string): Promise<CourseResource | null>
  getBrowseUrl(courseId: string, resourceId: string): string | null
  getSubmitUrl(courseId: string): string | null
  getEditUrl(courseId: string, resourceId: string): string | null
}

export const emptyCourseResourceProvider = {
  mode: 'empty',
  async list() {
    return []
  },
  async get() {
    return null
  },
  getBrowseUrl() {
    return null
  },
  getSubmitUrl() {
    return null
  },
  getEditUrl() {
    return null
  }
} satisfies CourseResourceProvider

// 后续只需在这里替换 provider；课程数据和页面组件无需知道资料存放在哪里。
export const courseResourceProvider: CourseResourceProvider = emptyCourseResourceProvider
