import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import { defineAsyncComponent } from 'vue'
import Layout from './Layout.vue'
import './styles.css'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component('CourseDetail', defineAsyncComponent(() => import('./components/CourseDetail.vue')))
    app.component('CourseIndex', defineAsyncComponent(() => import('./components/CourseIndex.vue')))
    app.component('DomainDetail', defineAsyncComponent(() => import('./components/DomainDetail.vue')))
    app.component('FacultyDirectory', defineAsyncComponent(() => import('./components/FacultyDirectory.vue')))
    app.component('FacultyProfile', defineAsyncComponent(() => import('./components/FacultyProfile.vue')))
    app.component('HomeCoverage', defineAsyncComponent(() => import('./components/HomeCoverage.vue')))
    app.component('HomePortal', defineAsyncComponent(() => import('./components/HomePortal.vue')))
    app.component('ProjectList', defineAsyncComponent(() => import('./components/ProjectList.vue')))
    app.component('ResearchAtlas', defineAsyncComponent(() => import('./components/ResearchAtlas.vue')))
    app.component('ResearchPreview', defineAsyncComponent(() => import('./components/ResearchPreview.vue')))
  }
} satisfies Theme
