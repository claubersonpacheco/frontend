import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

export type VideoRecord = {
  id: number
  name: string
  guid: string | null
  videoLibraryId: string | null
  filePath: string | null
  collection: string | null
  description: string | null
  type: string | null
  thumbnail: string | null
  folder: {
    id: number
    name: string
  }
  createdAt: string
  updatedAt: string
}

export type InitVideoUploadPayload = {
  name: string
  folderId: number
  fileType: string
  filePath?: string
  collection?: string
  description?: string
  type?: string
  thumbnail?: string
}

export type InitVideoUploadResponse = {
  video: VideoRecord
  tus: {
    endpoint: string
    authorizationSignature: string
    authorizationExpire: number
    libraryId: string
    videoId: string
  }
}

function normalizeApiError(message: unknown) {
  if (Array.isArray(message)) return message.join(', ')
  if (typeof message === 'string') return message
  return 'Nao foi possivel concluir a requisicao.'
}

export const useVideosStore = defineStore('videos', () => {
  const authStore = useAuthStore()
  const items = ref<VideoRecord[]>([])
  const current = ref<VideoRecord | null>(null)
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

  async function fetchVideos() {
    isLoading.value = true
    try {
      const response = await fetch(`${API_BASE_URL}/videos`, { headers: getAuthHeaders() })
      const payload = await parseJsonResponse<VideoRecord[]>(response)
      items.value = payload
      return payload
    } finally {
      isLoading.value = false
    }
  }

  async function fetchVideoById(id: number | string) {
    const response = await fetch(`${API_BASE_URL}/videos/${id}`, { headers: getAuthHeaders() })
    const payload = await parseJsonResponse<VideoRecord>(response)
    current.value = payload
    return payload
  }

  async function initUpload(payload: InitVideoUploadPayload) {
    const response = await fetch(`${API_BASE_URL}/videos/init-upload`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    })

    const result = await parseJsonResponse<InitVideoUploadResponse>(response)
    items.value = [result.video, ...items.value]
    return result
  }

  async function completeUpload(id: number | string, guid?: string) {
    const response = await fetch(`${API_BASE_URL}/videos/${id}/complete`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ guid }),
    })

    const updatedVideo = await parseJsonResponse<VideoRecord>(response)
    current.value = updatedVideo
    items.value = items.value.map((item) => (item.id === updatedVideo.id ? updatedVideo : item))
    return updatedVideo
  }

  async function updateVideo(id: number | string, payload: { name?: string; folderId?: number }) {
    const response = await fetch(`${API_BASE_URL}/videos/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    })

    const updatedVideo = await parseJsonResponse<VideoRecord>(response)
    current.value = updatedVideo
    items.value = items.value.map((item) => (item.id === updatedVideo.id ? updatedVideo : item))
    return updatedVideo
  }

  async function deleteVideo(id: number | string) {
    const response = await fetch(`${API_BASE_URL}/videos/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    })

    await parseJsonResponse<{ message: string }>(response)
    items.value = items.value.filter((item) => item.id !== Number(id))

    if (current.value?.id === Number(id)) {
      current.value = null
    }
  }

  return {
    items,
    current,
    isLoading,
    fetchVideos,
    fetchVideoById,
    initUpload,
    completeUpload,
    updateVideo,
    deleteVideo,
  }
})
