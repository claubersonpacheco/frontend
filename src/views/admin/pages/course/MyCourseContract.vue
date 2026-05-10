<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useCoursesStore } from '@/stores/courses'

const route = useRoute()
const coursesStore = useCoursesStore()
const errorMessage = ref('')
const isLoading = ref(false)

const enrollment = computed(() =>
  coursesStore.myEnrollments.find((item) => item.id === Number(route.params.enrollmentId)),
)

function formatCurrency(value?: string | null) {
  return Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

function contractText() {
  if (!enrollment.value) return ''

  const studentName = `${enrollment.value.user.name} ${enrollment.value.user.lastname ?? ''}`.trim()
  const amount = enrollment.value.amountDue ? formatCurrency(enrollment.value.amountDue) : 'gratuito'

  return `Contrato de inscricao no curso ${enrollment.value.course.fullname}. Aluno: ${studentName}. Valor: ${amount}. O acesso ao curso sera liberado apos a confirmacao do pagamento, quando aplicavel.`
}

async function load() {
  errorMessage.value = ''
  isLoading.value = true

  try {
    await coursesStore.fetchMyEnrollments()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Erro ao carregar contrato.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  void load()
})
</script>

<template>
  <section class="space-y-6">
    <header class="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-xl shadow-slate-900/5 backdrop-blur">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p class="text-sm font-medium uppercase tracking-[0.22em] text-brand-700">Contrato</p>
          <h1 class="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{{ enrollment?.course.fullname ?? 'Curso' }}</h1>
        </div>
        <RouterLink :to="{ name: 'my-courses' }" class="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:border-brand-200 hover:text-brand-700">Voltar</RouterLink>
      </div>
    </header>

    <p v-if="errorMessage" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ errorMessage }}</p>

    <article v-if="enrollment" class="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-lg shadow-slate-900/5 backdrop-blur">
      <h2 class="text-xl font-semibold text-slate-900">Termo de inscricao</h2>
      <p class="mt-4 text-sm leading-7 text-slate-700">{{ contractText() }}</p>
      <div v-if="enrollment.course.summary" class="mt-6 border-t border-slate-100 pt-6 text-sm leading-7 text-slate-700 [&_a]:underline [&_h3]:text-lg [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-5" v-html="enrollment.course.summary" />
    </article>

    <p v-else class="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
      {{ isLoading ? 'Carregando contrato...' : 'Contrato nao encontrado.' }}
    </p>
  </section>
</template>
