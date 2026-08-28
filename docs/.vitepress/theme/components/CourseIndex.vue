<script setup lang="ts">
import { withBase } from 'vitepress'
import content from '../../data/content.json'
import type { ContentDatabase } from '../../data/contracts'

const data = content as ContentDatabase
</script>

<template>
  <div class="course-grid">
    <article v-for="course in data.courses" :key="course.id" class="course-card">
      <div class="course-card__code">{{ course.courseCode }}</div>
      <h2>
        <a v-if="course.detailPath" class="course-card__title-link" :href="withBase(course.detailPath)">{{ course.name }}</a>
        <template v-else>{{ course.name }}</template>
      </h2>
      <dl>
        <div><dt>学期</dt><dd>{{ course.term }}</dd></div>
        <div><dt>任课教师</dt><dd>{{ course.instructors.join('、') }}</dd></div>
        <div><dt>学分</dt><dd>{{ course.credits ?? '待教学大纲核验' }}</dd></div>
        <div><dt>考核</dt><dd>{{ course.assessment }}</dd></div>
      </dl>
      <div class="course-card__links">
        <a :href="course.officialSource" target="_blank" rel="noreferrer">官方来源 ↗</a>
        <span class="status-badge status-badge--neutral">学生经验：{{ course.experienceStatus }}</span>
      </div>
      <a v-if="course.detailPath" class="course-card__detail-link" :href="withBase(course.detailPath)">
        查看课程地图 <span aria-hidden="true">→</span>
      </a>
      <p class="verified-date">最后核验：{{ course.lastVerified }}</p>
    </article>
  </div>
</template>
