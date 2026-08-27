<script setup lang="ts">
import { computed } from 'vue'
import content from '../../data/content.json'
import type { ContentDatabase } from '../../data/contracts'

const props = defineProps<{ kind: 'student_practice' | 'research_project' }>()
const data = content as ContentDatabase
const projects = computed(() => data.projects.filter((project) => project.kind === props.kind))
</script>

<template>
  <div class="project-list">
    <article v-for="project in projects" :key="project.id" class="project-card">
      <div class="project-card__meta">
        <span>{{ project.status }}</span>
        <time :datetime="project.date">{{ project.date }}</time>
      </div>
      <h2>{{ project.title }}</h2>
      <p>{{ project.summary }}</p>
      <dl>
        <div><dt>负责人 / 团队</dt><dd>{{ project.lead }}</dd></div>
        <div><dt>公开成员</dt><dd>{{ project.team.join('、') }}</dd></div>
        <div><dt>参与条件</dt><dd>{{ project.participation }}</dd></div>
      </dl>
      <div class="project-card__links">
        <a :href="project.source" target="_blank" rel="noreferrer">学院公开来源 ↗</a>
        <a v-if="project.paperUrl" :href="project.paperUrl" target="_blank" rel="noreferrer">论文 DOI ↗</a>
      </div>
      <p class="verified-date">最后核验：{{ project.lastVerified }}</p>
    </article>
  </div>
</template>
