<script setup lang="ts">
import QRCode from 'qrcode'
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useCoursesStore } from '@/stores/courses'

const route = useRoute()
const coursesStore = useCoursesStore()
const errorMessage = ref('')
const isLoading = ref(false)
const pixQrCodeUrl = ref('')
const copyMessage = ref('')

const enrollment = computed(() =>
  coursesStore.myEnrollments.find((item) => item.id === Number(route.params.enrollmentId)),
)

const paymentMethodLabels: Record<string, string> = {
  pix: 'PIX',
  boleto: 'Boleto',
  card: 'Cartao',
  bank_transfer: 'Transferencia bancaria',
  cash_in_person: 'Dinheiro no local',
}

const paymentTermLabels: Record<string, string> = {
  cash: 'A vista',
  installments: 'A prazo',
}

function formatCurrency(value?: string | null) {
  return Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

function paymentMethodLabel(method?: string | null) {
  return method ? paymentMethodLabels[method] ?? method : '-'
}

function paymentTermLabel(term?: string | null, installments?: number | null) {
  if (!term) return '-'
  if (term === 'installments') return `${paymentTermLabels[term]} em ${installments ?? 1}x`
  return paymentTermLabels[term] ?? term
}

async function generatePixQrCode(code?: string | null) {
  pixQrCodeUrl.value = ''
  if (!code) return

  pixQrCodeUrl.value = await QRCode.toDataURL(code, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 260,
  })
}

async function copyPixCode() {
  if (!enrollment.value?.pixCopyPaste) return

  await navigator.clipboard.writeText(enrollment.value.pixCopyPaste)
  copyMessage.value = 'Codigo PIX copiado.'
}

async function load() {
  errorMessage.value = ''
  isLoading.value = true

  try {
    await coursesStore.fetchMyEnrollments()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Erro ao carregar financeiro.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  void load()
})

watch(
  () => enrollment.value?.pixCopyPaste,
  (code) => {
    void generatePixQrCode(code)
  },
)
</script>

<template>
  <section class="space-y-6">
    <header class="rounded-md border border-white/70 bg-white/85 p-6 shadow-xl shadow-slate-900/5 backdrop-blur">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p class="text-sm font-medium uppercase tracking-[0.22em] text-brand-700">Financeiro</p>
          <h1 class="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{{ enrollment?.course.fullname ?? 'Curso' }}</h1>
        </div>
        <RouterLink :to="{ name: 'my-courses' }" class="rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:border-brand-200 hover:text-brand-700">Voltar</RouterLink>
      </div>
    </header>

    <p v-if="errorMessage" class="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ errorMessage }}</p>

    <article v-if="enrollment" class="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <section class="rounded-md border border-white/70 bg-white/90 p-6 shadow-lg shadow-slate-900/5 backdrop-blur">
        <h2 class="text-xl font-semibold text-slate-900">Resumo</h2>
        <dl class="mt-5 grid gap-4 text-sm">
          <div>
            <dt class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Status</dt>
            <dd class="mt-1 font-semibold" :class="enrollment.status === 'active' ? 'text-emerald-700' : 'text-amber-700'">{{ enrollment.status === 'active' ? 'Pago' : 'Pendente' }}</dd>
          </div>
          <div>
            <dt class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Valor</dt>
            <dd class="mt-1 font-semibold text-slate-900">{{ enrollment.amountDue ? formatCurrency(enrollment.amountDue) : 'Gratuito' }}</dd>
          </div>
          <div>
            <dt class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Forma escolhida</dt>
            <dd class="mt-1 font-semibold text-slate-900">{{ paymentMethodLabel(enrollment.paymentMethod) }} · {{ paymentTermLabel(enrollment.paymentTerm, enrollment.installments) }}</dd>
          </div>
          <div v-if="enrollment.paidAt">
            <dt class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Confirmado em</dt>
            <dd class="mt-1 font-semibold text-emerald-700">{{ new Date(enrollment.paidAt).toLocaleDateString('pt-BR') }}</dd>
          </div>
        </dl>
      </section>

      <section class="rounded-md border border-white/70 bg-white/90 p-6 shadow-lg shadow-slate-900/5 backdrop-blur">
        <template v-if="enrollment.status === 'active'">
          <h2 class="text-xl font-semibold text-slate-900">Pagamento confirmado</h2>
          <p class="mt-3 text-sm leading-6 text-slate-600">Seu pagamento foi confirmado e o acesso ao curso esta liberado.</p>
        </template>

        <template v-else-if="enrollment.paymentMethod === 'pix' && enrollment.pixCopyPaste">
          <h2 class="text-xl font-semibold text-slate-900">Pagar com PIX</h2>
          <div v-if="pixQrCodeUrl" class="mt-5 flex justify-center rounded-md bg-slate-50 p-4">
            <img :src="pixQrCodeUrl" alt="QR Code PIX" class="h-56 w-56" />
          </div>
          <textarea :value="enrollment.pixCopyPaste" readonly rows="4" class="mt-4 block w-full rounded-md border-slate-200 bg-white px-4 py-3 text-xs text-slate-700"></textarea>
          <div class="mt-3 flex flex-wrap items-center gap-3">
            <button type="button" class="rounded-md bg-emerald-600 px-4 py-3 text-sm font-semibold text-white" @click="copyPixCode">Copiar codigo PIX</button>
            <span v-if="copyMessage" class="text-sm text-emerald-700">{{ copyMessage }}</span>
          </div>
          <p v-if="enrollment.pixTxid" class="mt-3 text-xs text-slate-500">TXID: {{ enrollment.pixTxid }}</p>
        </template>

        <template v-else-if="enrollment.paymentMethod === 'bank_transfer'">
          <h2 class="text-xl font-semibold text-slate-900">Transferencia bancaria</h2>
          <p v-if="enrollment.course.bankTransferDetails" class="mt-3 whitespace-pre-line text-sm leading-6 text-slate-600">{{ enrollment.course.bankTransferDetails }}</p>
          <p v-else class="mt-3 text-sm leading-6 text-slate-600">Entre em contato com a administracao para receber os dados de transferencia.</p>
        </template>

        <template v-else-if="enrollment.paymentMethod === 'cash_in_person'">
          <h2 class="text-xl font-semibold text-slate-900">Dinheiro no local</h2>
          <p class="mt-3 text-sm leading-6 text-slate-600">O pagamento sera confirmado presencialmente pela administracao.</p>
        </template>

        <template v-else>
          <h2 class="text-xl font-semibold text-slate-900">Pagamento pendente</h2>
          <p class="mt-3 text-sm leading-6 text-slate-600">A confirmacao desta forma de pagamento sera feita pela administracao.</p>
        </template>
      </section>
    </article>

    <p v-else class="rounded-md border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
      {{ isLoading ? 'Carregando financeiro...' : 'Financeiro nao encontrado.' }}
    </p>
  </section>
</template>
