<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { withBase } from 'vitepress'
import {
  courseResourceProvider,
  type CourseResource,
  type CourseResourceType
} from '../../services/courseResources'

const props = defineProps<{ courseId: string }>()
const resources = ref<readonly CourseResource[]>([])
const state = ref<'loading' | 'empty' | 'ready' | 'error'>(
  courseResourceProvider.mode === 'empty' ? 'empty' : 'loading'
)

const typeLabels: Record<CourseResourceType, string> = {
  slides: '课件',
  notes: '笔记',
  exam: '试卷',
  document: '文档'
}
const submitUrl = courseResourceProvider.getSubmitUrl(props.courseId)

function browseUrl(resourceId: string) {
  return courseResourceProvider.getBrowseUrl(props.courseId, resourceId)
}

function editUrl(resourceId: string) {
  return courseResourceProvider.getEditUrl(props.courseId, resourceId)
}

onMounted(async () => {
  if (courseResourceProvider.mode === 'empty') return

  try {
    resources.value = await courseResourceProvider.list(props.courseId)
    state.value = resources.value.length ? 'ready' : 'empty'
  } catch {
    state.value = 'error'
  }
})
</script>

<template>
  <section
    class="course-resource-panel"
    aria-labelledby="course-resources-title"
    :data-course-resources-state="state"
  >
    <div class="course-resource-panel__heading">
      <div>
        <p class="section-kicker">课程资料</p>
        <h2 id="course-resources-title">浏览、投稿与修改入口</h2>
      </div>
      <span class="status-badge status-badge--neutral">
        {{ state === 'ready' ? `${resources.length} 项` : state === 'loading' ? '正在读取' : state === 'error' ? '读取失败' : '等待首批内容' }}
      </span>
    </div>

    <p v-if="state === 'loading'" class="muted-copy" aria-live="polite">正在读取资料索引……</p>

    <div v-else-if="state === 'empty'" class="course-resource-empty" aria-live="polite">
      <p>后续会在这里汇总获授权的课件、笔记和文档。当前没有可浏览的资料条目，也不会跳转到外部文件。</p>
      <a :href="withBase('/contribute/')">了解如何贡献 <span class="action-icon" aria-hidden="true">→</span></a>
    </div>

    <div v-else-if="state === 'error'" class="course-resource-empty course-resource-empty--error" role="alert">
      <p>资料索引暂时无法读取，请稍后再试。</p>
    </div>

    <div v-else class="course-resource-ready">
      <div v-if="submitUrl" class="course-resource-ready__toolbar">
        <a :href="submitUrl">投稿课程资料</a>
      </div>
      <ul class="course-resource-list">
        <li v-for="resource in resources" :key="resource.id">
          <div>
            <span>{{ typeLabels[resource.type] }}</span>
            <strong>{{ resource.title }}</strong>
            <small>{{ resource.term ?? '学期待补' }} · 更新于 {{ resource.updatedAt }}</small>
          </div>
          <div class="course-resource-list__actions">
            <a v-if="browseUrl(resource.id)" :href="browseUrl(resource.id) ?? undefined">浏览资料</a>
            <a v-if="editUrl(resource.id)" :href="editUrl(resource.id) ?? undefined">修改信息</a>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>
