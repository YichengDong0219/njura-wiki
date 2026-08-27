export type ResearchDomainId =
  | 'embodied'
  | 'autonomy'
  | 'safety'
  | 'optimization'
  | 'industry'
  | 'equipment'

export interface SourceLink {
  label: string
  url: string
  kind: 'official' | 'personal' | 'dblp' | 'scholar' | 'paper'
}

export interface FacultyRecord {
  id: string
  name: string
  role: 'faculty' | 'research_staff'
  title: string
  appointmentType: 'not_marked_part_time' | 'part_time' | 'research_staff'
  isPartTime: boolean
  officialDirections: string[]
  domainIds: ResearchDomainId[]
  links: SourceLink[]
  lastVerified: string
}

export interface CourseEntry {
  id: string
  courseCode: string
  name: string
  term: string
  instructors: string[]
  credits: number | null
  assessment: string
  officialSource: string
  resourceLinks: Array<{ label: string; url: string }>
  experienceStatus: '暂无投稿' | '已有投稿'
  lastVerified: string
}

export interface ProjectEntry {
  id: string
  kind: 'student_practice' | 'research_project'
  title: string
  status: '已公开展示' | '已发表'
  summary: string
  participation: string
  lead: string
  team: string[]
  date: string
  source: string
  paperUrl?: string
  lastVerified: string
}

export interface EditorialDomain {
  id: ResearchDomainId
  label: string
  shortLabel: string
  english: string
  summary: string
  tags: string[]
  animation: 'loop' | 'path' | 'barrier' | 'horizon' | 'health' | 'joint'
}

export interface ContentDatabase {
  officialDomains: Array<{ name: string; english: string; source: string }>
  editorialDomains: EditorialDomain[]
  faculty: FacultyRecord[]
  courses: CourseEntry[]
  projects: ProjectEntry[]
}
