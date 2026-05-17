import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { CourseEnrollmentRecord } from './courses'

const AUTH_STORAGE_KEY = 'gestao-idi.auth'
const AUTH_TOKEN_STORAGE_KEY = 'gestao-idi.token'
const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

type AuthUser = {
  id: number
  username: string
  email: string
  name: string
  lastname: string
  suspended: string
  photoUrl: string | null
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
  email: string
  password: string
}

type UpdateProfilePayload = {
  username: string
  name: string
  lastname?: string
  email: string
}

type LoginResponse = {
  accessToken: string
  user: AuthUser
}

type PublicCourseAccessResponse = LoginResponse & {
  enrollmentStatus?: 'active' | 'pending_payment'
  enrollment?: CourseEnrollmentRecord
}

type PublicCourseRegisterPayload = {
  username: string
  name: string
  lastname?: string
  email: string
  password: string
  paymentMethod?: 'pix' | 'boleto' | 'card' | 'bank_transfer' | 'cash_in_person'
  paymentTerm?: 'cash' | 'installments'
  installments?: number
}

type PublicCourseLoginPayload = {
  identifier: string
  password: string
  paymentMethod?: 'pix' | 'boleto' | 'card' | 'bank_transfer' | 'cash_in_person'
  paymentTerm?: 'cash' | 'installments'
  installments?: number
}

type ChangePasswordPayload = {
  currentPassword: string
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
        paymentMethod: payload.paymentMethod,
        paymentTerm: payload.paymentTerm,
        installments: payload.installments,
      }),
    })

    const nextSession = await parseJsonResponse<PublicCourseAccessResponse>(response)
    persistSession(nextSession.user, nextSession.accessToken)
    return nextSession
  }

  async function loginForPublicCourse(slug: string, payload: PublicCourseLoginPayload) {
    if (!payload.identifier.trim() || !payload.password.trim()) {
      throw new Error('Informe username ou e-mail e senha para continuar.')
    }

    const response = await fetch(`${API_BASE_URL}/auth/public-courses/${slug}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier: payload.identifier.trim(),
        password: payload.password,
        paymentMethod: payload.paymentMethod,
        paymentTerm: payload.paymentTerm,
        installments: payload.installments,
      }),
    })

    const nextSession = await parseJsonResponse<PublicCourseAccessResponse>(response)
    persistSession(nextSession.user, nextSession.accessToken)
    return nextSession
  }

  async function requestPasswordReset(email: string) {
    if (!email.trim()) {
      throw new Error('Informe seu e-mail para recuperar a senha.')
    }

    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
      }),
    })

    await parseJsonResponse<unknown>(response)
  }

  async function resetPassword(token: string, password: string) {
    if (!token.trim()) {
      throw new Error('Link de recuperacao invalido ou expirado.')
    }

    if (!password.trim()) {
      throw new Error('Informe a nova senha.')
    }

    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: token.trim(),
        password,
      }),
    })

    await parseJsonResponse<unknown>(response)
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
        ...(hasPermission('user.email')
          ? { email: payload.email.trim().toLowerCase() }
          : {}),
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

  async function uploadProfilePhoto(file: File) {
    if (!user.value || !accessToken.value) {
      throw new Error('Nenhum usuario autenticado para atualizar.')
    }

    const formData = new FormData()
    formData.append('photo', file)

    const response = await fetch(`${API_BASE_URL}/users/${user.value.id}/photo`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken.value}`,
      },
      body: formData,
    })

    if (response.status === 401) {
      clearSession()
      redirectToLoginIfNeeded()
      throw new Error('Sessao expirada. Faca login novamente.')
    }

    const nextProfile = await parseJsonResponse<AuthUser>(response)
    persistSession(nextProfile, accessToken.value)
  }

  async function changePassword(payload: ChangePasswordPayload) {
    if (!accessToken.value) {
      throw new Error('Sessao expirada. Faca login novamente.')
    }

    if (!payload.currentPassword.trim()) {
      throw new Error('Informe a senha atual.')
    }

    if (!payload.password.trim()) {
      throw new Error('Informe a nova senha.')
    }

    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken.value}`,
      },
      body: JSON.stringify({
        currentPassword: payload.currentPassword,
        password: payload.password,
      }),
    })

    if (response.status === 401) {
      clearSession()
      redirectToLoginIfNeeded()
      throw new Error('Sessao expirada. Faca login novamente.')
    }

    await parseJsonResponse<unknown>(response)
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
    changePassword,
    hasAnyPermission,
    hasPermission,
    isAuthenticated,
    isMaster,
    login,
    loginForPublicCourse,
    register,
    registerForPublicCourse,
    requestPasswordReset,
    resetPassword,
    restoreSession,
    updateProfile,
    uploadProfilePhoto,
    logout,
    user,
  }
})
