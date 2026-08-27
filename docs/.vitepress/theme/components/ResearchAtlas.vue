<script setup lang="ts">
import { withBase } from 'vitepress'
import content from '../../data/content.json'
import type { ContentDatabase, ResearchDomainId } from '../../data/contracts'
import ResearchCanvas from './ResearchCanvas.vue'

defineProps<{ compact?: boolean }>()
const data = content as ContentDatabase

function facultyCount(domainId: ResearchDomainId) {
  return data.faculty.filter((person) => person.domainIds.includes(domainId)).length
}
</script>

<template>
  <section :class="['research-atlas', { 'research-atlas--compact': compact }]" aria-labelledby="research-atlas-title">
    <header class="atlas-header">
      <div>
        <p class="section-kicker">RESEARCH ATLAS · 研究图谱</p>
        <h2 id="research-atlas-title">从方向出发，找到人与路径</h2>
      </div>
      <p>
        以学院公开科研布局为底图，将 25 个教师档案与 4 位专职科研人员的研究兴趣整理为六个等权入口。
        聚类是学生 Wiki 的编辑性导航，不代表学院官方分类、规模或排名。
      </p>
    </header>

    <div class="official-domain-strip" aria-label="学院公开研究域">
      <a
        v-for="domain in data.officialDomains"
        :key="domain.name"
        :href="domain.source"
        target="_blank"
        rel="noreferrer"
      >
        <strong>{{ domain.name }}</strong>
        <small>{{ domain.english }}</small>
      </a>
    </div>

    <div class="research-card-grid">
      <article v-for="domain in data.editorialDomains" :key="domain.id" class="research-card">
        <ResearchCanvas :kind="domain.animation" :label="domain.label" />
        <div class="research-card__body">
          <div class="research-card__eyebrow">{{ facultyCount(domain.id) }} 位相关人员 · 编辑性整理</div>
          <h3>{{ domain.label }}</h3>
          <p class="research-card__english">{{ domain.english }}</p>
          <p>{{ domain.summary }}</p>
          <ul class="tag-list" aria-label="二级标签">
            <li v-for="tag in domain.tags.slice(0, compact ? 3 : 6)" :key="tag">{{ tag }}</li>
          </ul>
          <a class="stretched-link" :href="withBase(`/research/directions/${domain.id}/`)" :aria-label="`查看${domain.label}方向`">
            查看方向与人员 <span aria-hidden="true">↗</span>
          </a>
        </div>
      </article>
    </div>

    <footer v-if="compact" class="atlas-footer">
      <a class="atlas-primary-link" :href="withBase('/research/map/')">打开完整研究图谱 <span aria-hidden="true">→</span></a>
      <span>最后核验：2026-08-27</span>
    </footer>
  </section>
</template>
