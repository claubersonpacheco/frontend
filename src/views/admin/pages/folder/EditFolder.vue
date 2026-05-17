<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useFoldersStore } from '@/stores/folders'

const route = useRoute()
const router = useRouter()
const foldersStore = useFoldersStore()
const form = reactive({ name: '' })
const errorMessage = ref('')

onMounted(async () => {
  try {
    const folder = await foldersStore.fetchFolderById(String(route.params.id))
    form.name = folder.name
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Nao foi possivel carregar a pasta.'
  }
})

async function save() {
  try {
    await foldersStore.updateFolder(String(route.params.id), form.name)
    await router.push({ name: 'folders' })
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Nao foi possivel salvar a pasta.'
  }
}
</script>

<template>
  <section class="space-y-6">
    <header class="rounded-md border border-white/70 bg-white/85 p-6 shadow-xl shadow-slate-900/5 backdrop-blur">
      <h1 class="text-3xl font-semibold tracking-tight text-slate-900">Editar pasta</h1>
    </header>
    <article class="rounded-md border border-white/70 bg-white/90 p-6 shadow-lg shadow-slate-900/5 backdrop-blur">
      <input v-model="form.name" type="text" class="block w-full rounded-md border-slate-200 px-4 py-3 text-sm" />
      <p v-if="errorMessage" class="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ errorMessage }}</p>
      <div class="mt-6 flex gap-3">
        <button type="button" class="rounded-md bg-brand-600 px-6 py-3 text-sm font-semibold text-white" @click="save">Salvar</button>
        <RouterLink :to="{ name: 'folders' }" class="rounded-md border border-slate-200 px-6 py-3 text-sm font-medium text-slate-700">Cancelar</RouterLink>
      </div>
    </article>
  </section>
</template>
