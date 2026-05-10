<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useVideosStore } from '@/stores/videos'
import { useAuthStore } from '@/stores/auth'

const videosStore = useVideosStore()
const authStore = useAuthStore()
const errorMessage = ref('')
const deletingVideoId = ref<number | null>(null)
const canDeleteVideos = authStore.hasPermission('videos.delete')

async function loadVideos() {
  errorMessage.value = ''
  try {
    await videosStore.fetchVideos()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Nao foi possivel carregar os videos.'
  }
}

onMounted(() => {
  void loadVideos()
})

async function deleteVideo(id: number, name: string) {
  if (!window.confirm(`Tem certeza que deseja excluir o video "${name}"?`)) {
    return
  }

  errorMessage.value = ''
  deletingVideoId.value = id

  try {
    await videosStore.deleteVideo(id)
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Nao foi possivel excluir o video.'
  } finally {
    deletingVideoId.value = null
  }
}
</script>

<template>
  <section class="space-y-6">
    <header class="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-xl shadow-slate-900/5 backdrop-blur">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p class="text-sm font-medium uppercase tracking-[0.22em] text-brand-700">Videos</p>
          <h1 class="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Lista de videos</h1>
        </div>
        <RouterLink :to="{ name: 'videos-create' }" class="inline-flex items-center justify-center rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white">Novo video</RouterLink>
      </div>
    </header>

    <p v-if="errorMessage" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ errorMessage }}</p>

    <article class="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-lg shadow-slate-900/5 backdrop-blur">
      <div class="mb-4 flex justify-end">
        <button type="button" class="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700" @click="loadVideos">Atualizar</button>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-200">
          <thead>
            <tr class="text-left text-xs uppercase tracking-[0.18em] text-slate-400">
              <th class="px-4 py-3 font-semibold">ID</th>
              <th class="px-4 py-3 font-semibold">Nome</th>
              <th class="px-4 py-3 font-semibold">GUID</th>
              <th class="px-4 py-3 font-semibold">Folder</th>
              <th class="px-4 py-3 font-semibold">Criado em</th>
              <th class="px-4 py-3 font-semibold text-right">Acoes</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="video in videosStore.items" :key="video.id" class="text-sm text-slate-700">
              <td class="px-4 py-4">{{ video.id }}</td>
              <td class="px-4 py-4 font-medium text-slate-900">{{ video.name }}</td>
              <td class="px-4 py-4">{{ video.guid || '-' }}</td>
              <td class="px-4 py-4">{{ video.folder?.name || '-' }}</td>
              <td class="px-4 py-4">{{ new Date(video.createdAt).toLocaleString() }}</td>
              <td class="px-4 py-4">
                <div class="flex justify-end gap-2">
                  <RouterLink :to="{ name: 'videos-view', params: { id: video.id } }" class="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700">Visualizar</RouterLink>
                  <RouterLink :to="{ name: 'videos-edit', params: { id: video.id } }" class="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700">Editar</RouterLink>
                  <button
                    v-if="canDeleteVideos"
                    type="button"
                    class="rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-600 disabled:opacity-60"
                    :disabled="deletingVideoId === video.id"
                    @click="deleteVideo(video.id, video.name)"
                  >
                    {{ deletingVideoId === video.id ? 'Excluindo...' : 'Excluir' }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>
  </section>
</template>
