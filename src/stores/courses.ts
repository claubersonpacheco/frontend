import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useAuthStore } from './auth'
import type { RoleRecord } from './roles'
import type { UserRecord } from './users'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

export type CourseRecord = {
  id: number
  fullname: string
  shortname: string
  mcode: string | null
  summary: string | null
  imageUrl: string | null
  visible: string | null
  isPublic: boolean
  accessType: 'open' | 'private'
  pricingType: 'free' | 'paid'
  price: string | null
  currency: string
  capacityType: 'unlimited' | 'limited'
  capacityLimit: number | null
  paymentMethods: string[] | null
  paymentTerms: 'cash' | 'installments' | 'both'
  maxInstallments: number | null
  bankTransferDetails: string | null
  startdate: string | null
  enddate: string | null
  enrollmentCount: number
  category: {
    id: number
    name: string
  }
  createdAt: string
  updatedAt: string
}

export type CourseEnrollmentRecord = {
  id: number
  course: CourseRecord
  user: UserRecord
  role: RoleRecord
  status: 'active' | 'pending_payment'
  paymentMethod: 'pix' | 'boleto' | 'card' | 'bank_transfer' | 'cash_in_person' | null
  paymentTerm: 'cash' | 'installments' | null
  installments: number | null
  amountDue: string | null
  paidAt: string | null
  pixTxid: string | null
  pixCopyPaste: string | null
  pixExpiresAt: string | null
  pixCallbackPayload: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
}

type MoodleLoginUrlResponse = {
  url: string
}

function normalizeApiError(message: unknown) {
  if (Array.isArray(message)) return message.join(', ')
  if (typeof message === 'string') return message
  return 'Nao foi possivel concluir a requisicao.'
}

export const useCoursesStore = defineStore('courses', () => {
  const authStore = useAuthStore()
  const items = ref<CourseRecord[]>([])
  const current = ref<CourseRecord | null>(null)
  const enrollments = ref<CourseEnrollmentRecord[]>([])
  const myEnrollments = ref<CourseEnrollmentRecord[]>([])

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

  async function fetchCourses() {
    const response = await fetch(`${API_BASE_URL}/courses`, { headers: getAuthHeaders() })
    const payload = await parseJsonResponse<CourseRecord[]>(response)
    items.value = payload
    return payload
  }

  async function fetchCourseById(id: number | string) {
    const response = await fetch(`${API_BASE_URL}/courses/${id}`, { headers: getAuthHeaders() })
    const payload = await parseJsonResponse<CourseRecord>(response)
    current.value = payload
    return payload
  }

  async function createCourse(payload: {
    fullname: string
    shortname: string
    mcode?: string
    summary?: string
    imageUrl?: string
    visible?: string
    isPublic?: string
    accessType?: 'open' | 'private'
    pricingType?: 'free' | 'paid'
    price?: number
    capacityType?: 'unlimited' | 'limited'
    capacityLimit?: number
    paymentMethods?: string[]
    paymentTerms?: 'cash' | 'installments' | 'both'
    maxInstallments?: number
    bankTransferDetails?: string
    startdate?: string
    enddate?: string
    categoryId: number
  }) {
    const response = await fetch(`${API_BASE_URL}/courses`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    })

    const created = await parseJsonResponse<CourseRecord>(response)
    items.value = [...items.value, created]
    return created
  }

  async function updateCourse(id: number | string, payload: Record<string, unknown>) {
    const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    })

    const updated = await parseJsonResponse<CourseRecord>(response)
    current.value = updated
    items.value = items.value.map((item) => (item.id === updated.id ? updated : item))
    return updated
  }

  async function uploadCourseImage(id: number | string, file: File) {
    if (!authStore.accessToken) throw new Error('Sessao expirada. Faca login novamente.')

    const formData = new FormData()
    formData.append('image', file)

    const response = await fetch(`${API_BASE_URL}/courses/${id}/image`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authStore.accessToken}`,
      },
      body: formData,
    })

    const updated = await parseJsonResponse<CourseRecord>(response)
    current.value = updated
    items.value = items.value.map((item) => (item.id === updated.id ? updated : item))
    return updated
  }

  async function deleteCourse(id: number | string) {
    const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
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

  async function fetchEnrollments(courseId: number | string) {
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}/enrollments`, {
      headers: getAuthHeaders(),
    })
    const payload = await parseJsonResponse<CourseEnrollmentRecord[]>(response)
    enrollments.value = payload
    return payload
  }

  async function fetchMyEnrollments() {
    const response = await fetch(`${API_BASE_URL}/courses/my/enrollments`, {
      headers: getAuthHeaders(),
    })
    const payload = await parseJsonResponse<CourseEnrollmentRecord[]>(response)
    myEnrollments.value = payload
    return payload
  }

  async function fetchMoodleLoginUrl(courseId: number | string) {
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}/moodle-login-url`, {
      headers: getAuthHeaders(),
    })
    const payload = await parseJsonResponse<MoodleLoginUrlResponse>(response)
    return payload.url
  }

  async function enrollUser(courseId: number | string, payload: { userId: number; roleId: number }) {
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}/enrollments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    })
    const enrollment = await parseJsonResponse<CourseEnrollmentRecord>(response)
    enrollments.value = [...enrollments.value, enrollment].sort((a, b) => a.id - b.id)
    return enrollment
  }

  async function unenrollUser(courseId: number | string, enrollmentId: number | string) {
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}/enrollments/${enrollmentId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${authStore.accessToken}` },
    })

    if (!response.ok) {
      if (response.status === 401) handleUnauthorized()
      const payload = (await response.json().catch(() => null)) as { message?: string | string[] } | null
      throw new Error(normalizeApiError(payload?.message))
    }

    enrollments.value = enrollments.value.filter((item) => item.id !== Number(enrollmentId))
  }

  async function approveEnrollmentPayment(courseId: number | string, enrollmentId: number | string) {
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}/enrollments/${enrollmentId}/approve-payment`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    })

    const enrollment = await parseJsonResponse<CourseEnrollmentRecord>(response)
    enrollments.value = enrollments.value.map((item) =>
      item.id === enrollment.id ? enrollment : item,
    )
    return enrollment
  }

  return {
    items,
    current,
    enrollments,
    myEnrollments,
    fetchCourses,
    fetchCourseById,
    fetchEnrollments,
    fetchMoodleLoginUrl,
    fetchMyEnrollments,
    createCourse,
    updateCourse,
    uploadCourseImage,
    deleteCourse,
    enrollUser,
    unenrollUser,
    approveEnrollmentPayment,
  }
})
