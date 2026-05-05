<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const items = computed(() => {
  const matches = route.matched.filter((item) => item.path && item.path !== '/')

  return matches.map((item, index) => {
    const rawLabel =
      typeof item.meta?.title === 'string' && item.meta.title.trim()
        ? item.meta.title
        : typeof item.name === 'string' && item.name.trim()
          ? item.name
          : item.path

    const label = rawLabel.charAt(0).toUpperCase() + rawLabel.slice(1)

    return {
      label,
      to:
        index === matches.length - 1 || !item.name
          ? null
          : router.resolve({ name: item.name as string }).path,
    }
  })
})
</script>

<template>
  <nav
    class="flex flex-wrap items-center gap-2 rounded-[1.5rem] border border-white/70 bg-white/75 px-4 py-3 text-sm shadow-sm shadow-slate-900/5 backdrop-blur"
    aria-label="Breadcrumb"
  >
    <RouterLink to="/" class="font-medium text-slate-500 transition hover:text-brand-700">Home</RouterLink>

    <template v-for="item in items" :key="item.label">
      <span class="text-slate-300">/</span>
      <RouterLink
        v-if="item.to"
        :to="item.to"
        class="font-medium text-slate-500 transition hover:text-brand-700"
      >
        {{ item.label }}
      </RouterLink>
      <span v-else class="font-semibold text-slate-900">{{ item.label }}</span>
    </template>
  </nav>
</template>
