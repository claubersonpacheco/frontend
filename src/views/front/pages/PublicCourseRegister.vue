<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { CourseRecord } from '@/stores/courses'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const course = ref<CourseRecord | null>(null)
const errorMessage = ref('')
const isSubmitting = ref(false)

const form = reactive({
  username: '',
  name: '',
  lastname: '',
  email: '',
  password: '',
  confirmPassword: '',
})

async function loadCourse() {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/public-courses/${route.params.slug}`)
    const payload = (await response.json().catch(() => null)) as CourseRecord | { message?: string } | null

    if (!response.ok) {
      throw new Error(payload && 'message' in payload && payload.message ? payload.message : 'Curso indisponivel.')
    }

    course.value = payload as CourseRecord
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Curso indisponivel.'
  }
}

async function submit() {
  errorMessage.value = ''

  if (form.password !== form.confirmPassword) {
    errorMessage.value = 'As senhas precisam ser iguais.'
    return
  }

  isSubmitting.value = true

  try {
    await authStore.registerForPublicCourse(String(route.params.slug), {
      username: form.username,
      name: form.name,
      lastname: form.lastname,
      email: form.email,
      password: form.password,
    })
    await router.push({ name: 'my-courses' })
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Nao foi possivel concluir o cadastro.'
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  void loadCourse()
})
</script>

<template>
  <main class="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
    <section class="mx-auto grid max-w-5xl overflow-hidden rounded-[2rem] border border-white bg-white shadow-xl shadow-slate-900/10 lg:grid-cols-[0.9fr_1.1fr]">
      <aside class="bg-brand-700 p-8 text-white">
        <p class="text-sm font-semibold uppercase tracking-[0.22em] text-brand-100">Curso publico</p>
        <h1 class="mt-4 text-4xl font-semibold leading-tight">{{ course?.fullname ?? 'Carregando curso...' }}</h1>
        <p class="mt-4 text-sm leading-6 text-white/75">{{ course?.summary || 'Cadastre-se para liberar seu acesso ao curso.' }}</p>
      </aside>

      <form class="grid gap-5 p-8 sm:grid-cols-2" @submit.prevent="submit">
        <div class="sm:col-span-2">
          <h2 class="text-2xl font-semibold tracking-tight text-slate-900">Criar acesso</h2>
        </div>

        <input v-model="form.username" placeholder="Username" class="rounded-xl border-slate-200 px-4 py-3 text-sm" />
        <input v-model="form.name" placeholder="Nome" class="rounded-xl border-slate-200 px-4 py-3 text-sm" />
        <input v-model="form.lastname" placeholder="Sobrenome" class="rounded-xl border-slate-200 px-4 py-3 text-sm" />
        <input v-model="form.email" type="email" placeholder="E-mail" class="rounded-xl border-slate-200 px-4 py-3 text-sm" />
        <input v-model="form.password" type="password" placeholder="Senha" class="rounded-xl border-slate-200 px-4 py-3 text-sm" />
        <input v-model="form.confirmPassword" type="password" placeholder="Confirmar senha" class="rounded-xl border-slate-200 px-4 py-3 text-sm" />

        <p v-if="errorMessage" class="sm:col-span-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ errorMessage }}</p>

        <button class="sm:col-span-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white disabled:opacity-70" :disabled="isSubmitting || !course">
          {{ isSubmitting ? 'Cadastrando...' : 'Cadastrar e acessar curso' }}
        </button>
      </form>
    </section>
  </main>
</template>
