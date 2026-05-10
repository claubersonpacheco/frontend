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

function formatPrice(value: string | null) {
  if (!value) return 'Gratuito'
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
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
      <table class="min-w-full divide-y divide-slate-200">
        <thead>
          <tr class="text-left text-xs uppercase tracking-[0.18em] text-slate-400">
            <th class="px-4 py-3">ID</th>
            <th class="px-4 py-3">Nome</th>
            <th class="px-4 py-3">Categoria</th>
            <th class="px-4 py-3">Acesso</th>
            <th class="px-4 py-3">Comercial</th>
            <th class="px-4 py-3">Vagas</th>
            <th class="px-4 py-3">Alunos</th>
            <th class="px-4 py-3 text-right">Acoes</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="item in coursesStore.items" :key="item.id" class="text-sm text-slate-700">
            <td class="px-4 py-4">{{ item.id }}</td>
            <td class="px-4 py-4">
              <p class="font-semibold text-slate-900">{{ item.fullname }}</p>
              <p class="text-xs text-slate-500">{{ item.shortname }} · Moodle {{ item.mcode || '-' }}</p>
            </td>
            <td class="px-4 py-4">{{ item.category?.name || '-' }}</td>
            <td class="px-4 py-4">{{ item.accessType === 'open' ? 'Aberto' : 'Privado' }}</td>
            <td class="px-4 py-4">{{ item.pricingType === 'paid' ? formatPrice(item.price) : 'Gratuito' }}</td>
            <td class="px-4 py-4">{{ item.capacityType === 'limited' ? item.capacityLimit : 'Ilimitado' }}</td>
            <td class="px-4 py-4">{{ item.enrollmentCount ?? 0 }}</td>
            <td class="px-4 py-4">
              <div class="flex justify-end gap-2">
                <RouterLink v-if="item.accessType === 'open'" :to="{ name: 'public-course-register', params: { slug: item.shortname } }" class="rounded-xl border border-brand-200 px-3 py-2 text-brand-700">Link publico</RouterLink>
                <RouterLink :to="{ name: 'courses-enrollments', params: { id: item.id } }" class="rounded-xl border border-slate-200 px-3 py-2">Matriculas</RouterLink>
                <RouterLink :to="{ name: 'courses-edit', params: { id: item.id } }" class="rounded-xl border border-slate-200 px-3 py-2">Editar</RouterLink>
                <RouterLink :to="{ name: 'courses-delete', params: { id: item.id } }" class="rounded-xl border border-red-200 px-3 py-2 text-red-600">Excluir</RouterLink>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </article>
  </section>
</template>
