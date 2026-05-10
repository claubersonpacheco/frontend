<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import { useUsersStore } from '@/stores/users'
import { useRolesStore } from '@/stores/roles'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const usersStore = useUsersStore()
const rolesStore = useRolesStore()
const authStore = useAuthStore()

const form = reactive({
  username: '',
  name: '',
  lastname: '',
  email: '',
  roleId: '',
})

const errorMessage = ref('')
const isSubmitting = ref(false)
const isLoading = ref(false)
const canUpdateEmail = authStore.hasPermission('user.email')

async function loadUser() {
  errorMessage.value = ''
  isLoading.value = true

  try {
    const [user] = await Promise.all([
      usersStore.fetchUserById(String(route.params.id)),
      rolesStore.fetchRoles(),
    ])
    form.username = user.username
    form.name = user.name
    form.lastname = user.lastname
    form.email = user.email
    form.roleId = user.role?.id.toString() ?? ''
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Nao foi possivel carregar o usuario.'
  } finally {
    isLoading.value = false
  }
}

async function handleSubmit() {
  errorMessage.value = ''
  isSubmitting.value = true

  try {
    await usersStore.updateUser(String(route.params.id), {
      username: form.username,
      name: form.name,
      lastname: form.lastname,
      ...(canUpdateEmail ? { email: form.email } : {}),
      roleId: form.roleId ? Number(form.roleId) : null,
    })
    await router.push({ name: 'users' })
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Nao foi possivel atualizar o usuario.'
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  void loadUser()
})
</script>

<template>
  <section class="space-y-6">
    <header class="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-xl shadow-slate-900/5 backdrop-blur">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p class="text-sm font-medium uppercase tracking-[0.22em] text-brand-700">Editar usuario</p>
          <h1 class="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Atualizar cadastro</h1>
          <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Ajuste os campos do usuario selecionado e sincronize as alteracoes com a API.
          </p>
        </div>

        <RouterLink
          :to="{ name: 'users' }"
          class="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:border-brand-200 hover:text-brand-700"
        >
          Voltar para usuarios
        </RouterLink>
      </div>
    </header>

    <p v-if="errorMessage" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {{ errorMessage }}
    </p>

    <form v-if="!isLoading" class="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]" @submit.prevent="handleSubmit">
      <article class="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-lg shadow-slate-900/5 backdrop-blur">
        <div class="mb-8">
          <h2 class="text-xl font-semibold text-slate-900">Dados do usuario</h2>
          <p class="mt-1 text-sm text-slate-500">Atualize username, nome, sobrenome, e-mail e role.</p>
        </div>

        <div class="grid gap-5 sm:grid-cols-2">
          <div>
            <label for="username" class="mb-2 block text-sm font-medium text-slate-700">Username</label>
            <input id="username" v-model="form.username" type="text" class="block w-full rounded-xl border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-brand-500" />
          </div>
          <div>
            <label for="name" class="mb-2 block text-sm font-medium text-slate-700">Nome</label>
            <input id="name" v-model="form.name" type="text" class="block w-full rounded-xl border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-brand-500" />
          </div>
          <div>
            <label for="lastname" class="mb-2 block text-sm font-medium text-slate-700">Sobrenome</label>
            <input id="lastname" v-model="form.lastname" type="text" class="block w-full rounded-xl border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-brand-500" />
          </div>
          <div class="sm:col-span-2">
            <label for="email" class="mb-2 block text-sm font-medium text-slate-700">E-mail</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              class="block w-full rounded-xl border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-brand-500 disabled:bg-slate-100 disabled:text-slate-500"
              :disabled="!canUpdateEmail"
            />
           
          </div>
          <div class="sm:col-span-2">
            <label for="role" class="mb-2 block text-sm font-medium text-slate-700">Role</label>
            <select id="role" v-model="form.roleId" class="block w-full rounded-xl border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-brand-500">
              <option value="">Sem role</option>
              <option v-for="role in rolesStore.items" :key="role.id" :value="String(role.id)">
                {{ role.name }}
              </option>
            </select>
          </div>
        </div>

        <div class="mt-8 flex justify-end">
          <button
            type="submit"
            class="inline-flex items-center justify-center rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700 disabled:opacity-70"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? 'Salvando...' : 'Salvar alteracoes' }}
          </button>
        </div>
      </article>

      <aside class="rounded-[2rem] border border-ink-900/10 bg-[linear-gradient(180deg,_rgba(16,36,24,0.98),_rgba(22,57,38,0.96))] p-6 text-white shadow-xl shadow-ink-900/15">
        <p class="text-sm uppercase tracking-[0.22em] text-brand-100/80">Operacao</p>
        <h2 class="mt-3 text-2xl font-semibold">Edicao isolada</h2>
        <p class="mt-3 text-sm leading-6 text-white/70">
          A tela de edicao fica separada da listagem para manter o CRUD mais limpo e claro.
        </p>
      </aside>
    </form>

    <div v-else class="rounded-[2rem] border border-white/70 bg-white/90 p-8 text-sm text-slate-500 shadow-lg shadow-slate-900/5 backdrop-blur">
      Carregando dados do usuario...
    </div>
  </section>
</template>
