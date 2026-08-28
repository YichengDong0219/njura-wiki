import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import Layout from './Layout.vue'
import CourseDetail from './components/CourseDetail.vue'
import CourseIndex from './components/CourseIndex.vue'
import DomainDetail from './components/DomainDetail.vue'
import FacultyDirectory from './components/FacultyDirectory.vue'
import FacultyProfile from './components/FacultyProfile.vue'
import ProjectList from './components/ProjectList.vue'
import ResearchAtlas from './components/ResearchAtlas.vue'
import ResearchPreview from './components/ResearchPreview.vue'
import './styles.css'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component('CourseDetail', CourseDetail)
    app.component('CourseIndex', CourseIndex)
    app.component('DomainDetail', DomainDetail)
    app.component('FacultyDirectory', FacultyDirectory)
    app.component('FacultyProfile', FacultyProfile)
    app.component('ProjectList', ProjectList)
    app.component('ResearchAtlas', ResearchAtlas)
    app.component('ResearchPreview', ResearchPreview)
  }
} satisfies Theme
