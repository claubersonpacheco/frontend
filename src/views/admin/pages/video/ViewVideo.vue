<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useVideosStore } from '@/stores/videos'

const route = useRoute()
const videosStore = useVideosStore()
const errorMessage = ref('')

const video = computed(() => videosStore.current)
const playerUrl = computed(() => {
  if (!video.value?.guid || !video.value?.videoLibraryId) return ''
  return `https://iframe.mediadelivery.net/embed/${video.value.videoLibraryId}/${video.value.guid}`
})
const publicVideoUrl = computed(() => {
  if (!video.value?.guid || !video.value?.videoLibraryId) return ''
  return `https://iframe.mediadelivery.net/play/${video.value.videoLibraryId}/${video.value.guid}`
})
const copyFeedback = ref('')

async function loadVideo() {
  errorMessage.value = ''
  try {
    await videosStore.fetchVideoById(String(route.params.id))
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Nao foi possivel carregar o video.'
  }
}

onMounted(() => {
  void loadVideo()
})

async function copyVideoLink() {
  if (!publicVideoUrl.value) return

  try {
    await navigator.clipboard.writeText(publicVideoUrl.value)
    copyFeedback.value = 'Link copiado com sucesso.'
  } catch {
    copyFeedback.value = 'Nao foi possivel copiar automaticamente.'
  }
}
</script>

<template>
  <section class="space-y-6">
    <header class="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-xl shadow-slate-900/5 backdrop-blur">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p class="text-sm font-medium uppercase tracking-[0.22em] text-brand-700">Videos</p>
          <h1 class="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Visualizar video</h1>
        </div>
        <div class="flex gap-2">
          <RouterLink :to="{ name: 'videos-edit', params: { id: route.params.id } }" class="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700">Editar</RouterLink>
          <RouterLink :to="{ name: 'videos' }" class="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700">Voltar</RouterLink>
        </div>
      </div>
    </header>

    <p v-if="errorMessage" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ errorMessage }}</p>

    <article v-else-if="video" class="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-lg shadow-slate-900/5 backdrop-blur">
      <h2 class="text-xl font-semibold text-slate-900">{{ video.name }}</h2>
      <p class="mt-2 text-sm text-slate-500">Folder: {{ video.folder?.name || '-' }}</p>

      <div class="mt-4">
        <label class="mb-2 block text-sm font-medium text-slate-700">Link do video</label>
        <div class="flex flex-col gap-2 sm:flex-row">
          <input
            :value="publicVideoUrl"
            readonly
            class="block w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
          />
          <button
            type="button"
            class="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700"
            :disabled="!publicVideoUrl"
            @click="copyVideoLink"
          >
            Copiar link
          </button>
        </div>
        <p v-if="copyFeedback" class="mt-2 text-sm text-emerald-700">{{ copyFeedback }}</p>
      </div>

      <div v-if="playerUrl" class="mt-6 overflow-hidden rounded-2xl border border-slate-200">
        <iframe
          :src="playerUrl"
          loading="lazy"
          class="h-[420px] w-full"
          allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
          allowfullscreen
        />
      </div>

      <p v-else class="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
        O video ainda nao possui GUID/Biblioteca para visualizacao.
      </p>
    </article>
  </section>
</template>
