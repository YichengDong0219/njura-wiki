<script setup lang="ts">
import { computed } from 'vue'
import { withBase } from 'vitepress'
import content from '../../data/content.json'
import type { ContentDatabase, SourceLink } from '../../data/contracts'

const props = defineProps<{ facultyId: string }>()
const data = content as ContentDatabase
const person = computed(() => data.faculty.find((item) => item.id === props.facultyId))

function domainInfo(domainId: string) {
  return data.editorialDomains.find((domain) => domain.id === domainId)
}

const sourceKindLabels: Record<SourceLink['kind'], string> = {
  official: '学院官网',
  personal: '个人主页',
  dblp: 'DBLP',
  scholar: '学术档案',
  paper: '论文'
}
</script>

<template>
  <article v-if="person" class="faculty-profile">
    <nav class="profile-breadcrumb" aria-label="面包屑">
      <a :href="withBase('/faculty/')">师资百科</a><span aria-hidden="true">/</span><span>{{ person.name }}</span>
    </nav>
    <header class="profile-header">
      <div>
        <p class="section-kicker">{{ person.role === 'faculty' ? '教师档案' : '专职科研人员档案' }}</p>
        <h1>{{ person.name }}</h1>
        <p>{{ person.title }}</p>
      </div>
      <span v-if="person.isPartTime" class="status-badge status-badge--large">官网明确标注兼职</span>
    </header>

    <div class="source-note">
      以下方向为学院官网公开表述的压缩转述；Wiki 方向标签仅用于导航。最后核验：{{ person.lastVerified }}。
    </div>

    <section>
      <h2>官网研究方向</h2>
      <ul class="profile-direction-list">
        <li v-for="direction in person.officialDirections" :key="direction">{{ direction }}</li>
      </ul>
    </section>

    <section>
      <h2>学生 Wiki 导航标签</h2>
      <div class="profile-domains">
        <a v-for="domainId in person.domainIds" :key="domainId" :href="withBase(`/research/directions/${domainId}/`)">
          <strong>{{ domainInfo(domainId)?.label }}</strong>
          <small>{{ domainInfo(domainId)?.english }}</small>
        </a>
      </div>
    </section>

    <section>
      <h2>核验来源</h2>
      <ul class="source-link-list">
        <li v-for="link in person.links" :key="link.url">
          <a :href="link.url" target="_blank" rel="noreferrer">{{ link.label }}</a>
          <span>{{ sourceKindLabels[link.kind] }}</span>
        </li>
      </ul>
      <p class="muted-copy">Google Scholar 仅收录教师本人主页明确链接的档案，不抓取引用量，也不以姓名自动匹配。</p>
    </section>
  </article>
  <div v-else class="empty-state">未找到该人员档案。<a :href="withBase('/faculty/')">返回师资百科</a></div>
</template>
