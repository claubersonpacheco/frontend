<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { usePermissionsStore } from '@/stores/permissions'

const permissionsStore = usePermissionsStore()
const errorMessage = ref('')

async function load() {
  errorMessage.value = ''
  try {
    await permissionsStore.fetchPermissions()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Erro ao carregar permissoes.'
  }
}

onMounted(() => {
  void load()
})
</script>

<template>
  <section class="space-y-6">
    <header class="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-xl shadow-slate-900/5 backdrop-blur">
      <div class="flex items-center justify-between gap-3">
        <h1 class="text-3xl font-semibold tracking-tight text-slate-900">Permissoes</h1>
        <RouterLink :to="{ name: 'permissions-create' }" class="rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white">Nova permissao</RouterLink>
      </div>
    </header>

    <p v-if="errorMessage" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ errorMessage }}</p>

    <article class="overflow-x-auto rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-lg shadow-slate-900/5 backdrop-blur">
      <table class="min-w-full divide-y divide-slate-200">
        <thead>
          <tr class="text-left text-xs uppercase tracking-[0.18em] text-slate-400">
            <th class="px-4 py-3">ID</th>
            <th class="px-4 py-3">Nome</th>
            <th class="px-4 py-3">Descricao</th>
            <th class="px-4 py-3 text-right">Acoes</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="item in permissionsStore.items" :key="item.id" class="text-sm text-slate-700">
            <td class="px-4 py-4">{{ item.id }}</td>
            <td class="px-4 py-4 font-medium text-slate-900">{{ item.name }}</td>
            <td class="px-4 py-4">{{ item.description || '-' }}</td>
            <td class="px-4 py-4">
              <div class="flex justify-end gap-2">
                <RouterLink :to="{ name: 'permissions-edit', params: { id: item.id } }" class="rounded-xl border border-slate-200 px-3 py-2">Editar</RouterLink>
                <RouterLink :to="{ name: 'permissions-delete', params: { id: item.id } }" class="rounded-xl border border-red-200 px-3 py-2 text-red-600">Excluir</RouterLink>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </article>
  </section>
</template>
