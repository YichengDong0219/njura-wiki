<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import { useData } from 'vitepress'
import GiscusComments from './components/GiscusComments.vue'

const { frontmatter, page, isDark } = useData()
</script>

<template>
  <DefaultTheme.Layout>
    <template #home-hero-before>
      <div class="hero-ambient" aria-hidden="true">
        <span class="hero-orbit hero-orbit--one" />
        <span class="hero-orbit hero-orbit--two" />
        <span class="hero-dot hero-dot--one" />
        <span class="hero-dot hero-dot--two" />
      </div>
    </template>
    <template #doc-after>
      <GiscusComments
        v-if="frontmatter.comment !== false"
        :key="`${page.relativePath}:${isDark}`"
        :theme="isDark ? 'dark' : 'light'"
      />
    </template>
  </DefaultTheme.Layout>
</template>
