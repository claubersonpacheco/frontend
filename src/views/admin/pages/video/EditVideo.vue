<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useFoldersStore } from '@/stores/folders'
import { useVideosStore } from '@/stores/videos'

const route = useRoute()
const router = useRouter()
const videosStore = useVideosStore()
const foldersStore = useFoldersStore()

const form = reactive({
  name: '',
  folderId: 1,
})

const errorMessage = ref('')
const isSubmitting = ref(false)

async function loadData() {
  errorMessage.value = ''

  try {
    await foldersStore.fetchFolders()
    const video = await videosStore.fetchVideoById(String(route.params.id))
    form.name = video.name
    form.folderId = video.folder?.id ?? foldersStore.items[0]?.id ?? 1
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Nao foi possivel carregar o video.'
  }
}

async function handleSubmit() {
  errorMessage.value = ''
  isSubmitting.value = true

  try {
    await videosStore.updateVideo(String(route.params.id), {
      name: form.name.trim(),
      folderId: Number(form.folderId),
    })

    await router.push({ name: 'videos-view', params: { id: route.params.id } })
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Nao foi possivel salvar alteracoes.'
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  void loadData()
})
</script>

<template>
  <section class="space-y-6">
    <header class="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-xl shadow-slate-900/5 backdrop-blur">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p class="text-sm font-medium uppercase tracking-[0.22em] text-brand-700">Videos</p>
          <h1 class="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Editar video</h1>
        </div>
        <RouterLink :to="{ name: 'videos-view', params: { id: route.params.id } }" class="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700">Voltar</RouterLink>
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
      </div>

      <p v-if="errorMessage" class="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ errorMessage }}</p>

      <div class="mt-6">
        <button type="button" class="rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white" :disabled="isSubmitting" @click="handleSubmit">
          {{ isSubmitting ? 'Salvando...' : 'Salvar alteracoes' }}
        </button>
      </div>
    </article>
  </section>
</template>
