<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useSettingsStore } from '@/stores/settings'

const settingsStore = useSettingsStore()
const errorMessage = ref('')
const searchTerm = ref('')

const filteredSettings = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()
  if (!term) return settingsStore.items

  return settingsStore.items.filter((item) =>
    [item.name, item.moodleUrl, item.bunnyStorageBaseUrl, item.streamLibraryId]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(term)),
  )
})

async function loadSettings() {
  errorMessage.value = ''
  try {
    await settingsStore.fetchSettings()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Nao foi possivel carregar os settings.'
  }
}

onMounted(() => {
  void loadSettings()
})
</script>

<template>
  <section class="space-y-6">
    <header class="rounded-md border border-white/70 bg-white/85 p-6 shadow-xl shadow-slate-900/5 backdrop-blur">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p class="text-sm font-medium uppercase tracking-[0.22em] text-brand-700">Settings</p>
          <h1 class="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Configuracoes da plataforma</h1>
        </div>

        <div class="flex flex-wrap gap-3">
          <button type="button" class="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:border-brand-200 hover:text-brand-700" @click="loadSettings">Atualizar lista</button>
          <RouterLink :to="{ name: 'settings-create' }" class="inline-flex items-center justify-center rounded-md bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700">Novo setting</RouterLink>
        </div>
      </div>
    </header>

    <p v-if="errorMessage" class="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ errorMessage }}</p>

    <section class="rounded-md border border-white/70 bg-white/90 p-6 shadow-lg shadow-slate-900/5 backdrop-blur">
      <div class="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h2 class="text-xl font-semibold text-slate-900">Registros cadastrados</h2>
          <p class="mt-1 text-sm text-slate-500">Total carregado: {{ settingsStore.items.length }}</p>
        </div>
        <label class="relative block min-w-72">
          <span class="sr-only">Pesquisar setting</span>
          <input v-model="searchTerm" type="search" placeholder="Pesquisar por nome, moodle url ou stream" class="block w-full rounded-md border-slate-200 bg-white/90 px-4 py-3 pr-11 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-brand-500" />
        </label>
      </div>

      <div v-if="filteredSettings.length" class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-200">
          <thead>
            <tr class="text-left text-xs uppercase tracking-[0.18em] text-slate-400">
              <th class="px-4 py-3 font-semibold">Nome</th>
              <th class="px-4 py-3 font-semibold">Moodle URL</th>
              <th class="px-4 py-3 font-semibold">Stream Library</th>
              <th class="px-4 py-3 font-semibold">Bunny Base URL</th>
              <th class="px-4 py-3 font-semibold text-right">Acoes</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="item in filteredSettings" :key="item.id" class="text-sm text-slate-700">
              <td class="px-4 py-4 font-medium text-slate-900">{{ item.name || '-' }}</td>
              <td class="px-4 py-4">{{ item.moodleUrl || '-' }}</td>
              <td class="px-4 py-4">{{ item.streamLibraryId || '-' }}</td>
              <td class="px-4 py-4">{{ item.bunnyStorageBaseUrl || '-' }}</td>
              <td class="px-4 py-4"><div class="flex justify-end gap-2"><RouterLink :to="{ name: 'settings-edit', params: { id: item.id } }" class="rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-brand-200 hover:text-brand-700">Editar</RouterLink><RouterLink :to="{ name: 'settings-delete', params: { id: item.id } }" class="rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50">Excluir</RouterLink></div></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="rounded-md border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
        <p class="text-lg font-semibold text-slate-800">Nenhum setting encontrado</p>
      </div>
    </section>
  </section>
</template>
