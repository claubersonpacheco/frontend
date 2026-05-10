<script setup lang="ts">
import { reactive, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'

import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const { isAuthenticated } = storeToRefs(authStore)
const route = useRoute()
const router = useRouter()

const form = reactive({
  identifier: '',
  password: '',
})

const errorMessage = ref('')
const isSubmitting = ref(false)
const showPassword = ref(false)

async function handleSubmit() {
  errorMessage.value = ''
  isSubmitting.value = true

  try {
    // 🔥 IMPORTANTE: aguardar login concluir
    await authStore.login(form.identifier, form.password)

    // 🔥 só depois do login concluído faz redirect
    const redirect =
      typeof route.query.redirect === 'string'
        ? route.query.redirect
        : '/dashboard'

    await router.push(redirect)
  } catch (error) {
    errorMessage.value =
      error instanceof Error
        ? error.message
        : 'Nao foi possivel entrar.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <main class="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(31,157,85,0.2),_transparent_28%),linear-gradient(135deg,_rgba(255,255,255,0.96),_rgba(239,247,242,0.94))]"></div>

    <section class="relative grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 shadow-2xl shadow-brand-900/10 backdrop-blur xl:grid-cols-[1.1fr_0.9fr]">
      <div class="hidden bg-[linear-gradient(160deg,_#143b27,_#1f9d55_62%,_#b9efcb)] p-10 text-white xl:flex xl:flex-col xl:justify-between">
        <div class="space-y-6">
          <span class="inline-flex w-fit rounded-full border border-white/20 bg-white/10 px-4 py-1 text-sm font-semibold tracking-[0.2em] uppercase">
            Instituto de Inteligência
          </span>
          <div class="space-y-4">
            <h1 class="max-w-md text-5xl font-semibold leading-tight">
              Bem-vindo ao seu portal de estudos.
            </h1>
            <p class="max-w-lg text-base/7 text-white/80">
              Acesse suas aulas, acompanhe seu progresso e fique por dentro das novidades do instituto em um so lugar.
            </p>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-4">
          <div class="rounded-2xl border border-white/15 bg-white/10 p-4">
            <p class="text-3xl font-semibold">8</p>
            <p class="mt-1 text-sm text-white/75">aulas recentes</p>
          </div>
          <div class="rounded-2xl border border-white/15 bg-white/10 p-4">
            <p class="text-3xl font-semibold">73%</p>
            <p class="mt-1 text-sm text-white/75">progresso</p>
          </div>
          <div class="rounded-2xl border border-white/15 bg-white/10 p-4">
            <p class="text-3xl font-semibold">3</p>
            <p class="mt-1 text-sm text-white/75">avisos novos</p>
          </div>
        </div>
      </div>

      <div class="p-6 sm:p-10 lg:p-12">
        <div class="mx-auto flex max-w-md flex-col justify-center">
          <div class="mb-10 space-y-3">
            <span class="inline-flex w-fit rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700">
              Acesso seguro
            </span>
            <h2 class="text-3xl font-semibold tracking-tight text-slate-900">Entrar</h2>
            <p class="text-sm leading-6 text-slate-500">
              Use seu username ou e-mail e continue seus estudos no portal do aluno.
            </p>
          </div>

          <form class="space-y-5" @submit.prevent="handleSubmit">
            <div>
              <label for="identifier" class="mb-2 block text-sm font-medium text-slate-700">Username ou e-mail</label>
              <input
                id="identifier"
                v-model="form.identifier"
                type="text"
                autocomplete="username"
                placeholder="seu.usuario ou voce@instituto.com"
                class="block w-full rounded-xl border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-brand-500"
              />
            </div>

            <div>
              <div class="mb-2 flex items-center justify-between">
                <label for="password" class="block text-sm font-medium text-slate-700">Senha</label>
                <RouterLink
                  to="/auth/forgot-password"
                  class="text-xs font-medium text-brand-700 transition hover:text-brand-800"
                >
                  Esqueci minha senha
                </RouterLink>
              </div>
              <div class="relative">
                <input
                  id="password"
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="current-password"
                  placeholder="Digite sua senha"
                  class="block w-full rounded-xl border-slate-200 bg-white/90 px-4 py-3 pr-12 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-brand-500"
                />
                <button
                  type="button"
                  class="absolute inset-y-0 right-0 inline-flex w-12 items-center justify-center text-slate-400 transition hover:text-brand-700 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                  :aria-label="showPassword ? 'Ocultar senha' : 'Mostrar senha'"
                  :title="showPassword ? 'Ocultar senha' : 'Mostrar senha'"
                  @click="showPassword = !showPassword"
                >
                  <svg
                    v-if="!showPassword"
                    class="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M2.1 12s3.6-6.5 9.9-6.5S21.9 12 21.9 12 18.3 18.5 12 18.5 2.1 12 2.1 12Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <svg
                    v-else
                    class="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M3 3l18 18" />
                    <path d="M10.7 5.7A10.9 10.9 0 0 1 12 5.5c6.3 0 9.9 6.5 9.9 6.5a18.1 18.1 0 0 1-3.1 3.8" />
                    <path d="M14.1 14.1A3 3 0 0 1 9.9 9.9" />
                    <path d="M6.6 6.6A18.4 18.4 0 0 0 2.1 12s3.6 6.5 9.9 6.5a10.9 10.9 0 0 0 4.2-.9" />
                  </svg>
                </button>
              </div>
            </div>

            <p v-if="errorMessage" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {{ errorMessage }}
            </p>

            <button
              type="submit"
              class="inline-flex w-full items-center justify-center rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-70"
              :disabled="isSubmitting"
            >
              {{ isSubmitting ? 'Entrando...' : 'Entrar no sistema' }}
            </button>
          </form>

          <div class="mt-5 flex items-center justify-between text-sm">
            <span class="text-slate-500">Ainda nao tem conta?</span>
            <RouterLink to="/auth/register" class="font-semibold text-brand-700 transition hover:text-brand-800">
              Criar cadastro
            </RouterLink>
          </div>

          
        </div>
      </div>
    </section>
  </main>
</template>
