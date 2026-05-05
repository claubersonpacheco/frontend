<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useSettingsStore } from '@/stores/settings'

const route = useRoute()
const router = useRouter()
const settingsStore = useSettingsStore()

const form = reactive({
  name: '',
  logo: '',
  streamLibraryId: '',
  streamApiKey: '',
  streamUserApiKey: '',
  moodleToken: '',
  moodleUrl: '',
  bunnyStorageZoneName: '',
  bunnyStorageAccessKey: '',
  bunnyStorageCdnDomain: '',
  bunnyStorageBaseUrl: '',
  bunnyStorageUserFolder: '',
  bunnyStorageVideoFolder: '',
  bunnyStorageLogoFolder: '',
})

const errorMessage = ref('')
const isSubmitting = ref(false)
const isLoading = ref(false)

async function loadSetting() {
  errorMessage.value = ''
  isLoading.value = true

  try {
    const setting = await settingsStore.fetchSettingById(String(route.params.id))
    form.name = setting.name || ''
    form.logo = setting.logo || ''
    form.streamLibraryId = setting.streamLibraryId || ''
    form.streamApiKey = setting.streamApiKey || ''
    form.streamUserApiKey = setting.streamUserApiKey || ''
    form.moodleToken = setting.moodleToken || ''
    form.moodleUrl = setting.moodleUrl || ''
    form.bunnyStorageZoneName = setting.bunnyStorageZoneName || ''
    form.bunnyStorageAccessKey = setting.bunnyStorageAccessKey || ''
    form.bunnyStorageCdnDomain = setting.bunnyStorageCdnDomain || ''
    form.bunnyStorageBaseUrl = setting.bunnyStorageBaseUrl || ''
    form.bunnyStorageUserFolder = setting.bunnyStorageUserFolder || ''
    form.bunnyStorageVideoFolder = setting.bunnyStorageVideoFolder || ''
    form.bunnyStorageLogoFolder = setting.bunnyStorageLogoFolder || ''
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Nao foi possivel carregar o setting.'
  } finally {
    isLoading.value = false
  }
}

async function handleSubmit() {
  errorMessage.value = ''
  isSubmitting.value = true

  try {
    await settingsStore.updateSetting(String(route.params.id), form)
    await router.push({ name: 'settings' })
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Nao foi possivel atualizar o setting.'
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  void loadSetting()
})
</script>

<template>
  <section class="space-y-6">
    <header class="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-xl shadow-slate-900/5 backdrop-blur">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p class="text-sm font-medium uppercase tracking-[0.22em] text-brand-700">Editar setting</p>
          <h1 class="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Atualizar configuracao</h1>
        </div>
        <RouterLink :to="{ name: 'settings' }" class="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:border-brand-200 hover:text-brand-700">Voltar para settings</RouterLink>
      </div>
    </header>

    <p v-if="errorMessage" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ errorMessage }}</p>

    <form v-if="!isLoading" class="space-y-6" @submit.prevent="handleSubmit">
      <section class="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-lg shadow-slate-900/5 backdrop-blur">
        <h2 class="text-xl font-semibold text-slate-900">Geral</h2>
        <div class="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700">Nome</label>
            <input v-model="form.name" type="text" class="block w-full rounded-xl border-slate-200 px-4 py-3 text-sm" />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700">Logo URL</label>
            <input v-model="form.logo" type="text" class="block w-full rounded-xl border-slate-200 px-4 py-3 text-sm" />
          </div>
        </div>
      </section>

      <div class="grid gap-6 xl:grid-cols-2">
        <section class="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-lg shadow-slate-900/5 backdrop-blur">
          <h2 class="text-xl font-semibold text-slate-900">Moodle</h2>
          <div class="mt-5 grid gap-5">
            <div>
              <label class="mb-2 block text-sm font-medium text-slate-700">Moodle URL</label>
              <input v-model="form.moodleUrl" type="text" class="block w-full rounded-xl border-slate-200 px-4 py-3 text-sm" />
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-slate-700">Moodle Token</label>
              <input v-model="form.moodleToken" type="text" class="block w-full rounded-xl border-slate-200 px-4 py-3 text-sm" />
            </div>
          </div>
        </section>

        <section class="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-lg shadow-slate-900/5 backdrop-blur">
          <h2 class="text-xl font-semibold text-slate-900">Stream</h2>
          <div class="mt-5 grid gap-5">
            <div>
              <label class="mb-2 block text-sm font-medium text-slate-700">Stream Library ID</label>
              <input v-model="form.streamLibraryId" type="text" class="block w-full rounded-xl border-slate-200 px-4 py-3 text-sm" />
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-slate-700">Stream API Key</label>
              <input v-model="form.streamApiKey" type="text" class="block w-full rounded-xl border-slate-200 px-4 py-3 text-sm" />
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-slate-700">Stream User API Key</label>
              <input v-model="form.streamUserApiKey" type="text" class="block w-full rounded-xl border-slate-200 px-4 py-3 text-sm" />
            </div>
          </div>
        </section>
      </div>

      <section class="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-lg shadow-slate-900/5 backdrop-blur">
        <h2 class="text-xl font-semibold text-slate-900">Bunny Storage</h2>
        <div class="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700">Zone Name</label>
            <input v-model="form.bunnyStorageZoneName" type="text" class="block w-full rounded-xl border-slate-200 px-4 py-3 text-sm" />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700">Access Key</label>
            <input v-model="form.bunnyStorageAccessKey" type="text" class="block w-full rounded-xl border-slate-200 px-4 py-3 text-sm" />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700">CDN Domain</label>
            <input v-model="form.bunnyStorageCdnDomain" type="text" class="block w-full rounded-xl border-slate-200 px-4 py-3 text-sm" />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700">Base URL</label>
            <input v-model="form.bunnyStorageBaseUrl" type="text" class="block w-full rounded-xl border-slate-200 px-4 py-3 text-sm" />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700">User Folder</label>
            <input v-model="form.bunnyStorageUserFolder" type="text" class="block w-full rounded-xl border-slate-200 px-4 py-3 text-sm" />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700">Video Folder</label>
            <input v-model="form.bunnyStorageVideoFolder" type="text" class="block w-full rounded-xl border-slate-200 px-4 py-3 text-sm" />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700">Logo Folder</label>
            <input v-model="form.bunnyStorageLogoFolder" type="text" class="block w-full rounded-xl border-slate-200 px-4 py-3 text-sm" />
          </div>
        </div>
      </section>

      <div class="flex justify-end">
        <button type="submit" class="inline-flex items-center justify-center rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white disabled:opacity-70" :disabled="isSubmitting">{{ isSubmitting ? 'Salvando...' : 'Salvar alteracoes' }}</button>
      </div>
    </form>

    <div v-else class="rounded-[2rem] border border-white/70 bg-white/90 p-8 text-sm text-slate-500 shadow-lg shadow-slate-900/5 backdrop-blur">Carregando dados do setting...</div>
  </section>
</template>
