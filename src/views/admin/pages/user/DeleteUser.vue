<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import { useUsersStore } from '@/stores/users'

const route = useRoute()
const router = useRouter()
const usersStore = useUsersStore()

const userName = ref('')
const errorMessage = ref('')
const isSubmitting = ref(false)
const isLoading = ref(false)

async function loadUser() {
  errorMessage.value = ''
  isLoading.value = true

  try {
    const user = await usersStore.fetchUserById(String(route.params.id))
    userName.value = `${user.name} ${user.lastname}`.trim() || user.username
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Nao foi possivel carregar o usuario.'
  } finally {
    isLoading.value = false
  }
}

async function handleDelete() {
  errorMessage.value = ''
  isSubmitting.value = true

  try {
    await usersStore.deleteUser(String(route.params.id))
    await router.push({ name: 'users' })
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Nao foi possivel excluir o usuario.'
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
          <p class="text-sm font-medium uppercase tracking-[0.22em] text-red-600">Excluir usuario</p>
          <h1 class="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Confirmar exclusao</h1>
          <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Revise o usuario selecionado antes de remover o registro da base.
          </p>
        </div>

        <RouterLink
          :to="{ name: 'users' }"
          class="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:border-brand-200 hover:text-brand-700"
        >
          Cancelar
        </RouterLink>
      </div>
    </header>

    <p v-if="errorMessage" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {{ errorMessage }}
    </p>

    <div v-if="!isLoading" class="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <article class="rounded-[2rem] border border-red-200 bg-white/90 p-6 shadow-lg shadow-red-900/5 backdrop-blur">
        <h2 class="text-xl font-semibold text-slate-900">Tem certeza que deseja excluir?</h2>
        <p class="mt-3 text-sm leading-6 text-slate-500">
          O usuario <span class="font-semibold text-slate-900">{{ userName || 'selecionado' }}</span> sera removido permanentemente.
        </p>

        <div class="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-xl bg-red-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700 disabled:opacity-70"
            :disabled="isSubmitting"
            @click="handleDelete"
          >
            {{ isSubmitting ? 'Excluindo...' : 'Excluir usuario' }}
          </button>
          <RouterLink
            :to="{ name: 'users' }"
            class="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-700 transition hover:border-brand-200 hover:text-brand-700"
          >
            Voltar sem excluir
          </RouterLink>
        </div>
      </article>

      <aside class="rounded-[2rem] border border-ink-900/10 bg-[linear-gradient(180deg,_rgba(74,12,12,0.96),_rgba(127,29,29,0.96))] p-6 text-white shadow-xl shadow-red-900/15">
        <p class="text-sm uppercase tracking-[0.22em] text-red-100/80">Atencao</p>
        <h2 class="mt-3 text-2xl font-semibold">Acao irreversivel</h2>
        <p class="mt-3 text-sm leading-6 text-white/70">
          Use esta pagina apenas para confirmar a remocao. A listagem, criacao e edicao seguem separadas em suas proprias telas.
        </p>
      </aside>
    </div>

    <div v-else class="rounded-[2rem] border border-white/70 bg-white/90 p-8 text-sm text-slate-500 shadow-lg shadow-slate-900/5 backdrop-blur">
      Carregando usuario...
    </div>
  </section>
</template>
