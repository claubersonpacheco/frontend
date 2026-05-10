<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { CourseEnrollmentRecord, CourseRecord } from '@/stores/courses'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const course = ref<CourseRecord | null>(null)
const errorMessage = ref('')
const isSubmitting = ref(false)
const activeMode = ref<'login' | 'register'>('login')

const loginForm = reactive({
  identifier: '',
  password: '',
  paymentMethod: '',
  paymentTerm: 'cash',
  installments: 1,
})

const registerForm = reactive({
  username: '',
  name: '',
  lastname: '',
  email: '',
  password: '',
  confirmPassword: '',
  paymentMethod: '',
  paymentTerm: 'cash',
  installments: 1,
})

function isPaidCourse() {
  return course.value?.pricingType === 'paid'
}

function paymentPayload(form: { paymentMethod: string; paymentTerm: string; installments: number }) {
  if (!isPaidCourse()) return {}
  const isPixPayment = form.paymentMethod === 'pix'

  return {
    paymentMethod: form.paymentMethod as 'pix' | 'boleto' | 'card' | 'bank_transfer' | 'cash_in_person',
    paymentTerm: isPixPayment ? 'cash' : form.paymentTerm as 'cash' | 'installments',
    installments: isPixPayment || form.paymentTerm === 'cash' ? 1 : Number(form.installments),
  }
}

function handleAccessResult(enrollmentStatus?: string, enrollment?: CourseEnrollmentRecord) {
  if (enrollmentStatus === 'pending_payment') {
    void router.push({
      name: 'my-courses',
      query: enrollment?.id ? { enrollment: String(enrollment.id) } : undefined,
    })
    return
  }

  void router.push({ name: 'my-courses' })
}

