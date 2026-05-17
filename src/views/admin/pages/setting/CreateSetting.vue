<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useSettingsStore } from '@/stores/settings'

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
  pixKey: '',
  pixMerchantName: '',
  pixMerchantCity: '',
  pixCallbackSecret: '',
})

const errorMessage = ref('')
const isSubmitting = ref(false)
const selectedLogo = ref<File | null>(null)
const logoPreview = ref('')
const logoPreviewUrl = computed(() => logoPreview.value || form.logo)

function handleLogoChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0] ?? null

  selectedLogo.value = file
  logoPreview.value = file ? URL.createObjectURL(file) : ''
}

async function handleSubmit() {
  errorMessage.value = ''
  isSubmitting.value = true

  try {
    const setting = await settingsStore.createSetting(form)

    if (selectedLogo.value) {
      await settingsStore.uploadSettingLogo(setting.id, selectedLogo.value)
      selectedLogo.value = null
    }

    await router.push({ name: 'settings' })
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Nao foi possivel criar o setting.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <section class="space-y-6">
    <header class="rounded-md border border-white/70 bg-white/85 p-6 shadow-xl shadow-slate-900/5 backdrop-blur">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p class="text-sm font-medium uppercase tracking-[0.22em] text-brand-700">Novo setting</p>
          <h1 class="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Criar configuracao</h1>
        </div>
        <RouterLink :to="{ name: 'settings' }" class="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:border-brand-200 hover:text-brand-700">Voltar para settings</RouterLink>
      </div>
    </header>

    <form class="space-y-6" @submit.prevent="handleSubmit">
      <section class="rounded-md border border-white/70 bg-white/90 p-6 shadow-lg shadow-slate-900/5 backdrop-blur">
        <h2 class="text-xl font-semibold text-slate-900">Geral</h2>
        <div class="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700">Nome</label>
            <input v-model="form.name" type="text" class="block w-full rounded-md border-slate-200 px-4 py-3 text-sm" />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700">Logo URL</label>
            <input v-model="form.logo" type="text" class="block w-full rounded-md border-slate-200 px-4 py-3 text-sm" />
          </div>
          <div class="sm:col-span-2 grid gap-4 rounded-md border border-slate-100 bg-slate-50 p-4 sm:grid-cols-[180px_1fr] sm:items-center">
            <div class="flex h-24 items-center justify-center overflow-hidden rounded-md border border-dashed border-slate-200 bg-white px-4">
              <img v-if="logoPreviewUrl" :src="logoPreviewUrl" alt="Preview da logo" class="max-h-full max-w-full object-contain" />
              <span v-else class="text-sm text-slate-400">Logo</span>
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-slate-700">Enviar logo para Bunny</label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                class="block w-full rounded-md border border-slate-200 bg-white px-4 py-3 text-sm"
                @change="handleLogoChange"
              />
              <p class="mt-2 text-xs leading-5 text-slate-500">
                JPG, PNG, WEBP, GIF ou SVG ate 5MB. O arquivo sera salvo na pasta configurada em Logo Folder.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div class="grid gap-6 xl:grid-cols-2">
        <section class="rounded-md border border-white/70 bg-white/90 p-6 shadow-lg shadow-slate-900/5 backdrop-blur">
          <h2 class="text-xl font-semibold text-slate-900">Moodle</h2>
          <div class="mt-5 grid gap-5">
            <div>
              <label class="mb-2 block text-sm font-medium text-slate-700">Moodle URL</label>
              <input v-model="form.moodleUrl" type="text" class="block w-full rounded-md border-slate-200 px-4 py-3 text-sm" />
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-slate-700">Moodle Token</label>
              <input v-model="form.moodleToken" type="text" class="block w-full rounded-md border-slate-200 px-4 py-3 text-sm" />
            </div>
          </div>
        </section>

        <section class="rounded-md border border-white/70 bg-white/90 p-6 shadow-lg shadow-slate-900/5 backdrop-blur">
          <h2 class="text-xl font-semibold text-slate-900">Stream</h2>
          <div class="mt-5 grid gap-5">
            <div>
              <label class="mb-2 block text-sm font-medium text-slate-700">Stream Library ID</label>
              <input v-model="form.streamLibraryId" type="text" class="block w-full rounded-md border-slate-200 px-4 py-3 text-sm" />
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-slate-700">Stream API Key</label>
              <input v-model="form.streamApiKey" type="text" class="block w-full rounded-md border-slate-200 px-4 py-3 text-sm" />
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-slate-700">Stream User API Key</label>
              <input v-model="form.streamUserApiKey" type="text" class="block w-full rounded-md border-slate-200 px-4 py-3 text-sm" />
            </div>
          </div>
        </section>
      </div>

      <section class="rounded-md border border-white/70 bg-white/90 p-6 shadow-lg shadow-slate-900/5 backdrop-blur">
        <h2 class="text-xl font-semibold text-slate-900">PIX</h2>
        <div class="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700">Chave PIX</label>
            <input v-model="form.pixKey" type="text" class="block w-full rounded-md border-slate-200 px-4 py-3 text-sm" />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700">Nome do recebedor</label>
            <input v-model="form.pixMerchantName" type="text" class="block w-full rounded-md border-slate-200 px-4 py-3 text-sm" />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700">Cidade do recebedor</label>
            <input v-model="form.pixMerchantCity" type="text" class="block w-full rounded-md border-slate-200 px-4 py-3 text-sm" />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700">Segredo do callback</label>
            <input v-model="form.pixCallbackSecret" type="text" class="block w-full rounded-md border-slate-200 px-4 py-3 text-sm" />
          </div>
        </div>
      </section>

      <section class="rounded-md border border-white/70 bg-white/90 p-6 shadow-lg shadow-slate-900/5 backdrop-blur">
        <h2 class="text-xl font-semibold text-slate-900">Bunny Storage</h2>
        <div class="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700">Zone Name</label>
            <input v-model="form.bunnyStorageZoneName" type="text" class="block w-full rounded-md border-slate-200 px-4 py-3 text-sm" />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700">Access Key</label>
            <input v-model="form.bunnyStorageAccessKey" type="text" class="block w-full rounded-md border-slate-200 px-4 py-3 text-sm" />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700">CDN Domain</label>
            <input v-model="form.bunnyStorageCdnDomain" type="text" class="block w-full rounded-md border-slate-200 px-4 py-3 text-sm" />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700">Base URL</label>
            <input v-model="form.bunnyStorageBaseUrl" type="text" class="block w-full rounded-md border-slate-200 px-4 py-3 text-sm" />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700">User Folder</label>
            <input v-model="form.bunnyStorageUserFolder" type="text" class="block w-full rounded-md border-slate-200 px-4 py-3 text-sm" />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700">Video Folder</label>
            <input v-model="form.bunnyStorageVideoFolder" type="text" class="block w-full rounded-md border-slate-200 px-4 py-3 text-sm" />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700">Logo Folder</label>
            <input v-model="form.bunnyStorageLogoFolder" type="text" class="block w-full rounded-md border-slate-200 px-4 py-3 text-sm" />
          </div>
        </div>
      </section>

      <p v-if="errorMessage" class="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ errorMessage }}</p>

      <div class="flex justify-end">
        <button type="submit" class="inline-flex items-center justify-center rounded-md bg-brand-600 px-6 py-3 text-sm font-semibold text-white disabled:opacity-70" :disabled="isSubmitting">{{ isSubmitting ? 'Salvando...' : 'Criar setting' }}</button>
      </div>
    </form>
  </section>
</template>
