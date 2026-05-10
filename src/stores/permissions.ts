import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

export type PermissionRecord = {
  id: number
  name: string
  description: string | null
  createdAt: string
  updatedAt: string
}

function normalizeApiError(message: unknown) {
  if (Array.isArray(message)) return message.join(', ')
  if (typeof message === 'string') return message
  return 'Nao foi possivel concluir a requisicao.'
}

export const usePermissionsStore = defineStore('permissions', () => {
  const authStore = useAuthStore()
  const items = ref<PermissionRecord[]>([])
  const current = ref<PermissionRecord | null>(null)

  function handleUnauthorized() {
    authStore.logout()
    if (window.location.pathname !== '/auth/login') window.location.href = '/auth/login'
  }

  async function parseJsonResponse<T>(response: Response): Promise<T> {
    const payload = (await response.json().catch(() => null)) as { message?: string | string[] } | null

    if (!response.ok) {
      if (response.status === 401) handleUnauthorized()
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

  async function fetchPermissions() {
    const response = await fetch(`${API_BASE_URL}/permissions`, { headers: getAuthHeaders() })
    const payload = await parseJsonResponse<PermissionRecord[]>(response)
    items.value = payload
    return payload
  }

  async function fetchPermissionById(id: number | string) {
    const response = await fetch(`${API_BASE_URL}/permissions/${id}`, { headers: getAuthHeaders() })
    const payload = await parseJsonResponse<PermissionRecord>(response)
    current.value = payload
    return payload
  }

  async function createPermission(payload: { name: string; description?: string }) {
    const response = await fetch(`${API_BASE_URL}/permissions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        name: payload.name.trim(),
        description: payload.description?.trim() || undefined,
      }),
    })

    const created = await parseJsonResponse<PermissionRecord>(response)
    items.value = [...items.value, created].sort((a, b) => a.id - b.id)
    return created
  }

  async function updatePermission(id: number | string, payload: { name?: string; description?: string }) {
    const response = await fetch(`${API_BASE_URL}/permissions/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        ...(payload.name !== undefined ? { name: payload.name.trim() } : {}),
        ...(payload.description !== undefined ? { description: payload.description.trim() } : {}),
      }),
    })

    const updated = await parseJsonResponse<PermissionRecord>(response)
    current.value = updated
    items.value = items.value.map((item) => (item.id === updated.id ? updated : item))
    return updated
  }

  async function deletePermission(id: number | string) {
    const response = await fetch(`${API_BASE_URL}/permissions/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${authStore.accessToken}` },
    })

    if (!response.ok) {
      if (response.status === 401) handleUnauthorized()
      const payload = (await response.json().catch(() => null)) as { message?: string | string[] } | null
      throw new Error(normalizeApiError(payload?.message))
    }

    items.value = items.value.filter((item) => item.id !== Number(id))
  }

  return {
    items,
    current,
    fetchPermissions,
    fetchPermissionById,
    createPermission,
    updatePermission,
    deletePermission,
  }
})
