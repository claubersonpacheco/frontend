<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { usePermissionsStore } from '@/stores/permissions'
import { useRolesStore } from '@/stores/roles'

const router = useRouter()
const rolesStore = useRolesStore()
const permissionsStore = usePermissionsStore()
const form = reactive({
  name: '',
  description: '',
  moodleRoleId: '',
  permissionIds: [] as number[],
})
const errorMessage = ref('')

onMounted(async () => {
  try {
    await permissionsStore.fetchPermissions()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Erro ao carregar permissoes.'
  }
})

async function save() {
  errorMessage.value = ''
  try {
    await rolesStore.createRole({
      name: form.name,
      description: form.description,
      moodleRoleId: form.moodleRoleId.trim() ? Number(form.moodleRoleId) : null,
      permissionIds: form.permissionIds,
    })
    await router.push({ name: 'roles' })
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Erro ao criar role.'
  }
}
</script>

<template>
  <section class="space-y-6">
    <header class="rounded-md border border-white/70 bg-white/85 p-6 shadow-xl shadow-slate-900/5 backdrop-blur">
      <h1 class="text-3xl font-semibold tracking-tight text-slate-900">Novo role</h1>
    </header>
    <article class="rounded-md border border-white/70 bg-white/90 p-6 shadow-lg shadow-slate-900/5 backdrop-blur">
      <div class="grid gap-4 sm:grid-cols-2">
        <input v-model="form.name" placeholder="Nome" class="rounded-md border-slate-200 px-4 py-3 text-sm" />
        <input v-model="form.moodleRoleId" placeholder="ID da role no Moodle" class="rounded-md border-slate-200 px-4 py-3 text-sm" />
        <textarea v-model="form.description" placeholder="Descricao" class="rounded-md border-slate-200 px-4 py-3 text-sm sm:col-span-2" />
        <div class="sm:col-span-2">
          <p class="mb-2 text-sm font-medium text-slate-700">Permissoes do sistema</p>
          <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <label v-for="permission in permissionsStore.items" :key="permission.id" class="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
              <input v-model="form.permissionIds" type="checkbox" :value="permission.id" class="rounded-md border-slate-300 text-brand-600 focus:ring-brand-500" />
              {{ permission.name }}
            </label>
          </div>
        </div>
      </div>
      <p v-if="errorMessage" class="mt-4 text-sm text-red-600">{{ errorMessage }}</p>
      <div class="mt-6 flex gap-2">
        <button class="rounded-md bg-brand-600 px-6 py-3 text-sm font-semibold text-white" @click="save">Salvar</button>
        <RouterLink :to="{ name: 'roles' }" class="rounded-md border border-slate-200 px-6 py-3 text-sm">Cancelar</RouterLink>
      </div>
    </article>
  </section>
</template>
