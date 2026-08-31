<script setup lang="ts">
import { computed, ref } from 'vue'
import { withBase } from 'vitepress'
import content from '../../data/content.json'
import type { ContentDatabase, FacultyRecord, ResearchDomainId } from '../../data/contracts'

const data = content as ContentDatabase
const query = ref('')
const domain = ref<'all' | ResearchDomainId>('all')

const filtered = computed(() => {
  const needle = query.value.trim().toLocaleLowerCase('zh-CN')
  return data.faculty.filter((person) => {
    const matchesDomain = domain.value === 'all' || person.domainIds.includes(domain.value)
    const searchable = [person.name, person.title, ...person.officialDirections].join(' ').toLocaleLowerCase('zh-CN')
    return matchesDomain && (!needle || searchable.includes(needle))
  })
})

const teachers = computed(() => filtered.value.filter((person) => person.role === 'faculty'))
const researchStaff = computed(() => filtered.value.filter((person) => person.role === 'research_staff'))

function domainLabel(domainId: ResearchDomainId) {
  return data.editorialDomains.find((item) => item.id === domainId)?.shortLabel ?? domainId
}

function profilePath(person: FacultyRecord) {
  return withBase(`/faculty/${person.id}/`)
}
</script>

<template>
  <section class="faculty-directory">
    <div class="directory-controls" aria-label="师资筛选">
      <label>
        <span>搜索姓名或方向</span>
        <input v-model="query" type="search" placeholder="例如：强化学习、鲁棒控制" />
      </label>
      <label>
        <span>研究方向</span>
        <select v-model="domain">
          <option value="all">全部六类方向</option>
          <option v-for="item in data.editorialDomains" :key="item.id" :value="item.id">{{ item.label }}</option>
        </select>
      </label>
    </div>

    <p class="directory-result" aria-live="polite">当前显示 {{ filtered.length }} / {{ data.faculty.length }} 人</p>

    <section v-if="teachers.length" aria-labelledby="faculty-heading">
      <div class="directory-heading">
        <div>
          <p class="section-kicker">人员分类</p>
          <h2 id="faculty-heading">教师档案</h2>
        </div>
        <span>{{ teachers.length }} 人</span>
      </div>
      <div class="faculty-grid">
        <article v-for="person in teachers" :key="person.id" class="faculty-card">
          <div class="faculty-card__top">
            <div>
              <h3>{{ person.name }}</h3>
              <p>{{ person.title }}</p>
            </div>
            <span v-if="person.isPartTime" class="status-badge">兼职</span>
          </div>
          <p class="faculty-card__directions">{{ person.officialDirections.join(' · ') }}</p>
          <ul class="tag-list">
            <li v-for="domainId in person.domainIds" :key="domainId">{{ domainLabel(domainId) }}</li>
          </ul>
          <a class="card-detail-link" :href="profilePath(person)">查看档案与来源 <span class="action-icon" aria-hidden="true">→</span></a>
        </article>
      </div>
    </section>

    <section v-if="researchStaff.length" aria-labelledby="research-staff-heading">
      <div class="directory-heading">
        <div>
          <p class="section-kicker">人员分类</p>
          <h2 id="research-staff-heading">专职科研人员</h2>
        </div>
        <span>{{ researchStaff.length }} 人</span>
      </div>
      <div class="faculty-grid faculty-grid--staff">
        <article v-for="person in researchStaff" :key="person.id" class="faculty-card">
          <div class="faculty-card__top">
            <div>
              <h3>{{ person.name }}</h3>
              <p>{{ person.title }}</p>
            </div>
          </div>
          <p class="faculty-card__directions">{{ person.officialDirections.join(' · ') }}</p>
          <ul class="tag-list">
            <li v-for="domainId in person.domainIds" :key="domainId">{{ domainLabel(domainId) }}</li>
          </ul>
          <a class="card-detail-link" :href="profilePath(person)">查看档案与来源 <span class="action-icon" aria-hidden="true">→</span></a>
        </article>
      </div>
    </section>

    <div v-if="!filtered.length" class="empty-state">
      没有匹配记录。可清空关键词或切换研究方向。
    </div>
  </section>
</template>
