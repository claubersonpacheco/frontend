<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const settingsStore = useSettingsStore()

const navigationItems = [
  {
    name: 'dashboard',
    label: 'Dashboard',
    icon: 'dashboard',
  },
  {
    name: 'users',
    label: 'Usuarios',
    icon: 'users',
    permission: 'users.read',
  },
  {
    name: 'videos',
    label: 'Videos',
    icon: 'videos',
    permission: 'videos.read',
  },
  {
    name: 'folders',
    label: 'Folders',
    icon: 'folders',
    permission: 'folders.read',
  },
  {
    name: 'categories',
    label: 'Categorias',
    icon: 'categories',
    permission: 'categories.read',
  },
  {
    name: 'courses',
    label: 'Cursos',
    icon: 'courses',
    permission: 'courses.read',
  },
  {
    name: 'my-courses',
    label: 'Meus cursos',
    icon: 'courses',
  },
] as const

const navigationSetting = [
  {
    name: 'settings',
    label: 'Settings',
    icon: 'settings',
    permission: 'settings.read',
  },
  {
    name: 'roles',
    label: 'Roles',
    icon: 'roles',
    permission: 'roles.read',
  },
  {
    name: 'permissions',
    label: 'Permissoes',
    icon: 'permissions',
    permission: 'permissions.read',
  },
] as const

const iconPaths = {
  dashboard: [
    'M3 13h8V3H3v10Z',
    'M13 21h8V11h-8v10Z',
    'M13 9h8V3h-8v6Z',
    'M3 21h8v-6H3v6Z',
  ],
  users: [
    'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2',
    'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
    'M22 21v-2a4 4 0 0 0-3-3.87',
    'M16 3.13a4 4 0 0 1 0 7.75',
  ],
  roles: [
    'M20 13c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V5l8-3 8 3v8Z',
    'M9 12l2 2 4-5',
  ],
  permissions: [
    'M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.78 7.78 5.5 5.5 0 0 1 7.78-7.78Zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4',
  ],
  videos: [
    'M15 10l4.55-2.27A1 1 0 0 1 21 8.62v6.76a1 1 0 0 1-1.45.89L15 14',
    'M3 6h12v12H3z',
  ],
  folders: [
    'M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z',
  ],
  categories: [
    'M4 5h6v6H4z',
    'M14 5h6v6h-6z',
    'M4 15h6v6H4z',
    'M14 15h6v6h-6z',
  ],
  courses: [
    'M4 19.5A2.5 2.5 0 0 1 6.5 17H20',
    'M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z',
  ],
  settings: [
    'M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Z',
    'M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 8.92 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.14.56.58 1 1.15 1H21a2 2 0 1 1 0 4h-.09A1.65 1.65 0 0 0 19.4 15Z',
  ],
} as const

const userName = computed(() => authStore.user?.name ?? 'Usuario')
const activeSetting = computed(() => settingsStore.items.at(-1) ?? null)
const sidebarLogoUrl = computed(() => activeSetting.value?.logoWhite || activeSetting.value?.logo || '')
const platformName = computed(() => activeSetting.value?.name || 'Gestao IDI')
const visibleNavigationItems = computed(() =>
  navigationItems.filter(
    (item) => !('permission' in item) || authStore.hasPermission(item.permission),
  ),
)
const visibleNavigationSetting = computed(() =>
  navigationSetting.filter((item) => authStore.hasPermission(item.permission)),
)

function isActiveRoute(name: string) {
  if (name === 'users') {
    return typeof route.name === 'string' && route.name.startsWith('users')
  }
  if (name === 'roles') {
    return typeof route.name === 'string' && route.name.startsWith('roles')
  }
  if (name === 'permissions') {
    return typeof route.name === 'string' && route.name.startsWith('permissions')
  }
  if (name === 'settings') {
    return typeof route.name === 'string' && route.name.startsWith('settings')
  }
  if (name === 'videos') {
    return typeof route.name === 'string' && route.name.startsWith('videos')
  }
  if (name === 'folders') {
    return typeof route.name === 'string' && route.name.startsWith('folders')
  }
  if (name === 'categories') {
    return typeof route.name === 'string' && route.name.startsWith('categories')
  }
  if (name === 'courses') {
    return typeof route.name === 'string' && route.name.startsWith('courses')
  }
  if (name === 'my-courses') {
    return route.name === 'my-courses'
  }

  return route.name === name
}

async function handleLogout() {
  authStore.logout()
  emit('close')
  await router.push('/auth/login')
}

