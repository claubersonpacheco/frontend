<script setup lang="ts">
import { reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const form = reactive({
  currentPassword: '',
  password: '',
  confirmPassword: '',
})

const errorMessage = ref('')
const successMessage = ref('')
const isSubmitting = ref(false)

async function handleSubmit() {
  errorMessage.value = ''
  successMessage.value = ''

  if (form.password !== form.confirmPassword) {
    errorMessage.value = 'As senhas precisam ser iguais.'
    return
  }

  isSubmitting.value = true

  try {
    await authStore.changePassword({
      currentPassword: form.currentPassword,
      password: form.password,
    })

    form.currentPassword = ''
    form.password = ''
    form.confirmPassword = ''
    successMessage.value = 'Senha alterada com sucesso.'
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Nao foi possivel alterar a senha.'
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
          <p class="text-sm font-medium uppercase tracking-[0.22em] text-brand-700">Seguranca</p>
          <h1 class="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Trocar senha</h1>
          <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Informe sua senha atual antes de criar uma nova senha.
          </p>
        </div>

        <RouterLink
          :to="{ name: 'profile' }"
          class="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:border-brand-200 hover:text-brand-700"
        >
          Voltar ao perfil
        </RouterLink>
      </div>
    </header>

    <form class="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]" @submit.prevent="handleSubmit">
      <article class="rounded-md border border-white/70 bg-white/90 p-6 shadow-lg shadow-slate-900/5 backdrop-blur">
        <div class="mb-8">
          <h2 class="text-xl font-semibold text-slate-900">Confirmacao de identidade</h2>
          <p class="mt-1 text-sm text-slate-500">
            A senha so sera alterada se a senha atual estiver correta.
          </p>
        </div>

        <div class="grid gap-5 sm:grid-cols-2">
          <div class="sm:col-span-2">
            <label for="currentPassword" class="mb-2 block text-sm font-medium text-slate-700">Senha atual</label>
            <input
              id="currentPassword"
              v-model="form.currentPassword"
              type="password"
              autocomplete="current-password"
              class="block w-full rounded-md border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-brand-500"
            />
          </div>

          <div>
            <label for="password" class="mb-2 block text-sm font-medium text-slate-700">Nova senha</label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              autocomplete="new-password"
              class="block w-full rounded-md border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-brand-500"
            />
          </div>

          <div>
            <label for="confirmPassword" class="mb-2 block text-sm font-medium text-slate-700">Confirmar nova senha</label>
            <input
              id="confirmPassword"
              v-model="form.confirmPassword"
              type="password"
              autocomplete="new-password"
              class="block w-full rounded-md border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-brand-500"
            />
          </div>
        </div>

        <p v-if="errorMessage" class="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {{ errorMessage }}
        </p>

        <p v-if="successMessage" class="mt-5 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {{ successMessage }}
        </p>

        <div class="mt-8 flex justify-end">
          <button
            type="submit"
            class="inline-flex items-center justify-center rounded-md bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700 disabled:opacity-70"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? 'Salvando...' : 'Alterar senha' }}
          </button>
        </div>
      </article>

      <aside class="rounded-md border border-ink-900/10 bg-[linear-gradient(180deg,_rgba(16,36,24,0.98),_rgba(22,57,38,0.96))] p-6 text-white shadow-xl shadow-ink-900/15">
        <p class="text-sm uppercase tracking-[0.22em] text-brand-100/80">Sem senha atual?</p>
        <h2 class="mt-3 text-2xl font-semibold">Use a recuperacao por e-mail</h2>
        <p class="mt-3 text-sm leading-6 text-white/70">
          Se voce nao souber a senha atual, saia da conta e use o fluxo de recuperacao. O link enviado por e-mail valida que o cadastro existe.
        </p>

        <div class="mt-8 space-y-3">
          <RouterLink
            to="/auth/forgot-password"
            class="inline-flex w-full items-center justify-center rounded-md border border-white/10 bg-white/8 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/14"
          >
            Recuperar senha por e-mail
          </RouterLink>
          <button
            type="button"
            class="inline-flex w-full items-center justify-center rounded-md border border-white/10 px-4 py-3 text-sm font-semibold text-white/85 transition hover:bg-white/8"
            @click="router.push({ name: 'profile' })"
          >
            Voltar sem alterar
          </button>
        </div>
      </aside>
    </form>
  </section>
</template>
