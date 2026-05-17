<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useSettingsStore } from '@/stores/settings'

const route = useRoute()
const router = useRouter()
const settingsStore = useSettingsStore()

const settingName = ref('')
const errorMessage = ref('')
const isSubmitting = ref(false)
const isLoading = ref(false)

async function loadSetting() {
  errorMessage.value = ''
  isLoading.value = true
  try {
    const setting = await settingsStore.fetchSettingById(String(route.params.id))
    settingName.value = setting.name || `ID ${setting.id}`
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Nao foi possivel carregar o setting.'
  } finally {
    isLoading.value = false
  }
}

async function handleDelete() {
  errorMessage.value = ''
  isSubmitting.value = true
  try {
    await settingsStore.deleteSetting(String(route.params.id))
    await router.push({ name: 'settings' })
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Nao foi possivel excluir o setting.'
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
    <header class="rounded-md border border-white/70 bg-white/85 p-6 shadow-xl shadow-slate-900/5 backdrop-blur">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div><p class="text-sm font-medium uppercase tracking-[0.22em] text-red-600">Excluir setting</p><h1 class="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Confirmar exclusao</h1></div>
        <RouterLink :to="{ name: 'settings' }" class="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:border-brand-200 hover:text-brand-700">Cancelar</RouterLink>
      </div>
    </header>

    <p v-if="errorMessage" class="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ errorMessage }}</p>

    <div v-if="!isLoading" class="rounded-md border border-red-200 bg-white/90 p-6 shadow-lg shadow-red-900/5 backdrop-blur">
      <h2 class="text-xl font-semibold text-slate-900">Tem certeza que deseja excluir?</h2>
      <p class="mt-3 text-sm leading-6 text-slate-500">O setting <span class="font-semibold text-slate-900">{{ settingName }}</span> sera removido permanentemente.</p>
      <div class="mt-8 flex flex-wrap gap-3">
        <button type="button" class="inline-flex items-center justify-center rounded-md bg-red-600 px-6 py-3 text-sm font-semibold text-white" :disabled="isSubmitting" @click="handleDelete">{{ isSubmitting ? 'Excluindo...' : 'Excluir setting' }}</button>
        <RouterLink :to="{ name: 'settings' }" class="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-700">Voltar sem excluir</RouterLink>
      </div>
    </div>

    <div v-else class="rounded-md border border-white/70 bg-white/90 p-8 text-sm text-slate-500 shadow-lg shadow-slate-900/5 backdrop-blur">Carregando setting...</div>
  </section>
</template>
