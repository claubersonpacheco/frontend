<script setup lang="ts">
import { reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'

import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const form = reactive({
  email: '',
})

const errorMessage = ref('')
const successMessage = ref('')
const isSubmitting = ref(false)

async function handleSubmit() {
  errorMessage.value = ''
  successMessage.value = ''
  isSubmitting.value = true

  try {
    await authStore.requestPasswordReset(form.email)
    successMessage.value =
      'Se este e-mail estiver cadastrado, voce recebera as instrucoes para criar uma nova senha.'
  } catch (error) {
    errorMessage.value =
      error instanceof Error
        ? error.message
        : 'Nao foi possivel solicitar a recuperacao de senha.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <main class="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(31,157,85,0.18),_transparent_28%),linear-gradient(135deg,_rgba(255,255,255,0.97),_rgba(239,247,242,0.95))]"></div>

    <section class="relative grid w-full max-w-5xl overflow-hidden rounded-md border border-white/70 bg-white/85 shadow-2xl shadow-brand-900/10 backdrop-blur xl:grid-cols-[0.95fr_1.05fr]">
      <div class="hidden bg-[linear-gradient(160deg,_#143b27,_#1f9d55_62%,_#b9efcb)] p-10 text-white xl:flex xl:flex-col xl:justify-between">
        <div class="space-y-6">
          <span class="inline-flex w-fit rounded-md border border-white/20 bg-white/10 px-4 py-1 text-sm font-semibold tracking-[0.2em] uppercase">
            Recuperar acesso
          </span>
          <div class="space-y-4">
            <h1 class="max-w-md text-5xl font-semibold leading-tight">
              Volte para seus estudos com tranquilidade.
            </h1>
            <p class="max-w-lg text-base/7 text-white/80">
              Informe o e-mail usado no cadastro e enviaremos as instrucoes para voce redefinir sua senha.
            </p>
          </div>
        </div>

        <div class="space-y-4 rounded-md border border-white/10 bg-white/7 p-6">
          <p class="text-sm font-semibold uppercase tracking-[0.22em] text-brand-100/80">Proximos passos</p>
          <div class="grid gap-3 text-sm text-white/80">
            <div class="rounded-md border border-white/10 bg-white/5 px-4 py-3">Confira seu e-mail cadastrado</div>
            <div class="rounded-md border border-white/10 bg-white/5 px-4 py-3">Abra o link de recuperacao</div>
            <div class="rounded-md border border-white/10 bg-white/5 px-4 py-3">Crie uma nova senha segura</div>
          </div>
        </div>
      </div>

      <div class="p-6 sm:p-10 lg:p-12">
        <div class="mx-auto flex max-w-md flex-col justify-center">
          <div class="mb-10 space-y-3">
            <span class="inline-flex w-fit rounded-md bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700">
              Ajuda com acesso
            </span>
            <h2 class="text-3xl font-semibold tracking-tight text-slate-900">Recuperar senha</h2>
            <p class="text-sm leading-6 text-slate-500">
              Digite seu e-mail para receber o link de redefinicao de senha.
            </p>
          </div>

          <form class="space-y-5" @submit.prevent="handleSubmit">
            <div>
              <label for="email" class="mb-2 block text-sm font-medium text-slate-700">E-mail</label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                autocomplete="email"
                placeholder="voce@instituto.com"
                class="block w-full rounded-md border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-brand-500"
              />
            </div>

            <p v-if="errorMessage" class="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {{ errorMessage }}
            </p>

            <p v-if="successMessage" class="rounded-md border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800">
              {{ successMessage }}
            </p>

            <button
              type="submit"
              class="inline-flex w-full items-center justify-center rounded-md bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-70"
              :disabled="isSubmitting"
            >
              {{ isSubmitting ? 'Enviando...' : 'Enviar instrucoes' }}
            </button>
          </form>

          <div class="mt-5 flex items-center justify-between text-sm">
            <span class="text-slate-500">Lembrou sua senha?</span>
            <RouterLink to="/auth/login" class="font-semibold text-brand-700 transition hover:text-brand-800">
              Voltar ao login
            </RouterLink>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
