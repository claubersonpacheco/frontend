<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useCategoriesStore } from '@/stores/categories'

const route = useRoute()
const router = useRouter()
const categoriesStore = useCategoriesStore()
const form = reactive({ name: '', mcode: '', description: '' })
const errorMessage = ref('')

onMounted(async () => {
  try {
    const item = await categoriesStore.fetchCategoryById(String(route.params.id))
    form.name = item.name
    form.mcode = item.mcode?.toString() ?? ''
    form.description = item.description ?? ''
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Erro ao carregar categoria.'
  }
})

async function save() {
  try {
    await categoriesStore.updateCategory(String(route.params.id), {
      name: form.name,
      mcode: form.mcode.trim() ? Number(form.mcode) : null,
      description: form.description,
    })
    await router.push({ name: 'categories' })
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Erro ao salvar categoria.'
  }
}
</script>

<template><section class="space-y-6"><header class="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-xl shadow-slate-900/5 backdrop-blur"><h1 class="text-3xl font-semibold tracking-tight text-slate-900">Editar categoria</h1></header><article class="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-lg shadow-slate-900/5 backdrop-blur"><div class="grid gap-4 sm:grid-cols-2"><input v-model="form.name" class="rounded-xl border-slate-200 px-4 py-3 text-sm" /><input v-model="form.mcode" class="rounded-xl border-slate-200 px-4 py-3 text-sm" /><textarea v-model="form.description" class="sm:col-span-2 rounded-xl border-slate-200 px-4 py-3 text-sm" /></div><p v-if="errorMessage" class="mt-4 text-sm text-red-600">{{ errorMessage }}</p><div class="mt-6 flex gap-2"><button class="rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white" @click="save">Salvar</button><RouterLink :to="{ name: 'categories' }" class="rounded-xl border border-slate-200 px-6 py-3 text-sm">Cancelar</RouterLink></div></article></section></template>