function updateFavicon(iconUrl?: string | null) {
  if (!iconUrl) return

  const existingIcon = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
  const icon = existingIcon ?? document.createElement('link')
  icon.rel = 'icon'
  icon.href = iconUrl

  if (!existingIcon) {
    document.head.appendChild(icon)
  }
}

onMounted(async () => {
  if (!authStore.hasPermission('settings.read') || settingsStore.items.length) {
    updateFavicon(activeSetting.value?.logoIcon)
    return
  }

  await settingsStore.fetchSettings().catch(() => undefined)
  updateFavicon(activeSetting.value?.logoIcon)
})
</script>

<template>
  <div
    v-if="props.isOpen"
    class="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm lg:hidden"
    @click="emit('close')"
  />

  <aside
    class="fixed inset-y-0 left-0 z-50 flex w-72 flex-col overflow-hidden border-r border-white/70 bg-[linear-gradient(180deg,_rgba(16,36,24,0.98),_rgba(22,57,38,0.96))] px-5 py-6 text-white shadow-2xl shadow-ink-900/20 transition-transform duration-300 lg:translate-x-0"
    :class="props.isOpen ? 'translate-x-0' : '-translate-x-full'"
  >
    <div class="shrink-0 flex items-start justify-between gap-4">
      <div class="min-w-0 flex-1">
        <div v-if="sidebarLogoUrl" class="flex h-20 w-full items-center justify-start overflow-hidden px-0 py-2">
          <img :src="sidebarLogoUrl" :alt="`Logo ${platformName}`" class="max-h-full max-w-full object-contain" />
        </div>
        <div v-else>
          <p class="text-xs font-semibold uppercase tracking-[0.24em] text-brand-100/75">{{ platformName }}</p>
          <h2 class="mt-2 text-2xl font-semibold tracking-tight">Admin panel</h2>
        </div>
      </div>

      <button
        type="button"
        class="inline-flex size-10 items-center justify-center rounded-md border border-white/10 bg-white/5 text-white transition hover:bg-white/10 lg:hidden"
        aria-label="Fechar menu lateral"
        @click="emit('close')"
      >
        <svg class="size-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <div class="mt-6 min-h-0 flex-1 space-y-6 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
      <nav class="space-y-2">
        <RouterLink
          v-for="item in visibleNavigationItems"
          :key="item.name"
          :to="{ name: item.name }"
          class="group block rounded-md border px-4 py-3 transition"
          :class="isActiveRoute(item.name)
            ? 'border-white/15 bg-white/10 shadow-lg shadow-black/10'
            : 'border-white/0 bg-transparent hover:border-white/10 hover:bg-white/5'"
          @click="emit('close')"
        >
          <div class="flex items-center justify-between gap-3">
            <div class="flex min-w-0 items-center gap-3">
              <span
                class="flex size-9 shrink-0 items-center justify-center rounded-md"
                :class="isActiveRoute(item.name) ? 'bg-white/15 text-white' : 'bg-white/8 text-white/70 group-hover:text-white'"
              >
                <svg class="size-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path v-for="path in iconPaths[item.icon]" :key="path" :d="path" />
                </svg>
              </span>
              <p class="truncate font-medium text-white">{{ item.label }}</p>
            </div>
          </div>
        </RouterLink>
      </nav>

      <nav class="space-y-2 border-t-2 border-white/10 pt-6">
        <RouterLink
          v-for="itemSet in visibleNavigationSetting"
          :key="itemSet.name"
          :to="{ name: itemSet.name }"
          class="group block rounded-md border px-4 py-3 transition"
          :class="isActiveRoute(itemSet.name)
            ? 'border-white/15 bg-white/10 shadow-lg shadow-black/10'
            : 'border-white/0 bg-transparent hover:border-white/10 hover:bg-white/5'"
          @click="emit('close')"
        >
          <div class="flex items-center justify-between gap-3">
            <div class="flex min-w-0 items-center gap-3">
              <span
                class="flex size-9 shrink-0 items-center justify-center rounded-md"
                :class="isActiveRoute(itemSet.name) ? 'bg-white/15 text-white' : 'bg-white/8 text-white/70 group-hover:text-white'"
              >
                <svg class="size-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path v-for="path in iconPaths[itemSet.icon]" :key="path" :d="path" />
                </svg>
              </span>
              <p class="truncate font-medium text-white">{{ itemSet.label }}</p>
            </div>
          </div>
        </RouterLink>
      </nav>
    </div>

    <div class="shrink-0 border-t-2 border-white/10 pt-4">
      <button
        type="button"
        class="inline-flex w-full items-center justify-center rounded-md border border-white/10 bg-white/8 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/14"
        @click="handleLogout"
      >
        Encerrar sessao
      </button>
    </div>
  </aside>
</template>