async function loadCourse() {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/public-courses/${route.params.slug}`)
    const payload = (await response.json().catch(() => null)) as CourseRecord | { message?: string } | null

    if (!response.ok) {
      throw new Error(payload && 'message' in payload && payload.message ? payload.message : 'Curso indisponivel.')
    }

    course.value = payload as CourseRecord

    if (course.value.pricingType === 'paid') {
      const defaultMethod = course.value.paymentMethods?.[0] ?? ''
      const defaultTerm =
        course.value.paymentTerms === 'installments' ? 'installments' : 'cash'
      loginForm.paymentMethod = defaultMethod
      loginForm.paymentTerm = defaultTerm
      registerForm.paymentMethod = defaultMethod
      registerForm.paymentTerm = defaultTerm
    }
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Curso indisponivel.'
  }
}

async function submitLogin() {
  errorMessage.value = ''
  isSubmitting.value = true

  try {
    const result = await authStore.loginForPublicCourse(String(route.params.slug), {
      identifier: loginForm.identifier,
      password: loginForm.password,
      ...paymentPayload(loginForm),
    })
    handleAccessResult(result.enrollmentStatus, result.enrollment)
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Nao foi possivel acessar o curso.'
  } finally {
    isSubmitting.value = false
  }
}

async function submitRegister() {
  errorMessage.value = ''

  if (registerForm.password !== registerForm.confirmPassword) {
    errorMessage.value = 'As senhas precisam ser iguais.'
    return
  }

  isSubmitting.value = true

  try {
    const result = await authStore.registerForPublicCourse(String(route.params.slug), {
      username: registerForm.username,
      name: registerForm.name,
      lastname: registerForm.lastname,
      email: registerForm.email,
      password: registerForm.password,
      ...paymentPayload(registerForm),
    })
    handleAccessResult(result.enrollmentStatus, result.enrollment)
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Nao foi possivel concluir o cadastro.'
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  void loadCourse()
})

watch(
  () => loginForm.paymentMethod,
  (paymentMethod) => {
    if (paymentMethod === 'pix') {
      loginForm.paymentTerm = 'cash'
      loginForm.installments = 1
    }
  },
)

watch(
  () => registerForm.paymentMethod,
  (paymentMethod) => {
    if (paymentMethod === 'pix') {
      registerForm.paymentTerm = 'cash'
      registerForm.installments = 1
    }
  },
)
</script>

<template>
  <main class="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
    <section class="mx-auto grid max-w-5xl overflow-hidden rounded-[2rem] border border-white bg-white shadow-xl shadow-slate-900/10 lg:grid-cols-[0.9fr_1.1fr]">
      <aside class="bg-brand-700 p-8 text-white">
        <img v-if="course?.imageUrl" :src="course.imageUrl" :alt="course.fullname" class="mb-6 h-48 w-full rounded-2xl object-cover" />
        <p class="text-sm font-semibold uppercase tracking-[0.22em] text-brand-100">Curso publico</p>
        <h1 class="mt-4 text-4xl font-semibold leading-tight">{{ course?.fullname ?? 'Carregando curso...' }}</h1>
        <div v-if="course?.summary" class="mt-4 text-sm leading-6 text-white/75 [&_a]:underline [&_h3]:text-lg [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-5" v-html="course.summary" />
        <p v-else class="mt-4 text-sm leading-6 text-white/75">Cadastre-se para liberar seu acesso ao curso.</p>
        <p v-if="course" class="mt-6 rounded-xl bg-white/10 px-4 py-3 text-sm">
          {{ course.pricingType === 'paid' ? `Curso pago · ${Number(course.price || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}` : 'Curso gratuito' }}
        </p>
      </aside>

      <div class="p-8">
        <div class="sm:col-span-2">
          <h2 class="text-2xl font-semibold tracking-tight text-slate-900">Acessar curso</h2>
          <div class="mt-5 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              class="rounded-lg px-3 py-2 text-sm font-semibold transition"
              :class="activeMode === 'login' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'"
              @click="activeMode = 'login'; errorMessage = ''"
            >
              Ja tenho cadastro
            </button>
            <button
              type="button"
              class="rounded-lg px-3 py-2 text-sm font-semibold transition"
              :class="activeMode === 'register' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'"
              @click="activeMode = 'register'; errorMessage = ''"
            >
              Novo cadastro
            </button>
          </div>
        </div>

        <form v-if="activeMode === 'login'" class="mt-6 grid gap-5" @submit.prevent="submitLogin">
          <input v-model="loginForm.identifier" placeholder="Username ou e-mail" class="rounded-xl border-slate-200 px-4 py-3 text-sm" />
          <input v-model="loginForm.password" type="password" placeholder="Senha" class="rounded-xl border-slate-200 px-4 py-3 text-sm" />
          <div v-if="isPaidCourse()" class="grid gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:grid-cols-2">
            <select v-model="loginForm.paymentMethod" class="rounded-xl border-slate-200 px-4 py-3 text-sm">
              <option value="">Forma de pagamento</option>
              <option v-if="course?.paymentMethods?.includes('pix')" value="pix">PIX</option>
              <option v-if="course?.paymentMethods?.includes('boleto')" value="boleto">Boleto</option>
              <option v-if="course?.paymentMethods?.includes('card')" value="card">Cartao</option>
              <option v-if="course?.paymentMethods?.includes('bank_transfer')" value="bank_transfer">Transferencia bancaria</option>
              <option v-if="course?.paymentMethods?.includes('cash_in_person')" value="cash_in_person">Dinheiro no local</option>
            </select>
            <div v-if="loginForm.paymentMethod === 'pix'" class="rounded-xl border border-emerald-100 bg-white px-4 py-3 text-sm font-medium text-emerald-700">PIX a vista</div>
            <select v-else v-model="loginForm.paymentTerm" class="rounded-xl border-slate-200 px-4 py-3 text-sm">
              <option v-if="course?.paymentTerms === 'cash' || course?.paymentTerms === 'both'" value="cash">A vista</option>
              <option v-if="course?.paymentTerms === 'installments' || course?.paymentTerms === 'both'" value="installments">A prazo</option>
            </select>
            <input v-if="loginForm.paymentTerm === 'installments'" v-model.number="loginForm.installments" type="number" min="1" :max="course?.maxInstallments ?? 1" placeholder="Parcelas" class="rounded-xl border-slate-200 px-4 py-3 text-sm" />
            <div v-if="loginForm.paymentMethod === 'bank_transfer' && course?.bankTransferDetails" class="sm:col-span-2 rounded-xl border border-brand-100 bg-white p-4 text-sm leading-6 text-slate-700 whitespace-pre-line">{{ course.bankTransferDetails }}</div>
            <div v-if="loginForm.paymentMethod === 'cash_in_person'" class="sm:col-span-2 rounded-xl border border-brand-100 bg-white p-4 text-sm leading-6 text-slate-700">Pagamento em dinheiro no local. O acesso sera liberado apos confirmacao administrativa.</div>
          </div>

          <p v-if="errorMessage" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ errorMessage }}</p>

          <button class="rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white disabled:opacity-70" :disabled="isSubmitting || !course">
            {{ isSubmitting ? 'Entrando...' : 'Entrar e acessar curso' }}
          </button>
        </form>

        <form v-else class="mt-6 grid gap-5 sm:grid-cols-2" @submit.prevent="submitRegister">
          <input v-model="registerForm.username" placeholder="Username" class="rounded-xl border-slate-200 px-4 py-3 text-sm" />
          <input v-model="registerForm.name" placeholder="Nome" class="rounded-xl border-slate-200 px-4 py-3 text-sm" />
          <input v-model="registerForm.lastname" placeholder="Sobrenome" class="rounded-xl border-slate-200 px-4 py-3 text-sm" />
          <input v-model="registerForm.email" type="email" placeholder="E-mail" class="rounded-xl border-slate-200 px-4 py-3 text-sm" />
          <input v-model="registerForm.password" type="password" placeholder="Senha" class="rounded-xl border-slate-200 px-4 py-3 text-sm" />
          <input v-model="registerForm.confirmPassword" type="password" placeholder="Confirmar senha" class="rounded-xl border-slate-200 px-4 py-3 text-sm" />
          <div v-if="isPaidCourse()" class="sm:col-span-2 grid gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:grid-cols-2">
            <select v-model="registerForm.paymentMethod" class="rounded-xl border-slate-200 px-4 py-3 text-sm">
              <option value="">Forma de pagamento</option>
              <option v-if="course?.paymentMethods?.includes('pix')" value="pix">PIX</option>
              <option v-if="course?.paymentMethods?.includes('boleto')" value="boleto">Boleto</option>
              <option v-if="course?.paymentMethods?.includes('card')" value="card">Cartao</option>
              <option v-if="course?.paymentMethods?.includes('bank_transfer')" value="bank_transfer">Transferencia bancaria</option>
              <option v-if="course?.paymentMethods?.includes('cash_in_person')" value="cash_in_person">Dinheiro no local</option>
            </select>
            <div v-if="registerForm.paymentMethod === 'pix'" class="rounded-xl border border-emerald-100 bg-white px-4 py-3 text-sm font-medium text-emerald-700">PIX a vista</div>
            <select v-else v-model="registerForm.paymentTerm" class="rounded-xl border-slate-200 px-4 py-3 text-sm">
              <option v-if="course?.paymentTerms === 'cash' || course?.paymentTerms === 'both'" value="cash">A vista</option>
              <option v-if="course?.paymentTerms === 'installments' || course?.paymentTerms === 'both'" value="installments">A prazo</option>
            </select>
            <input v-if="registerForm.paymentTerm === 'installments'" v-model.number="registerForm.installments" type="number" min="1" :max="course?.maxInstallments ?? 1" placeholder="Parcelas" class="rounded-xl border-slate-200 px-4 py-3 text-sm" />
            <div v-if="registerForm.paymentMethod === 'bank_transfer' && course?.bankTransferDetails" class="sm:col-span-2 rounded-xl border border-brand-100 bg-white p-4 text-sm leading-6 text-slate-700 whitespace-pre-line">{{ course.bankTransferDetails }}</div>
            <div v-if="registerForm.paymentMethod === 'cash_in_person'" class="sm:col-span-2 rounded-xl border border-brand-100 bg-white p-4 text-sm leading-6 text-slate-700">Pagamento em dinheiro no local. O acesso sera liberado apos confirmacao administrativa.</div>
          </div>

          <p v-if="errorMessage" class="sm:col-span-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ errorMessage }}</p>

          <button class="sm:col-span-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white disabled:opacity-70" :disabled="isSubmitting || !course">
            {{ isSubmitting ? 'Cadastrando...' : 'Cadastrar e acessar curso' }}
          </button>
        </form>
      </div>
    </section>
  </main>
</template>
