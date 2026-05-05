<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useRolesStore } from '@/stores/roles'

const route = useRoute()
const router = useRouter()
const rolesStore = useRolesStore()
const name = ref('')
const errorMessage = ref('')

onMounted(async () => {
  try {
    const item = await rolesStore.fetchRoleById(String(route.params.id))
    name.value = item.name
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Erro ao carregar role.'
  }
})

async function remove() {
  errorMessage.value = ''
  try {
    await rolesStore.deleteRole(String(route.params.id))
    await router.push({ name: 'roles' })
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Erro ao excluir role.'
  }
}
</script>

<template>
  <section class="space-y-6">
    <header class="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-xl shadow-slate-900/5 backdrop-blur">
      <h1 class="text-3xl font-semibold tracking-tight text-slate-900">Excluir role</h1>
    </header>
    <article class="rounded-[2rem] border border-red-200 bg-white/90 p-6 shadow-lg shadow-red-900/5 backdrop-blur">
      <p>Deseja excluir <strong>{{ name }}</strong>?</p>
      <p v-if="errorMessage" class="mt-4 text-sm text-red-600">{{ errorMessage }}</p>
      <div class="mt-6 flex gap-2">
        <button class="rounded-xl bg-red-600 px-6 py-3 text-sm font-semibold text-white" @click="remove">Excluir</button>
        <RouterLink :to="{ name: 'roles' }" class="rounded-xl border border-slate-200 px-6 py-3 text-sm">Cancelar</RouterLink>
      </div>
    </article>
  </section>
</template>
