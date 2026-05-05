<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useCategoriesStore } from '@/stores/categories'
import { useCoursesStore } from '@/stores/courses'

const router = useRouter()
const coursesStore = useCoursesStore()
const categoriesStore = useCategoriesStore()
const errorMessage = ref('')
const isSubmitting = ref(false)

const form = reactive({
  fullname: '',
  shortname: '',
  summary: '',
  visible: '1',
  isPublic: 'false',
  startdate: '',
  enddate: '',
  categoryId: 1,
})

onMounted(async () => {
  try {
    await categoriesStore.fetchCategories()
    if (categoriesStore.items[0]) form.categoryId = categoriesStore.items[0].id
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Erro ao carregar categorias.'
  }
})

async function save(redirectToEnrollments = false) {
  errorMessage.value = ''
  isSubmitting.value = true

  try {
    const course = await coursesStore.createCourse({ ...form })
    await router.push(
      redirectToEnrollments
        ? { name: 'courses-enrollments', params: { id: course.id } }
        : { name: 'courses' },
    )
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Erro ao criar curso.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <section class="space-y-6">
    <header class="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-xl shadow-slate-900/5 backdrop-blur">
      <h1 class="text-3xl font-semibold tracking-tight text-slate-900">Novo curso</h1>
    </header>

    <article class="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-lg shadow-slate-900/5 backdrop-blur">
      <div class="grid gap-4 sm:grid-cols-2">
        <input v-model="form.fullname" placeholder="Nome completo" class="rounded-xl border-slate-200 px-4 py-3 text-sm" />
        <input v-model="form.shortname" placeholder="Nome curto" class="rounded-xl border-slate-200 px-4 py-3 text-sm" />

        <select v-model.number="form.categoryId" class="rounded-xl border-slate-200 px-4 py-3 text-sm">
          <option v-for="cat in categoriesStore.items" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
        </select>

        <select v-model="form.isPublic" class="rounded-xl border-slate-200 px-4 py-3 text-sm">
          <option value="false">Privado</option>
          <option value="true">Publico com cadastro</option>
        </select>

        <input v-model="form.startdate" type="datetime-local" class="rounded-xl border-slate-200 px-4 py-3 text-sm" />
        <input v-model="form.enddate" type="datetime-local" class="rounded-xl border-slate-200 px-4 py-3 text-sm" />
        <textarea v-model="form.summary" placeholder="Resumo" class="sm:col-span-2 rounded-xl border-slate-200 px-4 py-3 text-sm" />
      </div>

      <p v-if="errorMessage" class="mt-4 text-sm text-red-600">{{ errorMessage }}</p>

      <div class="mt-6 flex flex-wrap gap-2">
        <button class="rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white disabled:opacity-70" :disabled="isSubmitting" @click="save(false)">
          {{ isSubmitting ? 'Salvando...' : 'Salvar' }}
        </button>
        <button class="rounded-xl border border-brand-200 bg-brand-50 px-6 py-3 text-sm font-semibold text-brand-700 disabled:opacity-70" :disabled="isSubmitting" @click="save(true)">
          Salvar e matricular alunos
        </button>
        <RouterLink :to="{ name: 'courses' }" class="rounded-xl border border-slate-200 px-6 py-3 text-sm">Cancelar</RouterLink>
      </div>
    </article>
  </section>
</template>
