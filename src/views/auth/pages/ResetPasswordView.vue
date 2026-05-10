<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

const form = reactive({
  password: '',
  confirmPassword: '',
})

const token = computed(() => {
  const value = route.query.token
  return typeof value === 'string' ? value : ''
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
    await authStore.resetPassword(token.value, form.password)
    successMessage.value = 'Senha redefinida com sucesso. Voce ja pode entrar com a nova senha.'
    window.setTimeout(() => {
      router.push('/auth/login')
    }, 1800)
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Nao foi possivel redefinir a senha.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <main class="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(31,157,85,0.18),_transparent_28%),linear-gradient(135deg,_rgba(255,255,255,0.97),_rgba(239,247,242,0.95))]"></div>

    <section class="relative grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 shadow-2xl shadow-brand-900/10 backdrop-blur xl:grid-cols-[0.95fr_1.05fr]">
      <div class="hidden bg-[linear-gradient(160deg,_#143b27,_#1f9d55_62%,_#b9efcb)] p-10 text-white xl:flex xl:flex-col xl:justify-between">
        <div class="space-y-6">
          <span class="inline-flex w-fit rounded-full border border-white/20 bg-white/10 px-4 py-1 text-sm font-semibold tracking-[0.2em] uppercase">
            Nova senha
          </span>
          <div class="space-y-4">
            <h1 class="max-w-md text-5xl font-semibold leading-tight">
              Crie uma senha segura para continuar.
            </h1>
            <p class="max-w-lg text-base/7 text-white/80">
              Use o link enviado por e-mail para confirmar sua identidade e recuperar o acesso.
            </p>
          </div>
        </div>

        <div class="space-y-4 rounded-[1.5rem] border border-white/10 bg-white/7 p-6">
          <p class="text-sm font-semibold uppercase tracking-[0.22em] text-brand-100/80">Seguranca</p>
          <div class="grid gap-3 text-sm text-white/80">
            <div class="rounded-xl border border-white/10 bg-white/5 px-4 py-3">Use pelo menos 6 caracteres</div>
            <div class="rounded-xl border border-white/10 bg-white/5 px-4 py-3">Evite senhas usadas em outros sites</div>
            <div class="rounded-xl border border-white/10 bg-white/5 px-4 py-3">Depois entre novamente no sistema</div>
          </div>
        </div>
      </div>

      <div class="p-6 sm:p-10 lg:p-12">
        <div class="mx-auto flex max-w-md flex-col justify-center">
          <div class="mb-10 space-y-3">
            <span class="inline-flex w-fit rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700">
              Recuperacao de acesso
            </span>
            <h2 class="text-3xl font-semibold tracking-tight text-slate-900">Redefinir senha</h2>
            <p class="text-sm leading-6 text-slate-500">
              Informe sua nova senha para finalizar a recuperacao.
            </p>
          </div>

          <p v-if="!token" class="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Link de recuperacao invalido. Solicite um novo link para redefinir sua senha.
          </p>

          <form class="space-y-5" @submit.prevent="handleSubmit">
            <div>
              <label for="password" class="mb-2 block text-sm font-medium text-slate-700">Nova senha</label>
              <input
                id="password"
                v-model="form.password"
                type="password"
                autocomplete="new-password"
                placeholder="Digite a nova senha"
                class="block w-full rounded-xl border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-brand-500"
              />
            </div>

            <div>
              <label for="confirm-password" class="mb-2 block text-sm font-medium text-slate-700">Confirmar senha</label>
              <input
                id="confirm-password"
                v-model="form.confirmPassword"
                type="password"
                autocomplete="new-password"
                placeholder="Repita a nova senha"
                class="block w-full rounded-xl border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-brand-500"
              />
            </div>

            <p v-if="errorMessage" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {{ errorMessage }}
            </p>

            <p v-if="successMessage" class="rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800">
              {{ successMessage }}
            </p>

            <button
              type="submit"
              class="inline-flex w-full items-center justify-center rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-70"
              :disabled="isSubmitting || !token"
            >
              {{ isSubmitting ? 'Salvando...' : 'Redefinir senha' }}
            </button>
          </form>

          <div class="mt-5 flex items-center justify-between text-sm">
            <span class="text-slate-500">Ja tem acesso?</span>
            <RouterLink to="/auth/login" class="font-semibold text-brand-700 transition hover:text-brand-800">
              Voltar ao login
            </RouterLink>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
