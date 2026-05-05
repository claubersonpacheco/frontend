<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const cards = [
  { label: 'Alunos ativos', value: '1.284', trend: '+8.2%' },
  { label: 'Novas matriculas', value: '96', trend: '+14%' },
  { label: 'Pagamentos pendentes', value: '18', trend: '-5%' },
  { label: 'Satisfacao media', value: '4.8/5', trend: '+0.3' },
]

const userName = computed(() => authStore.user?.name ?? 'usuario')

async function handleLogout() {
  authStore.logout()
  await router.push('/auth/login')
}
</script>

<template>
  <main class="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-6xl space-y-6">
      <header
        class="relative z-20 rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-xl shadow-slate-900/5 backdrop-blur sm:p-6"
      >
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p class="text-sm font-medium uppercase tracking-[0.22em] text-brand-700">
              Dashboard protegido
            </p>
            <h1 class="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              Ola, {{ userName }}
            </h1>
            <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Visualize rapidamente a saude operacional do instituto e acesse seus atalhos
              principais em um unico lugar.
            </p>
          </div>

          <div class="hs-dropdown relative z-30 inline-flex">
           
          </div>
        </div>
      </header>

      <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article
          v-for="card in cards"
          :key="card.label"
          class="rounded-[1.75rem] border border-white/70 bg-white/85 p-5 shadow-lg shadow-slate-900/5 backdrop-blur"
        >
          <p class="text-sm text-slate-500">{{ card.label }}</p>
          <div class="mt-4 flex items-end justify-between">
            <strong class="text-3xl font-semibold tracking-tight text-slate-900">{{
              card.value
            }}</strong>
            <span class="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
              {{ card.trend }}
            </span>
          </div>
        </article>
      </section>

      <section class="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
        <article
          class="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-lg shadow-slate-900/5 backdrop-blur"
        >
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-xl font-semibold text-slate-900">Atividades recentes</h2>
              <p class="mt-1 text-sm text-slate-500">
                Fluxo simulado para sua area administrativa.
              </p>
            </div>
            <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
              >Hoje</span
            >
          </div>

          <div class="mt-6 space-y-4">
            <div class="flex items-start gap-4 rounded-2xl border border-slate-100 p-4">
              <div class="mt-1 size-3 rounded-full bg-brand-500"></div>
              <div>
                <p class="font-medium text-slate-800">Relatorio de frequencia atualizado</p>
                <p class="mt-1 text-sm text-slate-500">
                  Turmas de idiomas do turno da manha sincronizadas.
                </p>
              </div>
            </div>
            <div class="flex items-start gap-4 rounded-2xl border border-slate-100 p-4">
              <div class="mt-1 size-3 rounded-full bg-amber-400"></div>
              <div>
                <p class="font-medium text-slate-800">2 pendencias financeiras detectadas</p>
                <p class="mt-1 text-sm text-slate-500">
                  Recomenda-se revisar cobrancas vencidas desta semana.
                </p>
              </div>
            </div>
            <div class="flex items-start gap-4 rounded-2xl border border-slate-100 p-4">
              <div class="mt-1 size-3 rounded-full bg-sky-500"></div>
              <div>
                <p class="font-medium text-slate-800">Novo lote de matriculas importado</p>
                <p class="mt-1 text-sm text-slate-500">Cadastro concluido para 14 novos alunos.</p>
              </div>
            </div>
          </div>
        </article>

        <aside
          class="rounded-[2rem] border border-ink-900/10 bg-[linear-gradient(180deg,_rgba(16,36,24,0.98),_rgba(22,57,38,0.96))] p-6 text-white shadow-xl shadow-ink-900/15"
        >
          <p class="text-sm uppercase tracking-[0.22em] text-brand-100/80">Resumo rapido</p>
          <h2 class="mt-3 text-2xl font-semibold">Sua rota agora esta protegida.</h2>
          <p class="mt-3 text-sm leading-6 text-white/70">
            Ao sair, qualquer tentativa de abrir <code>/dashboard</code> redireciona automaticamente
            para <code>/auth/login</code>.
          </p>

          <div class="mt-8 space-y-3">
            <RouterLink
              :to="{ name: 'profile' }"
              class="block rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10"
            >
              <p class="text-sm text-white/60">Perfil</p>
              <p class="mt-1 font-medium">Abra a pagina para alterar seus dados</p>
            </RouterLink>
            <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p class="text-sm text-white/60">Guard de rota</p>
              <p class="mt-1 font-medium">Ativo no `beforeEach`</p>
            </div>
            <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p class="text-sm text-white/60">Autenticacao</p>
              <p class="mt-1 font-medium">Persistida em `localStorage`</p>
            </div>
          </div>
        </aside>
      </section>
    </div>
  </main>
</template>
