<script setup lang="ts">
import { reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const currentUser = authStore.user

if (!currentUser) {
  void router.push('/auth/login')
}

const form = reactive({
  username: currentUser?.username ?? '',
  name: currentUser?.name ?? '',
  lastname: currentUser?.lastname ?? '',
  suspended: currentUser?.suspended ?? '0',
  email: currentUser?.email ?? '',
})

const errorMessage = ref('')
const successMessage = ref('')
const isSubmitting = ref(false)

async function handleSubmit() {
  errorMessage.value = ''
  successMessage.value = ''
  isSubmitting.value = true

  try {
    await authStore.updateProfile(form)
    successMessage.value = 'Perfil atualizado com sucesso.'
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Nao foi possivel atualizar o perfil.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <main class="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-6xl space-y-6">
      <header class="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-xl shadow-slate-900/5 backdrop-blur">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p class="text-sm font-medium uppercase tracking-[0.22em] text-brand-700">Perfil</p>
            <h1 class="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Editar dados do usuario</h1>
            <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Ajuste os dados do usuario autenticado e sincronize as alteracoes com a API.
            </p>
          </div>

          <div class="flex gap-3">
            <RouterLink
              to="/dashboard"
              class="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:border-brand-200 hover:text-brand-700"
            >
              Voltar ao dashboard
            </RouterLink>
          </div>
        </div>
      </header>

      <section class="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <article class="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-lg shadow-slate-900/5 backdrop-blur">
          <div class="mb-8">
            <h2 class="text-xl font-semibold text-slate-900">Dados cadastrais</h2>
            <p class="mt-1 text-sm text-slate-500">Edite username, nome, sobrenome, e-mail e status de suspensao.</p>
          </div>

          <form class="grid gap-5 sm:grid-cols-2" @submit.prevent="handleSubmit">
            <div>
              <label for="username" class="mb-2 block text-sm font-medium text-slate-700">Username</label>
              <input
                id="username"
                v-model="form.username"
                type="text"
                autocomplete="username"
                class="block w-full rounded-xl border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-brand-500"
              />
            </div>

            <div>
              <label for="name" class="mb-2 block text-sm font-medium text-slate-700">Nome</label>
              <input
                id="name"
                v-model="form.name"
                type="text"
                autocomplete="given-name"
                class="block w-full rounded-xl border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-brand-500"
              />
            </div>

            <div>
              <label for="lastname" class="mb-2 block text-sm font-medium text-slate-700">Sobrenome</label>
              <input
                id="lastname"
                v-model="form.lastname"
                type="text"
                autocomplete="family-name"
                class="block w-full rounded-xl border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-brand-500"
              />
            </div>

            <div v-if="authStore.isMaster">
              <label for="suspended" class="mb-2 block text-sm font-medium text-slate-700">Suspenso</label>
              <select
                id="suspended"
                v-model="form.suspended"
                class="block w-full rounded-xl border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-brand-500"
              >
                <option value="0">Nao</option>
                <option value="1">Sim</option>
              </select>
            </div>

            <div class="sm:col-span-2">
              <label for="email" class="mb-2 block text-sm font-medium text-slate-700">E-mail</label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                autocomplete="email"
                class="block w-full rounded-xl border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-brand-500"
              />
            </div>

            <p
              v-if="errorMessage"
              class="sm:col-span-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {{ errorMessage }}
            </p>

            <p
              v-if="successMessage"
              class="sm:col-span-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
            >
              {{ successMessage }}
            </p>

            <div class="sm:col-span-2 flex justify-end">
              <button
                type="submit"
                class="inline-flex items-center justify-center rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-70"
                :disabled="isSubmitting"
              >
                {{ isSubmitting ? 'Salvando...' : 'Salvar alteracoes' }}
              </button>
            </div>
          </form>
        </article>

        <aside class="rounded-[2rem] border border-ink-900/10 bg-[linear-gradient(180deg,_rgba(16,36,24,0.98),_rgba(22,57,38,0.96))] p-6 text-white shadow-xl shadow-ink-900/15">
          <p class="text-sm uppercase tracking-[0.22em] text-brand-100/80">Resumo do perfil</p>
          <h2 class="mt-3 text-2xl font-semibold">{{ authStore.user?.name }} {{ authStore.user?.lastname }}</h2>
          <p class="mt-3 text-sm leading-6 text-white/70">
            Revise rapidamente o cadastro atual salvo no backend antes de fazer novas alteracoes.
          </p>

          <div class="mt-8 space-y-3">
            <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p class="text-sm text-white/60">Username</p>
              <p class="mt-1 font-medium">{{ authStore.user?.username }}</p>
            </div>
            <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p class="text-sm text-white/60">E-mail</p>
              <p class="mt-1 font-medium">{{ authStore.user?.email }}</p>
            </div>
            <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p class="text-sm text-white/60">Suspenso</p>
              <p class="mt-1 font-medium">{{ authStore.user?.suspended === '1' ? 'Sim' : 'Nao' }}</p>
            </div>
          </div>
        </aside>
      </section>
    </div>
  </main>
</template>
