<script setup lang="ts">
import { computed } from 'vue'
import { withBase } from 'vitepress'
import content from '../../data/content.json'
import outlines from '../../data/course-outlines.json'
import type { ContentDatabase, CourseOutline } from '../../data/contracts'
import CourseResourcePanel from './CourseResourcePanel.vue'

const props = defineProps<{ courseId: string }>()
const data = content as ContentDatabase
const courseOutlines = outlines as CourseOutline[]
const course = computed(() => data.courses.find((item) => item.id === props.courseId))
const outline = computed(() => courseOutlines.find((item) => item.courseId === props.courseId))
const chapterCount = computed(() => outline.value?.stages.reduce((count, stage) => count + stage.chapters.length, 0) ?? 0)
</script>

<template>
  <article v-if="course && outline" class="course-detail">
    <nav class="profile-breadcrumb" aria-label="面包屑">
      <a :href="withBase('/courses/')">课程介绍</a><span aria-hidden="true">/</span><span>{{ course.name }}</span>
    </nav>

    <header class="course-detail__hero">
      <div class="course-detail__intro">
        <p class="section-kicker">课程知识地图 · 编辑性整理</p>
        <div class="course-detail__code">{{ course.courseCode }}</div>
        <h1>{{ course.name }}</h1>
        <p class="course-detail__english">{{ outline.english }}</p>
        <p class="course-detail__lead">{{ outline.introduction }}</p>
        <dl class="course-detail__meta">
          <div><dt>学期</dt><dd>{{ course.term }}</dd></div>
          <div><dt>任课教师</dt><dd>{{ course.instructors.join('、') }}</dd></div>
          <div><dt>内容范围</dt><dd>{{ chapterCount }} 个已核验章节 · 3 个学习阶段</dd></div>
        </dl>
      </div>

      <div class="course-structure-visual" aria-hidden="true">
        <span class="course-structure-visual__label course-structure-visual__label--stack">STACK</span>
        <span class="course-structure-visual__label course-structure-visual__label--tree">TREE</span>
        <span class="course-structure-visual__label course-structure-visual__label--graph">GRAPH</span>
        <i class="course-structure-visual__bar course-structure-visual__bar--one" />
        <i class="course-structure-visual__bar course-structure-visual__bar--two" />
        <i class="course-structure-visual__bar course-structure-visual__bar--three" />
        <i class="course-structure-visual__edge course-structure-visual__edge--one" />
        <i class="course-structure-visual__edge course-structure-visual__edge--two" />
        <i class="course-structure-visual__edge course-structure-visual__edge--three" />
        <b class="course-structure-visual__node course-structure-visual__node--root">T</b>
        <b class="course-structure-visual__node course-structure-visual__node--left">L</b>
        <b class="course-structure-visual__node course-structure-visual__node--right">R</b>
        <b class="course-structure-visual__node course-structure-visual__node--graph-one">1</b>
        <b class="course-structure-visual__node course-structure-visual__node--graph-two">2</b>
        <b class="course-structure-visual__node course-structure-visual__node--graph-three">3</b>
      </div>
    </header>

    <div class="source-note course-detail__source-note">
      本页以文字转述课件的知识结构；资料区当前未接入文件，后续只展示获授权内容。课程安排请以当学期教学大纲为准。最后核验：{{ outline.lastVerified }}。
    </div>

    <CourseResourcePanel :course-id="course.id" />

    <section class="course-lenses" aria-labelledby="course-lenses-title">
      <div class="course-section-heading">
        <div>
          <p class="section-kicker">学习抓手</p>
          <h2 id="course-lenses-title">用四个问题读懂每种结构</h2>
        </div>
        <p>从“它是什么”走向“如何表示、如何操作、为什么这样选择”。</p>
      </div>
      <ol class="course-lens-grid">
        <li v-for="(lens, index) in outline.learningLenses" :key="lens.label">
          <span>0{{ index + 1 }}</span>
          <strong>{{ lens.label }}</strong>
          <p>{{ lens.description }}</p>
        </li>
      </ol>
    </section>

    <section class="course-route" aria-labelledby="course-route-title">
      <div class="course-section-heading">
        <div>
          <p class="section-kicker">学习路线</p>
          <h2 id="course-route-title">三阶段学习路线</h2>
        </div>
        <p>先建立结构视角，再进入非线性关系，最后比较检索与组织算法。</p>
      </div>
      <ol class="course-route__list">
        <li v-for="stage in outline.stages" :key="stage.id">
          <a :href="`#course-stage-${stage.id}`">
            <span class="course-route__index">{{ stage.index }}</span>
            <span class="course-route__copy">
              <strong>{{ stage.title }}</strong>
              <small>{{ stage.english }}</small>
              <span>{{ stage.summary }}</span>
            </span>
            <span aria-hidden="true">↓</span>
          </a>
        </li>
      </ol>
    </section>

    <section class="course-chapter-map" aria-labelledby="course-map-title">
      <div class="course-section-heading">
        <div>
          <p class="section-kicker">章节索引</p>
          <h2 id="course-map-title">章节知识地图</h2>
        </div>
        <p>章节标签是导航线索，不替代课堂讲授、教材或实验要求。</p>
      </div>

      <div v-for="stage in outline.stages" :id="`course-stage-${stage.id}`" :key="stage.id" class="course-stage">
        <header class="course-stage__header">
          <span>{{ stage.index }}</span>
          <div>
            <h3>{{ stage.title }}</h3>
            <p>{{ stage.english }}</p>
          </div>
        </header>

        <div v-if="stage.id === 'search-and-sort'" class="course-chapter-gap" role="note">
          <span>08</span>
          <p>{{ outline.missingChapters[0]?.note }}</p>
        </div>

        <div class="course-chapter-grid">
          <article
            v-for="chapter in stage.chapters"
            :key="chapter.number"
            class="course-chapter-card"
            :class="{ 'course-chapter-card--wide': chapter.sections }"
          >
            <div class="course-chapter-card__number">CH. {{ chapter.number.padStart(2, '0') }}</div>
            <h4>{{ chapter.title }}</h4>
            <p>{{ chapter.summary }}</p>
            <ul class="tag-list" aria-label="核心主题">
              <li v-for="topic in chapter.topics" :key="topic">{{ topic }}</li>
            </ul>
            <ol v-if="chapter.sections" class="course-chapter-sections" aria-label="第六章三个学习阶段">
              <li v-for="(section, index) in chapter.sections" :key="section.label">
                <span>6.{{ index + 1 }}</span>
                <div><strong>{{ section.label }}</strong><p>{{ section.summary }}</p></div>
              </li>
            </ol>
          </article>
        </div>
      </div>
    </section>
  </article>

  <div v-else class="empty-state">
    未找到该课程详情。<a :href="withBase('/courses/')">返回课程索引</a>
  </div>
</template>
