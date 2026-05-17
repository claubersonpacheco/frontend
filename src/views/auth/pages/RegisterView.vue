<script setup lang="ts">
import { reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const form = reactive({
  username: '',
  name: '',
  lastname: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const errorMessage = ref('')
const isSubmitting = ref(false)

async function handleSubmit() {
  errorMessage.value = ''

  if (form.password !== form.confirmPassword) {
    errorMessage.value = 'As senhas precisam ser iguais.'
    return
  }

  isSubmitting.value = true

  try {
    await authStore.register({
      username: form.username,
      name: form.name,
      lastname: form.lastname,
      email: form.email,
      password: form.password,
    })

    await router.push('/dashboard')
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Nao foi possivel concluir o cadastro.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <main class="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(31,157,85,0.18),_transparent_26%),linear-gradient(180deg,_rgba(248,251,246,0.98),_rgba(236,244,237,0.95))]"></div>

    <section class="relative grid w-full max-w-6xl overflow-hidden rounded-md border border-white/70 bg-white/85 shadow-2xl shadow-brand-900/10 backdrop-blur xl:grid-cols-[0.92fr_1.08fr]">
      <div class="hidden bg-[linear-gradient(180deg,_#102418,_#18472e_55%,_#1f9d55)] p-10 text-white xl:flex xl:flex-col xl:justify-between">
        <div class="space-y-6">
          <span class="inline-flex w-fit rounded-md border border-white/20 bg-white/10 px-4 py-1 text-sm font-semibold tracking-[0.2em] uppercase">
            Novo acesso
          </span>
          <div class="space-y-4">
            <h1 class="max-w-md text-5xl font-semibold leading-tight">
              Cadastre um usuario com os campos do backend.
            </h1>
            <p class="max-w-lg text-base/7 text-white/80">
              Esta tela ja contempla username, name e lastname, deixando configuracoes administrativas para a equipe interna.
            </p>
          </div>
        </div>

        <div class="space-y-4 rounded-md border border-white/10 bg-white/7 p-6">
          <p class="text-sm font-semibold uppercase tracking-[0.22em] text-brand-100/80">Campos atuais</p>
          <div class="grid gap-3 text-sm text-white/80">
            <div class="rounded-md border border-white/10 bg-white/5 px-4 py-3">username</div>
            <div class="rounded-md border border-white/10 bg-white/5 px-4 py-3">name</div>
            <div class="rounded-md border border-white/10 bg-white/5 px-4 py-3">lastname</div>
            <div class="rounded-md border border-white/10 bg-white/5 px-4 py-3">email e password</div>
          </div>
        </div>
      </div>

      <div class="p-6 sm:p-10 lg:p-12">
        <div class="mx-auto max-w-2xl">
          <div class="mb-8 flex items-start justify-between gap-4">
            <div class="space-y-3">
              <span class="inline-flex w-fit rounded-md bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700">
                Registro integrado
              </span>
              <h2 class="text-3xl font-semibold tracking-tight text-slate-900">Criar conta</h2>
              <p class="text-sm leading-6 text-slate-500">
                O cadastro agora envia os dados para a API e segue a estrutura dos campos definidos para o usuario.
              </p>
            </div>

            <RouterLink
              to="/auth/login"
              class="hidden rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-brand-200 hover:text-brand-700 sm:inline-flex"
            >
              Voltar ao login
            </RouterLink>
          </div>

          <form class="grid gap-5 sm:grid-cols-2" @submit.prevent="handleSubmit">
            <div>
              <label for="username" class="mb-2 block text-sm font-medium text-slate-700">Username</label>
              <input
                id="username"
                v-model="form.username"
                type="text"
                autocomplete="username"
                placeholder="usuario.instituto"
                class="block w-full rounded-md border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-brand-500"
              />
            </div>

            <div>
              <label for="name" class="mb-2 block text-sm font-medium text-slate-700">Nome</label>
              <input
                id="name"
                v-model="form.name"
                type="text"
                autocomplete="given-name"
                placeholder="Claudia"
                class="block w-full rounded-md border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-brand-500"
              />
            </div>

            <div>
              <label for="lastname" class="mb-2 block text-sm font-medium text-slate-700">Sobrenome</label>
              <input
                id="lastname"
                v-model="form.lastname"
                type="text"
                autocomplete="family-name"
                placeholder="Silva"
                class="block w-full rounded-md border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-brand-500"
              />
            </div>

            <div class="sm:col-span-2">
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

            <div>
              <label for="password" class="mb-2 block text-sm font-medium text-slate-700">Senha</label>
              <input
                id="password"
                v-model="form.password"
                type="password"
                autocomplete="new-password"
                placeholder="Crie uma senha"
                class="block w-full rounded-md border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-brand-500"
              />
            </div>

            <div>
              <label for="confirm-password" class="mb-2 block text-sm font-medium text-slate-700">Confirmar senha</label>
              <input
                id="confirm-password"
                v-model="form.confirmPassword"
                type="password"
                autocomplete="new-password"
                placeholder="Repita a senha"
                class="block w-full rounded-md border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-brand-500"
              />
            </div>

            <p
              v-if="errorMessage"
              class="sm:col-span-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {{ errorMessage }}
            </p>

            <div class="sm:col-span-2 flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
              <RouterLink to="/auth/login" class="text-sm font-medium text-brand-700 transition hover:text-brand-800">
                Ja tenho conta
              </RouterLink>

              <button
                type="submit"
                class="inline-flex items-center justify-center rounded-md bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-70"
                :disabled="isSubmitting"
              >
                {{ isSubmitting ? 'Cadastrando...' : 'Criar conta' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  </main>
</template>
