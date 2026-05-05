<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useCoursesStore } from '@/stores/courses'
import { useAuthStore } from '@/stores/auth'

const coursesStore = useCoursesStore()
const authStore = useAuthStore()
const errorMessage = ref('')
const isLoading = ref(false)
const openingCourseId = ref<number | null>(null)

const courseEnrollments = computed(() => coursesStore.myEnrollments)

async function load() {
  errorMessage.value = ''
  isLoading.value = true

  try {
    await coursesStore.fetchMyEnrollments()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Erro ao carregar seus cursos.'
  } finally {
    isLoading.value = false
  }
}

async function openMoodle(courseId: number) {
  errorMessage.value = ''
  openingCourseId.value = courseId

  try {
    await authStore.restoreSession()
    await coursesStore.fetchMyEnrollments()
    const url = await coursesStore.fetchMoodleLoginUrl(courseId)
    window.open(url, '_blank', 'noopener,noreferrer')
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Erro ao entrar no Moodle.'
  } finally {
    openingCourseId.value = null
  }
}

onMounted(() => {
  void load()
})
</script>

<template>
  <section class="space-y-6">
    <header class="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-xl shadow-slate-900/5 backdrop-blur">
      <div class="flex flex-col gap-2">
        <p class="text-sm font-medium uppercase tracking-[0.22em] text-brand-700">Area do aluno</p>
        <h1 class="text-3xl font-semibold tracking-tight text-slate-900">Meus cursos</h1>
      </div>
    </header>

    <p v-if="errorMessage" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ errorMessage }}</p>

    <article class="overflow-x-auto rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-lg shadow-slate-900/5 backdrop-blur">
      <table v-if="courseEnrollments.length" class="min-w-full divide-y divide-slate-200">
        <thead>
          <tr class="text-left text-xs uppercase tracking-[0.18em] text-slate-400">
            <th class="px-4 py-3">Curso</th>
            <th class="px-4 py-3">Data de cadastro no curso</th>
            <th class="px-4 py-3 text-right">Acesso</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="enrollment in courseEnrollments" :key="enrollment.id" class="text-sm text-slate-700">
            <td class="px-4 py-4">
              <p class="font-semibold text-slate-900">{{ enrollment.course.fullname }}</p>
            </td>
            <td class="px-4 py-4">{{ new Date(enrollment.createdAt).toLocaleDateString('pt-BR') }}</td>
            <td class="px-4 py-4 text-right">
              <button type="button" class="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-70" :disabled="openingCourseId === enrollment.course.id" @click="openMoodle(enrollment.course.id)">
                {{ openingCourseId === enrollment.course.id ? 'Abrindo...' : 'Entrar no Moodle' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <p v-else class="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
        {{ isLoading ? 'Carregando seus cursos...' : 'Voce ainda nao esta matriculado em nenhum curso.' }}
      </p>
    </article>
  </section>
</template>
