<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { RouterLink } from 'vue-router'

import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const { isAuthenticated, user } = storeToRefs(authStore)
</script>

<template>
  <main class="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(31,157,85,0.18),_transparent_30%),linear-gradient(180deg,_rgba(248,251,246,0.98),_rgba(236,244,237,0.95))] px-4 py-10 sm:px-6 lg:px-8">
    <section class="mx-auto grid max-w-6xl gap-8 overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 p-8 shadow-2xl shadow-brand-900/10 backdrop-blur lg:grid-cols-[1.1fr_0.9fr] lg:p-12">
      <div class="space-y-6">
        <span class="inline-flex w-fit rounded-full bg-brand-50 px-4 py-1 text-sm font-semibold text-brand-700">
          Portal do instituto
        </span>

        <div class="space-y-4">
          <h1 class="max-w-2xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            Uma entrada unica para a area publica e o painel administrativo.
          </h1>
          <p class="max-w-2xl text-base leading-7 text-slate-600">
            Se voce estiver autenticado, pode seguir direto para o dashboard. Caso contrario, entre com sua conta para acessar a area protegida.
          </p>
        </div>

        <div class="flex flex-col gap-3 sm:flex-row">
          <RouterLink
            v-if="isAuthenticated"
            to="/dashboard"
            class="inline-flex items-center justify-center rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700"
          >
            Ir para o dashboard
          </RouterLink>

          <RouterLink
            v-else
            to="/auth/login"
            class="inline-flex items-center justify-center rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700"
          >
            Fazer login
          </RouterLink>

          <RouterLink
            to="/cursos"
            class="inline-flex items-center justify-center rounded-xl border border-brand-200 bg-white px-6 py-3 text-sm font-semibold text-brand-700 transition hover:border-brand-300"
          >
            Ver cursos
          </RouterLink>

          <RouterLink
            v-if="!isAuthenticated"
            to="/auth/register"
            class="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-brand-200 hover:text-brand-700"
          >
            Criar conta
          </RouterLink>
        </div>
      </div>

      <aside class="rounded-[1.75rem] bg-[linear-gradient(180deg,_#143b27,_#1f9d55_62%,_#b9efcb)] p-6 text-white shadow-xl shadow-brand-900/15">
        <p class="text-sm uppercase tracking-[0.22em] text-brand-100/80">Status atual</p>
        <h2 class="mt-3 text-2xl font-semibold">
          {{ isAuthenticated ? `Sessao ativa para ${user?.name ?? 'usuario'}` : 'Voce ainda nao esta autenticado' }}
        </h2>
        <p class="mt-3 text-sm leading-6 text-white/75">
          {{ isAuthenticated ? 'A home continua publica, mas agora mostra um atalho direto para a area administrativa.' : 'Ao entrar no sistema, o redirecionamento leva voce automaticamente para o dashboard.' }}
        </p>

        <div class="mt-8 space-y-3">
          <div class="rounded-2xl border border-white/10 bg-white/10 p-4">
            <p class="text-sm text-white/60">Home</p>
            <p class="mt-1 font-medium">Sempre acessivel</p>
          </div>
          <div class="rounded-2xl border border-white/10 bg-white/10 p-4">
            <p class="text-sm text-white/60">Dashboard</p>
            <p class="mt-1 font-medium">Protegido por autenticacao</p>
          </div>
          <div class="rounded-2xl border border-white/10 bg-white/10 p-4">
            <p class="text-sm text-white/60">Fluxo</p>
            <p class="mt-1 font-medium">Login leva ao dashboard e logout volta para o login</p>
          </div>
        </div>
      </aside>
    </section>
  </main>
</template>

<style scoped></style>
