import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

const AUTH_STORAGE_KEY = 'gestao-idi.auth'
const AUTH_TOKEN_STORAGE_KEY = 'gestao-idi.token'
const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

type AuthUser = {
  id: number
  username: string
  email: string
  name: string
  lastname: string
  suspended: string
  role: {
    id: number
    name: string
    permissions: {
      id: number
      name: string
    }[]
  } | null
}

type RegisterPayload = {
  username: string
  name: string
  lastname?: string
  suspended?: string
  email: string
  password: string
}

type UpdateProfilePayload = {
  username: string
  name: string
  lastname?: string
  suspended?: string
  email: string
}

type LoginResponse = {
  accessToken: string
  user: AuthUser
}

type PublicCourseRegisterPayload = {
  username: string
  name: string
  lastname?: string
  email: string
  password: string
}

function readStoredUser() {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY)

  if (!raw) return null

  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    return null
  }
}

function readStoredToken() {
  return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
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

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => null)) as
    | { message?: string | string[] }
    | null

  if (!response.ok) {
    throw new Error(normalizeApiError(payload?.message))
  }

  return payload as T
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(readStoredUser())
  const accessToken = ref<string | null>(readStoredToken())
  const isAuthenticated = computed(
    () => user.value !== null && accessToken.value !== null,
  )
  const isMaster = computed(() => user.value?.role?.name.toLowerCase() === 'master')

  function hasPermission(permission: string) {
    if (isMaster.value) return true
    return (
      user.value?.role?.permissions.some((item) => item.name === permission) ??
      false
    )
  }

  function hasAnyPermission(permissions: string[]) {
    if (!permissions.length) return true
    return permissions.some((permission) => hasPermission(permission))
  }

  function persistSession(nextUser: AuthUser, nextToken: string) {
    user.value = nextUser
    accessToken.value = nextToken
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextUser))
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, nextToken)
  }

  function clearSession() {
    user.value = null
    accessToken.value = null
    localStorage.removeItem(AUTH_STORAGE_KEY)
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
  }

  function redirectToLoginIfNeeded() {
    if (window.location.pathname !== '/auth/login') {
      window.location.href = '/auth/login'
    }
  }

  async function login(identifier: string, password: string) {
    if (!identifier.trim() || !password.trim()) {
      throw new Error('Informe username ou e-mail e senha para continuar.')
    }

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier: identifier.trim(),
        password,
      }),
    })

    const payload = await parseJsonResponse<LoginResponse>(response)
    persistSession(payload.user, payload.accessToken)
  }

  async function register(payload: RegisterPayload) {
    if (!payload.username.trim()) {
      throw new Error('Informe o username.')
    }

    if (!payload.name.trim()) {
      throw new Error('Informe o nome.')
    }

    if (!payload.email.trim()) {
      throw new Error('Informe o e-mail.')
    }

    if (!payload.password.trim()) {
      throw new Error('Informe a senha.')
    }

    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: payload.username.trim(),
        name: payload.name.trim(),
        lastname: payload.lastname?.trim() || undefined,
        suspended: payload.suspended === '1' ? '1' : '0',
        email: payload.email.trim().toLowerCase(),
        password: payload.password,
      }),
    })

    await parseJsonResponse<AuthUser>(response)
    await login(payload.username.trim(), payload.password)
  }

  async function registerForPublicCourse(slug: string, payload: PublicCourseRegisterPayload) {
    const response = await fetch(`${API_BASE_URL}/auth/public-courses/${slug}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: payload.username.trim(),
        name: payload.name.trim(),
        lastname: payload.lastname?.trim() || undefined,
        email: payload.email.trim().toLowerCase(),
        password: payload.password,
      }),
    })

    const nextSession = await parseJsonResponse<LoginResponse>(response)
    persistSession(nextSession.user, nextSession.accessToken)
  }

  async function updateProfile(payload: UpdateProfilePayload) {
    if (!user.value || !accessToken.value) {
      throw new Error('Nenhum usuario autenticado para atualizar.')
    }

    if (!payload.username.trim()) {
      throw new Error('Informe o username.')
    }

    if (!payload.name.trim()) {
      throw new Error('Informe o nome.')
    }

    if (!payload.email.trim()) {
      throw new Error('Informe o e-mail.')
    }

    const response = await fetch(`${API_BASE_URL}/users/${user.value.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken.value}`,
      },
      body: JSON.stringify({
        username: payload.username.trim(),
        name: payload.name.trim(),
        lastname: payload.lastname?.trim() || undefined,
        ...(isMaster.value
          ? { suspended: payload.suspended === '1' ? '1' : '0' }
          : {}),
        email: payload.email.trim().toLowerCase(),
      }),
    })

    if (response.status === 401) {
      clearSession()
      redirectToLoginIfNeeded()
      throw new Error('Sessao expirada. Faca login novamente.')
    }

    const nextProfile = await parseJsonResponse<AuthUser>(response)
    persistSession(nextProfile, accessToken.value)
  }

  async function restoreSession() {
    if (!accessToken.value) {
      clearSession()
      return
    }

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${accessToken.value}`,
      },
    }).catch(() => null)

    if (!response) {
      clearSession()
      return
    }

    try {
      const nextUser = await parseJsonResponse<AuthUser>(response)
      persistSession(nextUser, accessToken.value)
    } catch {
      clearSession()
      redirectToLoginIfNeeded()
    }
  }

  function logout() {
    clearSession()
  }

  return {
    accessToken,
    hasAnyPermission,
    hasPermission,
    isAuthenticated,
    isMaster,
    login,
    register,
    registerForPublicCourse,
    restoreSession,
    updateProfile,
    logout,
    user,
  }
})
