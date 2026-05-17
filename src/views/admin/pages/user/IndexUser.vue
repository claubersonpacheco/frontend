<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'

import { useAuthStore } from '@/stores/auth'
import { useUsersStore, type UserRecord } from '@/stores/users'

const usersStore = useUsersStore()
const authStore = useAuthStore()
const errorMessage = ref('')
const searchTerm = ref('')
const currentPage = ref(1)
const updatingStatusIds = ref(new Set<number>())
const pageSize = 8

const filteredUsers = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()

  if (!term) {
    return usersStore.items
  }

  return usersStore.items.filter((item) => {
    const fullName = `${item.name} ${item.lastname}`.trim().toLowerCase()

    return (
      item.username.toLowerCase().includes(term) ||
      item.email.toLowerCase().includes(term) ||
      fullName.includes(term)
    )
  })
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredUsers.value.length / pageSize)),
)

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredUsers.value.slice(start, start + pageSize)
})

const paginationLabel = computed(() => {
  if (!filteredUsers.value.length) {
    return '0 resultados'
  }

  const start = (currentPage.value - 1) * pageSize + 1
  const end = Math.min(currentPage.value * pageSize, filteredUsers.value.length)
  return `${start}-${end} de ${filteredUsers.value.length}`
})

async function loadUsers() {
  errorMessage.value = ''

  try {
    await usersStore.fetchUsers()
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Nao foi possivel carregar os usuarios.'
  }
}

onMounted(() => {
  void loadUsers()
})

watch(searchTerm, () => {
  currentPage.value = 1
})

watch(totalPages, (nextTotalPages) => {
  if (currentPage.value > nextTotalPages) {
    currentPage.value = nextTotalPages
  }
})

function goToPreviousPage() {
  if (currentPage.value > 1) {
    currentPage.value -= 1
  }
}

function goToNextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value += 1
  }
}

function isUpdatingStatus(userId: number) {
  return updatingStatusIds.value.has(userId)
}

function getUserInitials(user: UserRecord) {
  const name = user.name || user.username || 'U'
  const lastname = user.lastname || ''

  return `${name.charAt(0)}${lastname.charAt(0)}`.toUpperCase()
}

async function updateUserStatus(user: UserRecord, suspended: string) {
  if (suspended === user.suspended || isUpdatingStatus(user.id)) {
    return
  }

  errorMessage.value = ''
  updatingStatusIds.value = new Set(updatingStatusIds.value).add(user.id)

  try {
    await usersStore.updateUser(user.id, {
      username: user.username,
      name: user.name,
      lastname: user.lastname,
      suspended,
    })
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Nao foi possivel atualizar o status.'
  } finally {
    const nextUpdatingStatusIds = new Set(updatingStatusIds.value)
    nextUpdatingStatusIds.delete(user.id)
    updatingStatusIds.value = nextUpdatingStatusIds
  }
}
</script>

