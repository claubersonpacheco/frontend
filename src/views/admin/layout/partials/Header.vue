<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth'

defineProps<{
  isSidebarOpen: boolean
}>()

const emit = defineEmits<{
  toggleSidebar: []
}>()

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const currentRouteLabel = computed(() => {
  const label =
    typeof route.meta?.title === 'string' && route.meta.title.trim()
      ? route.meta.title
      : route.name

  if (typeof label === 'string' && label.trim()) {
    return label.charAt(0).toUpperCase() + label.slice(1)
  }

  return 'Dashboard'
})

const userName = computed(() => authStore.user?.name ?? 'Usuario')

async function handleLogout() {
  authStore.logout()
  await router.push('/auth/login')
}
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-white/70 bg-white/80 backdrop-blur-xl">
    <div class="px-4 py-4 sm:px-6 lg:px-8">
      <div class="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <button
            type="button"
            class="inline-flex size-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-brand-200 hover:text-brand-700 lg:hidden"
            aria-label="Abrir menu lateral"
            @click="emit('toggleSidebar')"
          >
            <svg class="size-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>

          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.22em] text-brand-700">Painel administrativo</p>
            <h1 class="text-xl font-semibold tracking-tight text-slate-900">{{ currentRouteLabel }}</h1>
          </div>
        </div>

        <div class="hs-dropdown relative inline-flex">
          <button
            id="hs-admin-user-dropdown"
            type="button"
            class="hs-dropdown-toggle inline-flex items-center gap-x-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:border-brand-200 hover:text-brand-700"
            aria-haspopup="menu"
            aria-expanded="false"
            aria-label="Menu do usuario"
          >
            <span class="flex size-10 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700">
              {{ userName.slice(0, 1).toUpperCase() }}
            </span>
            <span class="hidden text-left sm:block">
              <span class="block text-sm font-semibold text-slate-900">{{ userName }}</span>
              <span class="block text-xs text-slate-500">{{ authStore.user?.email }}</span>
            </span>
            <svg class="size-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="m6 9 6 6 6-6" />
            </svg>
          </button>

          <div
            class="hs-dropdown-menu duration z-50 mt-2 hidden min-w-60 rounded-2xl border border-slate-200 bg-white p-2 opacity-0 shadow-xl transition-[opacity,margin] hs-dropdown-open:opacity-100"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="hs-admin-user-dropdown"
          >
            <div class="rounded-xl bg-slate-50 px-3 py-3">
              <p class="text-xs uppercase tracking-[0.18em] text-slate-400">Sessao</p>
              <p class="mt-2 text-sm font-semibold text-slate-900">{{ userName }}</p>
              <p class="mt-1 text-sm text-slate-600">{{ authStore.user?.email }}</p>

              <div class="mt-3 space-y-1">
                <RouterLink
                  :to="{ name: 'profile' }"
                  class="inline-flex w-full items-center gap-x-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-white hover:text-brand-700"
                >
                  <svg class="size-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.5 7.5 0 0 0 12 15.75a7.5 7.5 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                  Editar perfil
                </RouterLink>
                <RouterLink
                  :to="{ name: 'change-password' }"
                  class="inline-flex w-full items-center gap-x-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-white hover:text-brand-700"
                >
                  <svg class="size-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V7a4.5 4.5 0 0 0-9 0v3.5m-.75 0h10.5A1.75 1.75 0 0 1 19 12.25v6A1.75 1.75 0 0 1 17.25 20H6.75A1.75 1.75 0 0 1 5 18.25v-6a1.75 1.75 0 0 1 1.75-1.75Z" />
                  </svg>
                  Trocar senha
                </RouterLink>
                <button
                  type="button"
                  class="inline-flex w-full items-center gap-x-3 rounded-xl px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-white"
                  @click="handleLogout"
                >
                  <svg class="size-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6A2.25 2.25 0 0 0 5.25 5.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0-3-3m3 3-3 3m3-3H9" />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
