<script setup lang="ts">
import { withBase } from 'vitepress'

const entries = [
  {
    kind: 'course',
    label: '课程',
    title: '查课程',
    description: '先看开课学期、任课教师和已核验的课程范围。',
    link: '/courses/'
  },
  {
    kind: 'faculty',
    label: '教师与方向',
    title: '按方向找老师',
    description: '从六类研究方向进入，再回到教师官网与公开主页核对。',
    link: '/faculty/'
  },
  {
    kind: 'project',
    label: '项目与竞赛',
    title: '看同学做过什么',
    description: '浏览有公开来源的实践项目、科研项目与参与线索。',
    link: '/projects/'
  },
  {
    kind: 'research',
    label: '科研入门',
    title: '第一次进实验室',
    description: '从读论文、联系导师到准备第一次交流。',
    link: '/research/'
  },
  {
    kind: 'learning',
    label: '学习经验',
    title: '找一条可走的学习路径',
    description: '培养方案、工具链与仍在征集的学生经验。',
    link: '/learning/'
  }
] as const
</script>

<template>
  <section class="home-portal" aria-labelledby="home-portal-title">
    <header class="home-section-heading">
      <div>
        <p class="section-kicker">从这里开始</p>
        <h2 id="home-portal-title">你现在想查什么？</h2>
      </div>
      <p>课程、老师、项目和科研准备分开放；先解决眼前的问题，再继续往下看。</p>
    </header>

    <nav class="home-portal__grid" aria-label="Wiki 五个主要入口">
      <a
        v-for="entry in entries"
        :key="entry.kind"
        :class="['home-portal-card', `home-portal-card--${entry.kind}`]"
        :href="withBase(entry.link)"
      >
        <span :class="['portal-icon', `portal-icon--${entry.kind}`]" aria-hidden="true">
          <i /><i /><i />
        </span>
        <span class="home-portal-card__copy">
          <small>{{ entry.label }}</small>
          <strong>{{ entry.title }}</strong>
          <span>{{ entry.description }}</span>
        </span>
        <span class="home-portal-card__arrow" aria-hidden="true">→</span>
      </a>
    </nav>
  </section>
</template>
