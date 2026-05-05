<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useRolesStore } from '@/stores/roles'

const rolesStore = useRolesStore()
const errorMessage = ref('')

async function load() {
  errorMessage.value = ''
  try {
    await rolesStore.fetchRoles()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Erro ao carregar roles.'
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
        <h1 class="text-3xl font-semibold tracking-tight text-slate-900">Roles</h1>
        <RouterLink :to="{ name: 'roles-create' }" class="rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white">Novo role</RouterLink>
      </div>
    </header>

    <p v-if="errorMessage" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ errorMessage }}</p>

    <article class="overflow-x-auto rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-lg shadow-slate-900/5 backdrop-blur">
      <table class="min-w-full divide-y divide-slate-200">
        <thead>
          <tr class="text-left text-xs uppercase tracking-[0.18em] text-slate-400">
            <th class="px-4 py-3">ID</th>
            <th class="px-4 py-3">Nome</th>
            <th class="px-4 py-3">Moodle</th>
            <th class="px-4 py-3">Permissoes</th>
            <th class="px-4 py-3 text-right">Acoes</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="item in rolesStore.items" :key="item.id" class="text-sm text-slate-700">
            <td class="px-4 py-4">{{ item.id }}</td>
            <td class="px-4 py-4 font-medium text-slate-900">{{ item.name }}</td>
            <td class="px-4 py-4">{{ item.moodleRoleId ?? '-' }}</td>
            <td class="px-4 py-4">
              <span v-if="!item.permissions.length">-</span>
              <span v-else>{{ item.permissions.map((permission) => permission.name).join(', ') }}</span>
            </td>
            <td class="px-4 py-4">
              <div class="flex justify-end gap-2">
                <RouterLink :to="{ name: 'roles-edit', params: { id: item.id } }" class="rounded-xl border border-slate-200 px-3 py-2">Editar</RouterLink>
                <RouterLink :to="{ name: 'roles-delete', params: { id: item.id } }" class="rounded-xl border border-red-200 px-3 py-2 text-red-600">Excluir</RouterLink>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </article>
  </section>
</template>
