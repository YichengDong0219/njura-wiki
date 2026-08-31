<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { withBase } from 'vitepress'
import content from '../../data/content.json'
import type {
  ContentDatabase,
  ResearchDomainId,
  ResearchLoopStageId
} from '../../data/contracts'

const props = withDefaults(defineProps<{
  compact?: boolean
  initialDomainId?: ResearchDomainId
}>(), {
  compact: false,
  initialDomainId: 'embodied'
})

const data = content as ContentDatabase
const domains = [...data.editorialDomains].sort((a, b) => a.atlas.order - b.atlas.order)
const activeId = ref<ResearchDomainId>(props.initialDomainId)

const stageLabels: Record<ResearchLoopStageId, string> = {
  perception: '感知',
  planning: '规划',
  control: '控制',
  execution: '执行',
  feedback: '状态反馈'
}

const activeDomain = computed(() => domains.find((domain) => domain.id === activeId.value) ?? domains[0])
const activePeople = computed(() => data.faculty.filter((person) => person.domainIds.includes(activeId.value)))
const activeStageText = computed(() => activeDomain.value.atlas.stageIds.map((id) => stageLabels[id]).join('、'))

function selectDomain(domainId: ResearchDomainId, updateUrl = false) {
  activeId.value = domainId
  if (updateUrl && !props.compact && typeof window !== 'undefined') {
    const url = new URL(window.location.href)
    url.searchParams.set('direction', domainId)
    window.history.replaceState(window.history.state, '', url)
  }
}

onMounted(() => {
  const direction = new URLSearchParams(window.location.search).get('direction')
  if (direction && domains.some((domain) => domain.id === direction)) {
    selectDomain(direction as ResearchDomainId)
  }
})
</script>

<template>
  <section :class="['research-atlas', { 'research-atlas--compact': compact }]" aria-labelledby="research-atlas-title">
    <header class="atlas-header">
      <div>
        <p class="section-kicker">研究方向</p>
        <component :is="compact ? 'h2' : 'h1'" id="research-atlas-title">
          <span class="atlas-header__title-line">从研究问题出发，</span>
          <span class="atlas-header__title-line">再去找老师</span>
        </component>
      </div>
      <p>
        学院公开了四个研究域；本站根据 29 位人员的官网方向，把它们整理成六个便于浏览的入口。
        选中一个方向，可以看到它在“感知—规划—控制—执行—反馈”中的位置。
      </p>
    </header>

    <div v-if="!compact" class="official-domain-strip" aria-label="学院公开研究域">
      <span>学院公开研究域</span>
      <a
        v-for="domain in data.officialDomains"
        :key="domain.name"
        :href="domain.source"
        target="_blank"
        rel="noreferrer"
      >
        {{ domain.name }}
      </a>
    </div>

    <div class="atlas-explorer">
      <div class="research-loop" aria-label="六类研究方向与机器人反馈环">
        <div class="research-loop__track" aria-hidden="true" />
        <div class="research-loop__signal research-loop__signal--one" aria-hidden="true"><i /></div>
        <div class="research-loop__signal research-loop__signal--two" aria-hidden="true"><i /></div>

        <i
          v-for="domain in domains"
          :key="`beam-${domain.id}`"
          :class="[
            'research-loop__beam',
            `research-loop__beam--${domain.id}`,
            { 'is-active': domain.id === activeId }
          ]"
          aria-hidden="true"
        />

        <div class="research-loop__core" aria-hidden="true">
          <span>感知</span>
          <i>→</i>
          <span>规划</span>
          <i>↓</i>
          <span>控制</span>
          <i>←</i>
          <span>执行</span>
          <small>状态反馈</small>
        </div>

        <button
          v-for="domain in domains"
          :key="domain.id"
          type="button"
          :class="[
            'research-domain-node',
            `research-domain-node--${domain.id}`,
            `research-domain-node--icon-${domain.atlas.icon}`,
            { 'is-active': domain.id === activeId }
          ]"
          :aria-pressed="domain.id === activeId"
          :aria-label="`选择${domain.label}；关联${domain.atlas.stageIds.map((id) => stageLabels[id]).join('、')}`"
          @click="selectDomain(domain.id, true)"
          @focus="selectDomain(domain.id)"
          @pointerenter="selectDomain(domain.id)"
        >
          <span class="research-domain-node__icon" aria-hidden="true"><i /><i /></span>
          <span>
            <small>0{{ domain.atlas.order }}</small>
            <strong>{{ domain.shortLabel }}</strong>
          </span>
        </button>
      </div>

      <article class="atlas-detail" aria-labelledby="atlas-active-domain-title">
        <div class="atlas-detail__meta">
          <span>0{{ activeDomain.atlas.order }} / 06</span>
          <span>{{ activePeople.length }} 位相关人员</span>
        </div>
        <h3 id="atlas-active-domain-title">{{ activeDomain.label }}</h3>
        <p class="atlas-detail__english">{{ activeDomain.english }}</p>
        <p class="atlas-detail__summary">{{ activeDomain.summary }}</p>

        <div class="atlas-detail__stages">
          <span>关联环节</span>
          <strong>{{ activeStageText }}</strong>
        </div>

        <ul class="tag-list" aria-label="方向关键词">
          <li v-for="tag in activeDomain.tags.slice(0, compact ? 3 : 6)" :key="tag">{{ tag }}</li>
        </ul>

        <div class="atlas-detail__people">
          <span>相关人员</span>
          <div>
            <a
              v-for="person in activePeople.slice(0, compact ? 4 : 6)"
              :key="person.id"
              :href="withBase(`/faculty/${person.id}/`)"
            >{{ person.name }}</a>
            <span v-if="activePeople.length > (compact ? 4 : 6)">等 {{ activePeople.length }} 人</span>
          </div>
        </div>

        <a class="atlas-primary-link" :href="withBase(`/research/directions/${activeDomain.id}/`)">
          查看方向详情与全部人员 <span class="action-icon" aria-hidden="true">→</span>
        </a>
      </article>
    </div>

    <footer v-if="compact" class="atlas-footer">
      <p>四个上位研究域来自学院简介；六类方向是学生 Wiki 的编辑性整理。</p>
      <a class="atlas-primary-link" :href="withBase(`/research/map/?direction=${activeDomain.id}`)">
        打开完整研究图谱 <span class="action-icon" aria-hidden="true">→</span>
      </a>
    </footer>
  </section>
</template>