<template>
  <section class="space-y-6">
    <header class="rounded-md border border-white/70 bg-white/85 p-6 shadow-xl shadow-slate-900/5 backdrop-blur">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p class="text-sm font-medium uppercase tracking-[0.22em] text-brand-700">Usuarios</p>
          <h1 class="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Gerencie o CRUD de usuarios</h1>
          <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Liste, crie, edite e remova usuarios em paginas separadas dentro do layout administrativo.
          </p>
        </div>

        <div class="flex flex-wrap gap-3">
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:border-brand-200 hover:text-brand-700"
            @click="loadUsers"
          >
            Atualizar lista
          </button>
          <RouterLink
            :to="{ name: 'users-create' }"
            class="inline-flex items-center justify-center rounded-md bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700"
          >
            Novo usuario
          </RouterLink>
        </div>
      </div>
    </header>

    <p v-if="errorMessage" class="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {{ errorMessage }}
    </p>

    <section class="rounded-md border border-white/70 bg-white/90 p-6 shadow-lg shadow-slate-900/5 backdrop-blur">
      <div class="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h2 class="text-xl font-semibold text-slate-900">Usuarios cadastrados</h2>
          <p class="mt-1 text-sm text-slate-500">
            Total carregado: {{ usersStore.items.length }} | Exibindo: {{ paginationLabel }}
          </p>
        </div>
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label class="relative block min-w-72">
            <span class="sr-only">Pesquisar usuario</span>
            <input
              v-model="searchTerm"
              type="search"
              placeholder="Pesquisar por username, nome ou e-mail"
              class="block w-full rounded-md border-slate-200 bg-white/90 px-4 py-3 pr-11 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-brand-500"
            />
            <svg
              class="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-slate-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="1.8"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m21 21-4.35-4.35m1.85-5.15a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
              />
            </svg>
          </label>

        </div>
      </div>

      <div v-if="filteredUsers.length" class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-200">
          <thead>
            <tr class="text-left text-xs uppercase tracking-[0.18em] text-slate-400">
              <th class="px-4 py-3 font-semibold">Usuario</th>
              <th class="px-4 py-3 font-semibold">E-mail</th>
              <th class="px-4 py-3 font-semibold">Role</th>
              <th class="px-4 py-3 font-semibold">Status</th>
              <th class="px-4 py-3 font-semibold text-right">Acoes</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="item in paginatedUsers" :key="item.id" class="text-sm text-slate-700">
              <td class="px-4 py-4">
                <div class="flex items-center gap-3">
                  <div class="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-brand-50 text-sm font-semibold text-brand-700">
                    <img
                      v-if="item.photoUrl"
                      :src="item.photoUrl"
                      :alt="`Foto de ${item.name || item.username}`"
                      class="h-full w-full object-cover"
                    />
                    <span v-else>{{ getUserInitials(item) }}</span>
                  </div>
                  <div class="min-w-0">
                    <p class="font-medium text-slate-900">{{ item.username }}</p>
                    <p class="mt-1 truncate text-sm text-slate-500">{{ item.name }} {{ item.lastname }}</p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-4">{{ item.email }}</td>
              <td class="px-4 py-4">{{ item.role?.name ?? '-' }}</td>
              <td class="px-4 py-4">
                <select
                  v-if="authStore.isMaster"
                  :value="item.suspended"
                  class="min-w-32 rounded-md border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm focus:border-brand-500 focus:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-60"
                  :disabled="isUpdatingStatus(item.id)"
                  @change="updateUserStatus(item, ($event.target as HTMLSelectElement).value)"
                >
                  <option value="0">Ativo</option>
                  <option value="1">Suspenso</option>
                </select>
                <span
                  v-else
                  class="rounded-md px-3 py-1 text-xs font-semibold"
                  :class="item.suspended === '1' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'"
                >
                  {{ item.suspended === '1' ? 'Suspenso' : 'Ativo' }}
                </span>
              </td>
              <td class="px-4 py-4">
                <div class="flex justify-end gap-2">
                  <RouterLink
                    :to="{ name: 'users-edit', params: { id: item.id } }"
                    class="rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-brand-200 hover:text-brand-700"
                  >
                    Editar
                  </RouterLink>
                  <RouterLink
                    :to="{ name: 'users-delete', params: { id: item.id } }"
                    class="rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                  >
                    Excluir
                  </RouterLink>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p class="text-sm text-slate-500">
            Pagina {{ currentPage }} de {{ totalPages }}
          </p>

          <div class="flex gap-2">
            <button
              type="button"
              class="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-brand-200 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="currentPage === 1"
              @click="goToPreviousPage"
            >
              Anterior
            </button>
            <button
              type="button"
              class="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-brand-200 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="currentPage === totalPages"
              @click="goToNextPage"
            >
              Proxima
            </button>
          </div>
        </div>
      </div>

      <div v-else class="rounded-md border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
        <p class="text-lg font-semibold text-slate-800">Nenhum usuario encontrado</p>
        <p class="mt-2 text-sm text-slate-500">
          {{ searchTerm ? 'Tente ajustar a pesquisa para encontrar outro resultado.' : 'Crie o primeiro registro para comecar o CRUD.' }}
        </p>
      </div>
    </section>
  </section>
</template>
