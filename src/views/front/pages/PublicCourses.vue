<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import type { CourseRecord } from '@/stores/courses'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

const courses = ref<CourseRecord[]>([])
const errorMessage = ref('')
const isLoading = ref(true)

async function loadCourses() {
  errorMessage.value = ''
  isLoading.value = true

  try {
    const response = await fetch(`${API_BASE_URL}/auth/public-courses`)
    const payload = (await response.json().catch(() => null)) as CourseRecord[] | { message?: string } | null

    if (!response.ok) {
      throw new Error(payload && !Array.isArray(payload) && payload.message ? payload.message : 'Nao foi possivel carregar os cursos.')
    }

    courses.value = Array.isArray(payload) ? payload : []
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Nao foi possivel carregar os cursos.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  void loadCourses()
})
</script>

<template>
  <main class="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
    <section class="mx-auto max-w-6xl space-y-8">
      <header class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="text-sm font-semibold uppercase tracking-[0.22em] text-brand-700">Cursos publicos</p>
          <h1 class="mt-3 text-4xl font-semibold tracking-tight text-slate-900">Escolha seu curso</h1>
          <p class="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Cadastre-se em um curso publico para criar seu acesso e liberar sua matricula.
          </p>
        </div>

        <RouterLink to="/" class="w-fit rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700">
          Voltar
        </RouterLink>
      </header>

      <p v-if="errorMessage" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ errorMessage }}</p>

      <div v-if="isLoading" class="rounded-[2rem] border border-white bg-white p-8 text-sm text-slate-500 shadow-lg shadow-slate-900/5">
        Carregando cursos...
      </div>

      <div v-else-if="courses.length" class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <article v-for="course in courses" :key="course.id" class="flex min-h-[260px] flex-col rounded-[2rem] border border-white bg-white p-6 shadow-lg shadow-slate-900/5">
          <div class="flex-1">
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">{{ course.category?.name || 'Curso' }}</p>
            <h2 class="mt-3 text-2xl font-semibold text-slate-900">{{ course.fullname }}</h2>
            <p class="mt-3 line-clamp-4 text-sm leading-6 text-slate-600">{{ course.summary || 'Cadastro aberto para novos alunos.' }}</p>
          </div>

          <div class="mt-6 flex items-center justify-between gap-3">
            <span class="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Publico</span>
            <RouterLink :to="{ name: 'public-course-register', params: { slug: course.shortname } }" class="rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white">
              Cadastrar
            </RouterLink>
          </div>
        </article>
      </div>

      <div v-else class="rounded-[2rem] border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
        Nenhum curso publico disponivel no momento.
      </div>
    </section>
  </main>
</template>
