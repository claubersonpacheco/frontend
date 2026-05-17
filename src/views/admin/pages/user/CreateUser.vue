<script setup lang="ts">
import { reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

import { useUsersStore } from '@/stores/users'
import { useRolesStore } from '@/stores/roles'

const router = useRouter()
const usersStore = useUsersStore()
const rolesStore = useRolesStore()

const form = reactive({
  username: '',
  name: '',
  lastname: '',
  email: '',
  roleId: '',
  password: '',
  confirmPassword: '',
})

const errorMessage = ref('')
const isSubmitting = ref(false)

async function loadRoles() {
  try {
    await rolesStore.fetchRoles()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Nao foi possivel carregar roles.'
  }
}

async function handleSubmit() {
  errorMessage.value = ''

  if (form.password !== form.confirmPassword) {
    errorMessage.value = 'As senhas precisam ser iguais.'
    return
  }

  isSubmitting.value = true

  try {
    await usersStore.createUser({
      ...form,
      roleId: form.roleId ? Number(form.roleId) : null,
    })
    await router.push({ name: 'users' })
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Nao foi possivel criar o usuario.'
  } finally {
    isSubmitting.value = false
  }
}

void loadRoles()
</script>

<template>
  <section class="space-y-6">
    <header class="rounded-md border border-white/70 bg-white/85 p-6 shadow-xl shadow-slate-900/5 backdrop-blur">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p class="text-sm font-medium uppercase tracking-[0.22em] text-brand-700">Novo usuario</p>
          <h1 class="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Criar usuario</h1>
          <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Preencha os dados abaixo para cadastrar um novo usuario no sistema.
          </p>
        </div>

        <RouterLink
          :to="{ name: 'users' }"
          class="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:border-brand-200 hover:text-brand-700"
        >
          Voltar para usuarios
        </RouterLink>
      </div>
    </header>

    <form class="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]" @submit.prevent="handleSubmit">
      <article class="rounded-md border border-white/70 bg-white/90 p-6 shadow-lg shadow-slate-900/5 backdrop-blur">
        <div class="mb-8">
          <h2 class="text-xl font-semibold text-slate-900">Dados do cadastro</h2>
          <p class="mt-1 text-sm text-slate-500">Os campos seguem o mesmo padrao usado no backend.</p>
        </div>

        <div class="grid gap-5 sm:grid-cols-2">
          <div>
            <label for="username" class="mb-2 block text-sm font-medium text-slate-700">Username</label>
            <input id="username" v-model="form.username" type="text" class="block w-full rounded-md border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-brand-500" />
          </div>
          <div>
            <label for="name" class="mb-2 block text-sm font-medium text-slate-700">Nome</label>
            <input id="name" v-model="form.name" type="text" class="block w-full rounded-md border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-brand-500" />
          </div>
          <div>
            <label for="lastname" class="mb-2 block text-sm font-medium text-slate-700">Sobrenome</label>
            <input id="lastname" v-model="form.lastname" type="text" class="block w-full rounded-md border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-brand-500" />
          </div>
          <div class="sm:col-span-2">
            <label for="email" class="mb-2 block text-sm font-medium text-slate-700">E-mail</label>
            <input id="email" v-model="form.email" type="email" class="block w-full rounded-md border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-brand-500" />
          </div>
          <div class="sm:col-span-2">
            <label for="role" class="mb-2 block text-sm font-medium text-slate-700">Role</label>
            <select id="role" v-model="form.roleId" class="block w-full rounded-md border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-brand-500">
              <option value="">Sem role</option>
              <option v-for="role in rolesStore.items" :key="role.id" :value="String(role.id)">
                {{ role.name }}
              </option>
            </select>
          </div>
          <div>
            <label for="password" class="mb-2 block text-sm font-medium text-slate-700">Senha</label>
            <input id="password" v-model="form.password" type="password" class="block w-full rounded-md border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-brand-500" />
          </div>
          <div>
            <label for="confirmPassword" class="mb-2 block text-sm font-medium text-slate-700">Confirmar senha</label>
            <input id="confirmPassword" v-model="form.confirmPassword" type="password" class="block w-full rounded-md border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-brand-500" />
          </div>
        </div>

        <p v-if="errorMessage" class="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {{ errorMessage }}
        </p>

        <div class="mt-8 flex justify-end">
          <button
            type="submit"
            class="inline-flex items-center justify-center rounded-md bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700 disabled:opacity-70"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? 'Salvando...' : 'Criar usuario' }}
          </button>
        </div>
      </article>

      <aside class="rounded-md border border-ink-900/10 bg-[linear-gradient(180deg,_rgba(16,36,24,0.98),_rgba(22,57,38,0.96))] p-6 text-white shadow-xl shadow-ink-900/15">
        <p class="text-sm uppercase tracking-[0.22em] text-brand-100/80">Resumo</p>
        <h2 class="mt-3 text-2xl font-semibold">Cadastro separado por pagina</h2>
        <p class="mt-3 text-sm leading-6 text-white/70">
          Esta tela cuida apenas da criacao, mantendo o CRUD organizado e mais facil de manter.
        </p>
      </aside>
    </form>
  </section>
</template>
