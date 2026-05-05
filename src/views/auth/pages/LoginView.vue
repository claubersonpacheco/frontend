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
            Gestao IDI
          </span>
          <div class="space-y-4">
            <h1 class="max-w-md text-5xl font-semibold leading-tight">
              Bem-vindo ao seu painel academico.
            </h1>
            <p class="max-w-lg text-base/7 text-white/80">
              Organize acessos, acompanhe indicadores e centralize a operacao do instituto em uma interface mais limpa.
            </p>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-4">
          <div class="rounded-2xl border border-white/15 bg-white/10 p-4">
            <p class="text-3xl font-semibold">24</p>
            <p class="mt-1 text-sm text-white/75">turmas ativas</p>
          </div>
          <div class="rounded-2xl border border-white/15 bg-white/10 p-4">
            <p class="text-3xl font-semibold">93%</p>
            <p class="mt-1 text-sm text-white/75">presenca media</p>
          </div>
          <div class="rounded-2xl border border-white/15 bg-white/10 p-4">
            <p class="text-3xl font-semibold">12</p>
            <p class="mt-1 text-sm text-white/75">alertas hoje</p>
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
              Use username ou e-mail junto da senha para autenticar no backend do sistema.
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
                placeholder="usuario.instituto ou voce@instituto.com"
                class="block w-full rounded-xl border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-brand-500"
              />
            </div>

            <div>
              <div class="mb-2 flex items-center justify-between">
                <label for="password" class="block text-sm font-medium text-slate-700">Senha</label>
                <span class="text-xs text-slate-400">minimo: qualquer valor</span>
              </div>
              <input
                id="password"
                v-model="form.password"
                type="password"
                autocomplete="current-password"
                placeholder="Digite sua senha"
                class="block w-full rounded-xl border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-brand-500"
              />
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

          <div class="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <p class="font-medium text-slate-800">Estado atual</p>
            <p class="mt-1">
              Usuario autenticado:
              <span class="font-semibold text-brand-700">{{ isAuthenticated ? 'sim' : 'nao' }}</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
