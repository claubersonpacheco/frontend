<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCoursesStore } from '@/stores/courses'

const route = useRoute()
const authStore = useAuthStore()
const coursesStore = useCoursesStore()
const errorMessage = ref('')
const isLoading = ref(false)
const openingCourseId = ref<number | null>(null)

const courseEnrollments = computed(() => coursesStore.myEnrollments)
const highlightedEnrollmentId = computed(() =>
  route.query.enrollment ? Number(route.query.enrollment) : null,
)

function formatCurrency(value?: string | null) {
  return Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

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
    <header class="rounded-md border border-white/70 bg-white/85 p-6 shadow-xl shadow-slate-900/5 backdrop-blur">
      <div class="flex flex-col gap-2">
        <p class="text-sm font-medium uppercase tracking-[0.22em] text-brand-700">Area do aluno</p>
        <h1 class="text-3xl font-semibold tracking-tight text-slate-900">Meus cursos</h1>
      </div>
    </header>

    <p v-if="errorMessage" class="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ errorMessage }}</p>

    <article v-if="courseEnrollments.length" class="grid gap-4">
      <section
        v-for="enrollment in courseEnrollments"
        :key="enrollment.id"
        class="rounded-md border bg-white/90 p-5 shadow-lg shadow-slate-900/5 backdrop-blur"
        :class="highlightedEnrollmentId === enrollment.id ? 'border-emerald-200 ring-4 ring-emerald-100' : 'border-white/70'"
      >
        <div class="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div class="min-w-0">
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">Curso</p>
            <h2 class="mt-2 text-xl font-semibold text-slate-900">{{ enrollment.course.fullname }}</h2>
            <div class="mt-2 flex flex-wrap gap-2 text-sm text-slate-500">
              <span>Inscricao em {{ new Date(enrollment.createdAt).toLocaleDateString('pt-BR') }}</span>
              <span v-if="enrollment.amountDue">Valor {{ formatCurrency(enrollment.amountDue) }}</span>
              <span class="font-medium" :class="enrollment.status === 'active' ? 'text-emerald-700' : 'text-amber-700'">
                {{ enrollment.status === 'active' ? 'Acesso liberado' : 'Pagamento pendente' }}
              </span>
            </div>
          </div>

          <div class="flex flex-wrap gap-2">
            <RouterLink :to="{ name: 'my-course-contract', params: { enrollmentId: enrollment.id } }" class="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-brand-200 hover:text-brand-700">
              Contrato
            </RouterLink>
            <RouterLink :to="{ name: 'my-course-financial', params: { enrollmentId: enrollment.id } }" class="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-brand-200 hover:text-brand-700">
              Financeiro
            </RouterLink>
            <button v-if="enrollment.status === 'active'" type="button" class="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-70" :disabled="openingCourseId === enrollment.course.id" @click="openMoodle(enrollment.course.id)">
              {{ openingCourseId === enrollment.course.id ? 'Abrindo...' : 'Entrar no Moodle' }}
            </button>
          </div>
        </div>
      </section>
    </article>

    <p v-else class="rounded-md border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
      {{ isLoading ? 'Carregando seus cursos...' : 'Voce ainda nao esta matriculado em nenhum curso.' }}
    </p>
  </section>
</template>
