import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useAuthStore } from './auth'
import type { PermissionRecord } from './permissions'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

export type RoleRecord = {
  id: number
  name: string
  description: string | null
  moodleRoleId: number | null
  permissions: PermissionRecord[]
  createdAt: string
  updatedAt: string
}

export type RoleFormPayload = {
  name: string
  description?: string
  moodleRoleId?: number | null
  permissionIds?: number[]
}

function normalizeApiError(message: unknown) {
  if (Array.isArray(message)) return message.join(', ')
  if (typeof message === 'string') return message
  return 'Nao foi possivel concluir a requisicao.'
}

export const useRolesStore = defineStore('roles', () => {
  const authStore = useAuthStore()
  const items = ref<RoleRecord[]>([])
  const current = ref<RoleRecord | null>(null)

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

  function normalizeRolePayload(payload: RoleFormPayload) {
    return {
      name: payload.name.trim(),
      description: payload.description?.trim() || undefined,
      moodleRoleId: payload.moodleRoleId,
      permissionIds: (payload.permissionIds ?? [])
        .map((permissionId) => Number(permissionId))
        .filter((permissionId) => Number.isInteger(permissionId)),
    }
  }

  async function fetchRoles() {
    const response = await fetch(`${API_BASE_URL}/roles`, { headers: getAuthHeaders() })
    const payload = await parseJsonResponse<RoleRecord[]>(response)
    items.value = payload
    return payload
  }

  async function fetchRoleById(id: number | string) {
    const response = await fetch(`${API_BASE_URL}/roles/${id}`, { headers: getAuthHeaders() })
    const payload = await parseJsonResponse<RoleRecord>(response)
    current.value = payload
    return payload
  }

  async function createRole(payload: RoleFormPayload) {
    const response = await fetch(`${API_BASE_URL}/roles`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(normalizeRolePayload(payload)),
    })

    const created = await parseJsonResponse<RoleRecord>(response)
    items.value = [...items.value, created].sort((a, b) => a.id - b.id)
    return created
  }

  async function updateRole(id: number | string, payload: RoleFormPayload) {
    const response = await fetch(`${API_BASE_URL}/roles/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(normalizeRolePayload(payload)),
    })

    const updated = await parseJsonResponse<RoleRecord>(response)
    current.value = updated
    items.value = items.value.map((item) => (item.id === updated.id ? updated : item))
    return updated
  }

  async function deleteRole(id: number | string) {
    const response = await fetch(`${API_BASE_URL}/roles/${id}`, {
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
    fetchRoles,
    fetchRoleById,
    createRole,
    updateRole,
    deleteRole,
  }
})
