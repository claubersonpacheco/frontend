import { ref } from 'vue'
import { defineStore } from 'pinia'

import { useAuthStore } from './auth'
import type { RoleRecord } from './roles'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

export type UserRecord = {
  id: number
  username: string
  email: string
  name: string
  lastname: string
  suspended: string
  moodleUserId: number | null
  role: RoleRecord | null
}

export type UserFormPayload = {
  username: string
  name: string
  lastname?: string
  suspended?: string
  email?: string
  password?: string
  roleId?: number | null
}

function normalizeApiError(message: unknown) {
  if (Array.isArray(message)) {
    return message.join(', ')
  }

  if (typeof message === 'string') {
    return message
  }

  return 'Nao foi possivel concluir a requisicao.'
}

function normalizeUserPayload(
  payload: UserFormPayload,
  requirePassword: boolean,
  requireEmail = true,
) {
  if (!payload.username.trim()) {
    throw new Error('Informe o username.')
  }

  if (!payload.name.trim()) {
    throw new Error('Informe o nome.')
  }

  if (requireEmail && !payload.email?.trim()) {
    throw new Error('Informe o e-mail.')
  }

  if (requirePassword && !payload.password?.trim()) {
    throw new Error('Informe a senha.')
  }

  return {
    username: payload.username.trim(),
    name: payload.name.trim(),
    lastname: payload.lastname?.trim() || undefined,
    suspended: payload.suspended === '1' ? '1' : '0',
    roleId: payload.roleId ?? undefined,
    ...(payload.email !== undefined
      ? { email: payload.email.trim().toLowerCase() }
      : {}),
    ...(payload.password?.trim() ? { password: payload.password } : {}),
  }
}

export const useUsersStore = defineStore('users', () => {
  const authStore = useAuthStore()
  const items = ref<UserRecord[]>([])
  const current = ref<UserRecord | null>(null)
  const isLoading = ref(false)

  function handleUnauthorized() {
    authStore.logout()
    if (window.location.pathname !== '/auth/login') {
      window.location.href = '/auth/login'
    }
  }

  async function parseJsonResponse<T>(response: Response): Promise<T> {
    const payload = (await response.json().catch(() => null)) as
      | { message?: string | string[] }
      | null

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

  async function fetchUsers() {
    isLoading.value = true

    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        headers: getAuthHeaders(),
      })

      const payload = await parseJsonResponse<UserRecord[]>(response)
      items.value = payload
      return payload
    } finally {
      isLoading.value = false
    }
  }

  async function fetchUserById(id: number | string) {
    isLoading.value = true

    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        headers: getAuthHeaders(),
      })

      const payload = await parseJsonResponse<UserRecord>(response)
      current.value = payload
      return payload
    } finally {
      isLoading.value = false
    }
  }

  async function createUser(payload: UserFormPayload) {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(normalizeUserPayload(payload, true)),
    })

    const createdUser = await parseJsonResponse<UserRecord>(response)
    items.value = [createdUser, ...items.value]
    return createdUser
  }

  async function updateUser(id: number | string, payload: UserFormPayload) {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(normalizeUserPayload(payload, false, false)),
    })

    const updatedUser = await parseJsonResponse<UserRecord>(response)
    current.value = updatedUser
    items.value = items.value.map((item) =>
      item.id === updatedUser.id ? updatedUser : item,
    )
    return updatedUser
  }

  async function deleteUser(id: number | string) {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${authStore.accessToken}`,
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        handleUnauthorized()
      }

      const payload = (await response.json().catch(() => null)) as
        | { message?: string | string[] }
        | null
      throw new Error(normalizeApiError(payload?.message))
    }

    items.value = items.value.filter((item) => item.id !== Number(id))

    if (current.value?.id === Number(id)) {
      current.value = null
    }
  }

  return {
    createUser,
    current,
    deleteUser,
    fetchUserById,
    fetchUsers,
    isLoading,
    items,
    updateUser,
  }
})
