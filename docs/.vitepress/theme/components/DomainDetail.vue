<script setup lang="ts">
import { computed } from 'vue'
import { withBase } from 'vitepress'
import content from '../../data/content.json'
import type { ContentDatabase, ResearchLoopStageId } from '../../data/contracts'

const props = defineProps<{ domainId: string }>()
const data = content as ContentDatabase
const domain = computed(() => data.editorialDomains.find((item) => item.id === props.domainId))
const people = computed(() => {
  const domainId = domain.value?.id
  return domainId ? data.faculty.filter((person) => person.domainIds.includes(domainId)) : []
})

const stageLabels: Record<ResearchLoopStageId, string> = {
  perception: '感知',
  planning: '规划',
  control: '控制',
  execution: '执行',
  feedback: '状态反馈'
}
const stageIds = Object.keys(stageLabels) as ResearchLoopStageId[]
</script>

<template>
  <article v-if="domain" class="domain-detail">
    <nav class="profile-breadcrumb" aria-label="面包屑">
      <a :href="withBase('/research/map/')">研究图谱</a><span aria-hidden="true">/</span><span>{{ domain.label }}</span>
    </nav>
    <header class="domain-detail__header">
      <div>
        <p class="section-kicker">研究方向 · 编辑性整理</p>
        <h1>{{ domain.label }}</h1>
        <p class="domain-detail__english">{{ domain.english }}</p>
        <p>{{ domain.summary }}</p>
      </div>
      <div class="domain-stage-map" :aria-label="`${domain.label}关联的机器人反馈环环节`">
        <div class="domain-stage-map__loop" aria-hidden="true"><i /><i /></div>
        <p>在反馈环中的主要位置</p>
        <ul>
          <li
            v-for="stageId in stageIds"
            :key="stageId"
            :class="{ 'is-active': domain.atlas.stageIds.includes(stageId) }"
          >
            <span aria-hidden="true" />{{ stageLabels[stageId] }}
          </li>
        </ul>
      </div>
    </header>

    <div class="source-note">
      本页是学生 Wiki 对公开研究兴趣的编辑性聚类，不是学院正式学科目录，也不表示方向规模或人员主次。最后核验：2026-08-27。
    </div>

    <section>
      <h2>包含的二级标签</h2>
      <ul class="tag-list tag-list--large">
        <li v-for="tag in domain.tags" :key="tag">{{ tag }}</li>
      </ul>
    </section>

    <section>
      <h2>相关人员</h2>
      <div class="people-link-grid">
        <a v-for="person in people" :key="person.id" :href="withBase(`/faculty/${person.id}/`)">
          <strong>{{ person.name }}</strong>
          <span>{{ person.title }}</span>
          <small>{{ person.officialDirections.slice(0, 3).join(' · ') }}</small>
        </a>
      </div>
    </section>

    <section>
      <h2>如何从这里继续</h2>
      <ol>
        <li>先从上方人员档案进入学院官网，核对导师当前研究兴趣与招生信息。</li>
        <li>选择一个二级标签，阅读 1 篇综述和 2–3 篇近年代表论文，记录问题、方法与实验设置。</li>
        <li>准备一页自我介绍和一页阅读笔记，再参考<a :href="withBase('/research/contacting-supervisors/')">联系导师指南</a>。</li>
      </ol>
    </section>
  </article>
</template>
