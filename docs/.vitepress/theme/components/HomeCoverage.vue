<script setup lang="ts">
import { computed } from 'vue'
import { withBase } from 'vitepress'
import content from '../../data/content.json'
import type { ContentDatabase } from '../../data/contracts'

const data = content as ContentDatabase
const lastVerified = computed(() => {
  const dates = [
    ...data.faculty.map((item) => item.lastVerified),
    ...data.courses.map((item) => item.lastVerified),
    ...data.projects.map((item) => item.lastVerified)
  ]
  return dates.sort().at(-1) ?? '待核验'
})
</script>

<template>
  <section class="home-coverage" aria-labelledby="home-coverage-title">
    <div class="home-coverage__intro">
      <p class="section-kicker">当前覆盖</p>
      <h2 id="home-coverage-title">内容还不多，但每一条都能追到来源</h2>
      <p>最后核验：{{ lastVerified }}。课程经验仍在征集，空缺会明确标出来。</p>
    </div>

    <dl class="home-coverage__stats">
      <div><dt>{{ data.faculty.length }}</dt><dd>位人员</dd></div>
      <div><dt>{{ data.courses.length }}</dt><dd>门课程</dd></div>
      <div><dt>{{ data.projects.length }}</dt><dd>个公开项目条目</dd></div>
    </dl>

    <div class="home-coverage__gaps">
      <span>待补</span>
      <ul>
        <li>课程学分与考核</li>
        <li>学生修课经验</li>
        <li>更多项目与竞赛记录</li>
      </ul>
      <a :href="withBase('/contribute/')">认领一项待补内容 <span aria-hidden="true">→</span></a>
    </div>
  </section>
</template>
