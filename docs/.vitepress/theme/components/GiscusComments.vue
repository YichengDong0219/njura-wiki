<script setup lang="ts">
import { onMounted, ref } from 'vue'

const props = defineProps<{ theme: 'light' | 'dark' }>()
const host = ref<HTMLElement | null>(null)
const repo = 'YichengDong0219/njura-wiki'
const repoId = import.meta.env.VITE_GISCUS_REPO_ID as string | undefined
const categoryId = import.meta.env.VITE_GISCUS_CATEGORY_ID as string | undefined
const configured = Boolean(repoId && categoryId)

onMounted(() => {
  if (!configured || !host.value) return
  const script = document.createElement('script')
  Object.assign(script, {
    src: 'https://giscus.app/client.js',
    async: true,
    crossOrigin: 'anonymous'
  })
  const attributes: Record<string, string> = {
    'data-repo': repo,
    'data-repo-id': repoId!,
    'data-category': '文章评论',
    'data-category-id': categoryId!,
    'data-mapping': 'pathname',
    'data-strict': '1',
    'data-reactions-enabled': '1',
    'data-emit-metadata': '0',
    'data-input-position': 'top',
    'data-theme': props.theme,
    'data-lang': 'zh-CN',
    'data-loading': 'lazy'
  }
  Object.entries(attributes).forEach(([name, value]) => script.setAttribute(name, value))
  host.value.appendChild(script)
})
</script>

<template>
  <section v-if="configured" class="comments-section" aria-labelledby="comments-title">
    <h2 id="comments-title">讨论与补充</h2>
    <div ref="host" class="giscus" />
  </section>
</template>
