import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export type CategoryRecord = {
  id: number
  name: string
  mcode: number | null
  description: string | null
  createdAt: string
  updatedAt: string
}

function normalizeApiError(message: unknown) {
  if (Array.isArray(message)) return message.join(', ')
  if (typeof message === 'string') return message
  return 'Nao foi possivel concluir a requisicao.'
}

export const useCategoriesStore = defineStore('categories', () => {
  const authStore = useAuthStore()
  const items = ref<CategoryRecord[]>([])
  const current = ref<CategoryRecord | null>(null)

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

  async function fetchCategories() {
    const response = await fetch(`${API_BASE_URL}/categories`, { headers: getAuthHeaders() })
    const payload = await parseJsonResponse<CategoryRecord[]>(response)
    items.value = payload
    return payload
  }

  async function fetchCategoryById(id: number | string) {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, { headers: getAuthHeaders() })
    const payload = await parseJsonResponse<CategoryRecord>(response)
    current.value = payload
    return payload
  }

  async function createCategory(payload: { name: string; mcode?: number | null; description?: string }) {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        name: payload.name.trim(),
        mcode: payload.mcode ?? undefined,
        description: payload.description?.trim() || undefined,
      }),
    })

    const created = await parseJsonResponse<CategoryRecord>(response)
    items.value = [...items.value, created].sort((a, b) => a.id - b.id)
    return created
  }

  async function updateCategory(id: number | string, payload: { name?: string; mcode?: number | null; description?: string }) {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        ...(payload.name !== undefined ? { name: payload.name.trim() } : {}),
        ...(payload.mcode !== undefined ? { mcode: payload.mcode } : {}),
        ...(payload.description !== undefined ? { description: payload.description.trim() } : {}),
      }),
    })

    const updated = await parseJsonResponse<CategoryRecord>(response)
    current.value = updated
    items.value = items.value.map((item) => (item.id === updated.id ? updated : item))
    return updated
  }

  async function deleteCategory(id: number | string) {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
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
    fetchCategories,
    fetchCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
  }
})
