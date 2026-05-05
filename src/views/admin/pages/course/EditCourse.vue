<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useCategoriesStore } from '@/stores/categories'
import { useCoursesStore } from '@/stores/courses'

const route = useRoute()
const router = useRouter()
const coursesStore = useCoursesStore()
const categoriesStore = useCategoriesStore()
const errorMessage = ref('')

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
    const course = await coursesStore.fetchCourseById(String(route.params.id))
    form.fullname = course.fullname
    form.shortname = course.shortname
    form.summary = course.summary ?? ''
    form.visible = course.visible ?? '1'
    form.isPublic = course.isPublic ? 'true' : 'false'
    form.startdate = course.startdate ? new Date(course.startdate).toISOString().slice(0, 16) : ''
    form.enddate = course.enddate ? new Date(course.enddate).toISOString().slice(0, 16) : ''
    form.categoryId = course.category.id
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Erro ao carregar curso.'
  }
})

async function save() {
  try {
    await coursesStore.updateCourse(String(route.params.id), { ...form })
    await router.push({ name: 'courses' })
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Erro ao salvar curso.'
  }
}
</script>

<template>
  <section class="space-y-6">
    <header class="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-xl shadow-slate-900/5 backdrop-blur">
      <h1 class="text-3xl font-semibold tracking-tight text-slate-900">Editar curso</h1>
    </header>

    <article class="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-lg shadow-slate-900/5 backdrop-blur">
      <div class="grid gap-4 sm:grid-cols-2">
        <input v-model="form.fullname" class="rounded-xl border-slate-200 px-4 py-3 text-sm" />
        <input v-model="form.shortname" class="rounded-xl border-slate-200 px-4 py-3 text-sm" />

        <select v-model.number="form.categoryId" class="rounded-xl border-slate-200 px-4 py-3 text-sm">
          <option v-for="cat in categoriesStore.items" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
        </select>

        <select v-model="form.isPublic" class="rounded-xl border-slate-200 px-4 py-3 text-sm">
          <option value="false">Privado</option>
          <option value="true">Publico com cadastro</option>
        </select>

        <input v-model="form.startdate" type="datetime-local" class="rounded-xl border-slate-200 px-4 py-3 text-sm" />
        <input v-model="form.enddate" type="datetime-local" class="rounded-xl border-slate-200 px-4 py-3 text-sm" />
        <textarea v-model="form.summary" class="sm:col-span-2 rounded-xl border-slate-200 px-4 py-3 text-sm" />
      </div>

      <p v-if="errorMessage" class="mt-4 text-sm text-red-600">{{ errorMessage }}</p>

      <div class="mt-6 flex gap-2">
        <button class="rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white" @click="save">Salvar</button>
        <RouterLink :to="{ name: 'courses' }" class="rounded-xl border border-slate-200 px-6 py-3 text-sm">Cancelar</RouterLink>
      </div>
    </article>
  </section>
</template>
