<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import * as tus from 'tus-js-client'
import { useFoldersStore } from '@/stores/folders'
import { useVideosStore } from '@/stores/videos'

const router = useRouter()
const videosStore = useVideosStore()
const foldersStore = useFoldersStore()
const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const uploadProgress = ref(0)
const isSubmitting = ref(false)
const errorMessage = ref('')

const form = reactive({
  name: '',
  folderId: 1,
  filePath: '',
  collection: '',
  description: '',
  type: 'video/mp4',
  thumbnail: '',
})

function onSelectFile(event: Event) {
  const input = event.target as HTMLInputElement
  selectedFile.value = input.files?.[0] ?? null

  if (selectedFile.value && !form.name.trim()) {
    form.name = selectedFile.value.name.replace(/\.[^/.]+$/, '')
  }
}

async function loadFolders() {
  errorMessage.value = ''
  try {
    await foldersStore.fetchFolders()
    const firstFolder = foldersStore.items[0]
    if (firstFolder && !foldersStore.items.some((item) => item.id === form.folderId)) {
      form.folderId = firstFolder.id
    }
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Nao foi possivel carregar as pastas.'
  }
}

async function handleUpload() {
  errorMessage.value = ''

  if (!selectedFile.value) {
    errorMessage.value = 'Selecione um arquivo de video.'
    return
  }

  if (!form.name.trim()) {
    errorMessage.value = 'Informe o nome do video.'
    return
  }

  isSubmitting.value = true
  uploadProgress.value = 0

  try {
    const initPayload = await videosStore.initUpload({
      name: form.name.trim(),
      folderId: Number(form.folderId),
      fileType: selectedFile.value.type || form.type || 'video/mp4',
      filePath: form.filePath.trim() || undefined,
      collection: form.collection.trim() || undefined,
      description: form.description.trim() || undefined,
      type: form.type.trim() || undefined,
      thumbnail: form.thumbnail.trim() || undefined,
    })

    await new Promise<void>((resolve, reject) => {
      const upload = new tus.Upload(selectedFile.value as File, {
        endpoint: initPayload.tus.endpoint,
        retryDelays: [0, 3000, 5000, 10000, 20000, 60000, 60000],
        headers: {
          AuthorizationSignature: initPayload.tus.authorizationSignature,
          AuthorizationExpire: String(initPayload.tus.authorizationExpire),
          LibraryId: initPayload.tus.libraryId,
          VideoId: initPayload.tus.videoId,
        },
        metadata: {
          filetype: selectedFile.value?.type || form.type || 'video/mp4',
          title: form.name.trim(),
          ...(form.collection.trim() ? { collection: form.collection.trim() } : {}),
        },
        chunkSize: 8 * 1024 * 1024,
        onError: (error) => reject(error),
        onProgress: (bytesUploaded, bytesTotal) => {
          uploadProgress.value = Math.floor((bytesUploaded / bytesTotal) * 100)
        },
        onSuccess: () => resolve(),
      })

      upload.start()
    })

    await videosStore.completeUpload(initPayload.video.id, initPayload.tus.videoId)
    await router.push({ name: 'videos-view', params: { id: initPayload.video.id } })
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Falha durante upload do video.'
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  void loadFolders()
})
</script>

<template>
  <section class="space-y-6">
    <header class="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-xl shadow-slate-900/5 backdrop-blur">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p class="text-sm font-medium uppercase tracking-[0.22em] text-brand-700">Videos</p>
          <h1 class="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Novo video</h1>
        </div>
        <RouterLink :to="{ name: 'videos' }" class="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700">Voltar</RouterLink>
      </div>
    </header>

    <article class="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-lg shadow-slate-900/5 backdrop-blur">
      <div class="grid gap-5 sm:grid-cols-2">
        <div>
          <label class="mb-2 block text-sm font-medium text-slate-700">Nome</label>
          <input v-model="form.name" type="text" class="block w-full rounded-xl border-slate-200 px-4 py-3 text-sm" />
        </div>
        <div>
          <label class="mb-2 block text-sm font-medium text-slate-700">Pasta</label>
          <select v-model.number="form.folderId" class="block w-full rounded-xl border-slate-200 px-4 py-3 text-sm">
            <option v-for="folder in foldersStore.items" :key="folder.id" :value="folder.id">
              {{ folder.id }} - {{ folder.name }}
            </option>
          </select>
        </div>
        <div class="sm:col-span-2">
          <label class="mb-2 block text-sm font-medium text-slate-700">Arquivo</label>
          <input ref="fileInput" type="file" accept="video/*" class="block w-full rounded-xl border-slate-200 px-4 py-3 text-sm" @change="onSelectFile" />
        </div>
      </div>

      <div class="mt-5 h-3 w-full overflow-hidden rounded-full bg-slate-100">
        <div class="h-full bg-brand-600 transition-all" :style="{ width: `${uploadProgress}%` }" />
      </div>
      <p class="mt-2 text-sm text-slate-500">Progresso: {{ uploadProgress }}%</p>

      <p v-if="errorMessage" class="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ errorMessage }}</p>

      <div class="mt-6">
        <button type="button" class="rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white" :disabled="isSubmitting" @click="handleUpload">
          {{ isSubmitting ? 'Enviando...' : 'Enviar video' }}
        </button>
      </div>
    </article>
  </section>
</template>
