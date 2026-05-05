<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useCoursesStore } from '@/stores/courses'

const coursesStore = useCoursesStore()
const errorMessage = ref('')

async function load() {
  try {
    await coursesStore.fetchCourses()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Erro ao carregar cursos.'
  }
}

onMounted(() => {
  void load()
})
</script>

<template>
  <section class="space-y-6">
    <header class="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-xl shadow-slate-900/5 backdrop-blur">
      <div class="flex items-center justify-between gap-3">
        <h1 class="text-3xl font-semibold tracking-tight text-slate-900">Cursos</h1>
        <RouterLink :to="{ name: 'courses-create' }" class="rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white">Novo curso</RouterLink>
      </div>
    </header>

    <p v-if="errorMessage" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ errorMessage }}</p>

    <article class="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-lg shadow-slate-900/5 backdrop-blur">
      <table class="min-w-full divide-y divide-slate-200"><thead><tr class="text-left text-xs uppercase tracking-[0.18em] text-slate-400"><th class="px-4 py-3">ID</th><th class="px-4 py-3">Moodle</th><th class="px-4 py-3">Nome</th><th class="px-4 py-3">Curto</th><th class="px-4 py-3">Categoria</th><th class="px-4 py-3">Publico</th><th class="px-4 py-3">Alunos</th><th class="px-4 py-3 text-right">Acoes</th></tr></thead><tbody class="divide-y divide-slate-100"><tr v-for="item in coursesStore.items" :key="item.id" class="text-sm text-slate-700"><td class="px-4 py-4">{{ item.id }}</td><td class="px-4 py-4">{{ item.mcode || '-' }}</td><td class="px-4 py-4">{{ item.fullname }}</td><td class="px-4 py-4">{{ item.shortname }}</td><td class="px-4 py-4">{{ item.category?.name || '-' }}</td><td class="px-4 py-4">{{ item.isPublic ? 'Sim' : 'Nao' }}</td><td class="px-4 py-4">{{ item.enrollmentCount ?? 0 }}</td><td class="px-4 py-4"><div class="flex justify-end gap-2"><RouterLink v-if="item.isPublic" :to="{ name: 'public-course-register', params: { slug: item.shortname } }" class="rounded-xl border border-brand-200 px-3 py-2 text-brand-700">Link publico</RouterLink><RouterLink :to="{ name: 'courses-enrollments', params: { id: item.id } }" class="rounded-xl border border-slate-200 px-3 py-2">Matriculas</RouterLink><RouterLink :to="{ name: 'courses-edit', params: { id: item.id } }" class="rounded-xl border border-slate-200 px-3 py-2">Editar</RouterLink><RouterLink :to="{ name: 'courses-delete', params: { id: item.id } }" class="rounded-xl border border-red-200 px-3 py-2 text-red-600">Excluir</RouterLink></div></td></tr></tbody></table>
    </article>
  </section>
</template>
