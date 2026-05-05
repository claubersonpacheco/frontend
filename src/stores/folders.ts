import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export type FolderRecord = {
  id: number
  name: string
  createdAt: string
  updatedAt: string
}

function normalizeApiError(message: unknown) {
  if (Array.isArray(message)) return message.join(', ')
  if (typeof message === 'string') return message
  return 'Nao foi possivel concluir a requisicao.'
}

export const useFoldersStore = defineStore('folders', () => {
  const authStore = useAuthStore()
  const items = ref<FolderRecord[]>([])
  const current = ref<FolderRecord | null>(null)
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
    if (!authStore.accessToken) throw new Error('Sessao expirada. Faca login novamente.')

    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authStore.accessToken}`,
    }
  }

  async function fetchFolders() {
    isLoading.value = true
    try {
      const response = await fetch(`${API_BASE_URL}/folders`, { headers: getAuthHeaders() })
      const payload = await parseJsonResponse<FolderRecord[]>(response)
      items.value = payload
      return payload
    } finally {
      isLoading.value = false
    }
  }

  async function fetchFolderById(id: number | string) {
    const response = await fetch(`${API_BASE_URL}/folders/${id}`, { headers: getAuthHeaders() })
    const payload = await parseJsonResponse<FolderRecord>(response)
    current.value = payload
    return payload
  }

  async function createFolder(name: string) {
    const response = await fetch(`${API_BASE_URL}/folders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name: name.trim() }),
    })

    const created = await parseJsonResponse<FolderRecord>(response)
    items.value = [...items.value, created].sort((a, b) => a.id - b.id)
    return created
  }

  async function updateFolder(id: number | string, name: string) {
    const response = await fetch(`${API_BASE_URL}/folders/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name: name.trim() }),
    })

    const updated = await parseJsonResponse<FolderRecord>(response)
    current.value = updated
    items.value = items.value.map((item) => (item.id === updated.id ? updated : item))
    return updated
  }

  async function deleteFolder(id: number | string) {
    const response = await fetch(`${API_BASE_URL}/folders/${id}`, {
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
    fetchFolders,
    fetchFolderById,
    createFolder,
    updateFolder,
    deleteFolder,
  }
})
