<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useFoldersStore } from '@/stores/folders'

const foldersStore = useFoldersStore()
const form = reactive({ name: '' })
const errorMessage = ref('')

async function loadFolders() {
  errorMessage.value = ''
  try {
    await foldersStore.fetchFolders()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Nao foi possivel carregar as pastas.'
  }
}

async function createFolder() {
  if (!form.name.trim()) return
  errorMessage.value = ''
  try {
    await foldersStore.createFolder(form.name)
    form.name = ''
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Nao foi possivel criar a pasta.'
  }
}

onMounted(() => {
  void loadFolders()
})
</script>

<template>
  <section class="space-y-6">
    <header class="rounded-md border border-white/70 bg-white/85 p-6 shadow-xl shadow-slate-900/5 backdrop-blur">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p class="text-sm font-medium uppercase tracking-[0.22em] text-brand-700">Folders</p>
          <h1 class="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Pastas de videos</h1>
        </div>
      </div>
    </header>

    <article class="rounded-md border border-white/70 bg-white/90 p-6 shadow-lg shadow-slate-900/5 backdrop-blur">
      <div class="flex flex-col gap-3 sm:flex-row">
        <input v-model="form.name" type="text" placeholder="Nome da pasta" class="block w-full rounded-md border-slate-200 px-4 py-3 text-sm" />
        <button type="button" class="rounded-md bg-brand-600 px-6 py-3 text-sm font-semibold text-white" @click="createFolder">Criar pasta</button>
      </div>
      <p v-if="errorMessage" class="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ errorMessage }}</p>
    </article>

    <article class="rounded-md border border-white/70 bg-white/90 p-6 shadow-lg shadow-slate-900/5 backdrop-blur">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-200">
          <thead>
            <tr class="text-left text-xs uppercase tracking-[0.18em] text-slate-400">
              <th class="px-4 py-3 font-semibold">ID</th>
              <th class="px-4 py-3 font-semibold">Nome</th>
              <th class="px-4 py-3 font-semibold text-right">Acoes</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="item in foldersStore.items" :key="item.id" class="text-sm text-slate-700">
              <td class="px-4 py-4">{{ item.id }}</td>
              <td class="px-4 py-4 font-medium text-slate-900">{{ item.name }}</td>
              <td class="px-4 py-4">
                <div class="flex justify-end gap-2">
                  <RouterLink :to="{ name: 'folders-edit', params: { id: item.id } }" class="rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700">Editar</RouterLink>
                  <RouterLink :to="{ name: 'folders-delete', params: { id: item.id } }" class="rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-600">Excluir</RouterLink>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>
  </section>
</template>
