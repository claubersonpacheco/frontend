import { ref } from 'vue'
import { defineStore } from 'pinia'

import { useAuthStore } from './auth'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export type SettingRecord = {
  id: number
  name: string | null
  logo: string | null
  streamLibraryId: string | null
  streamApiKey: string | null
  streamUserApiKey: string | null
  moodleToken: string | null
  moodleUrl: string | null
  bunnyStorageZoneName: string | null
  bunnyStorageAccessKey: string | null
  bunnyStorageCdnDomain: string | null
  bunnyStorageBaseUrl: string | null
  bunnyStorageUserFolder: string | null
  bunnyStorageVideoFolder: string | null
  bunnyStorageLogoFolder: string | null
  createdAt: string
  updatedAt: string
}

export type SettingFormPayload = {
  name?: string
  logo?: string
  streamLibraryId?: string
  streamApiKey?: string
  streamUserApiKey?: string
  moodleToken?: string
  moodleUrl?: string
  bunnyStorageZoneName?: string
  bunnyStorageAccessKey?: string
  bunnyStorageCdnDomain?: string
  bunnyStorageBaseUrl?: string
  bunnyStorageUserFolder?: string
  bunnyStorageVideoFolder?: string
  bunnyStorageLogoFolder?: string
}

function normalizeApiError(message: unknown) {
  if (Array.isArray(message)) return message.join(', ')
  if (typeof message === 'string') return message
  return 'Nao foi possivel concluir a requisicao.'
}

function normalizeSettingPayload(payload: SettingFormPayload) {
  const entries = Object.entries(payload).map(([key, value]) => [key, value?.trim() || undefined])
  return Object.fromEntries(entries)
}

export const useSettingsStore = defineStore('settings', () => {
  const authStore = useAuthStore()
  const items = ref<SettingRecord[]>([])
  const current = ref<SettingRecord | null>(null)
  const isLoading = ref(false)

  function handleUnauthorized() {
    authStore.logout()
    if (window.location.pathname !== '/auth/login') {
      window.location.href = '/auth/login'
    }
  }

  async function parseJsonResponse<T>(response: Response): Promise<T> {
    const payload = (await response.json().catch(() => null)) as { message?: string | string[] } | null

    if (!response.ok) {
      if (response.status === 401) {
        handleUnauthorized()
      }

      throw new Error(normalizeApiError(payload?.message))
    }

    return payload as T
  }

  function getAuthHeaders() {
    if (!authStore.accessToken) {
      throw new Error('Sessao expirada. Faca login novamente.')
    }

    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authStore.accessToken}`,
    }
  }

  async function fetchSettings() {
    isLoading.value = true
    try {
      const response = await fetch(`${API_BASE_URL}/settings`, { headers: getAuthHeaders() })
      const payload = await parseJsonResponse<SettingRecord[]>(response)
      items.value = payload
      return payload
    } finally {
      isLoading.value = false
    }
  }

  async function fetchSettingById(id: number | string) {
    isLoading.value = true
    try {
      const response = await fetch(`${API_BASE_URL}/settings/${id}`, { headers: getAuthHeaders() })
      const payload = await parseJsonResponse<SettingRecord>(response)
      current.value = payload
      return payload
    } finally {
      isLoading.value = false
    }
  }

  async function createSetting(payload: SettingFormPayload) {
    const response = await fetch(`${API_BASE_URL}/settings`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(normalizeSettingPayload(payload)),
    })

    const createdSetting = await parseJsonResponse<SettingRecord>(response)
    items.value = [createdSetting, ...items.value]
    return createdSetting
  }

  async function updateSetting(id: number | string, payload: SettingFormPayload) {
    const response = await fetch(`${API_BASE_URL}/settings/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(normalizeSettingPayload(payload)),
    })

    const updatedSetting = await parseJsonResponse<SettingRecord>(response)
    current.value = updatedSetting
    items.value = items.value.map((item) => (item.id === updatedSetting.id ? updatedSetting : item))
    return updatedSetting
  }

  async function deleteSetting(id: number | string) {
    const response = await fetch(`${API_BASE_URL}/settings/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${authStore.accessToken}` },
    })

    if (!response.ok) {
      if (response.status === 401) {
        handleUnauthorized()
      }

      const payload = (await response.json().catch(() => null)) as { message?: string | string[] } | null
      throw new Error(normalizeApiError(payload?.message))
    }

    items.value = items.value.filter((item) => item.id !== Number(id))
    if (current.value?.id === Number(id)) current.value = null
  }

  return {
    items,
    current,
    isLoading,
    fetchSettings,
    fetchSettingById,
    createSetting,
    updateSetting,
    deleteSetting,
  }
})
