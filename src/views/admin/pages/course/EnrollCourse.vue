<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useCoursesStore } from '@/stores/courses'
import { useRolesStore } from '@/stores/roles'
import { useUsersStore } from '@/stores/users'

const route = useRoute()
const coursesStore = useCoursesStore()
const usersStore = useUsersStore()
const rolesStore = useRolesStore()
const errorMessage = ref('')
const isSubmitting = ref(false)
const approvingEnrollmentId = ref<number | null>(null)

const form = reactive({
  userId: '',
  roleId: '',
})

const courseId = computed(() => String(route.params.id))

const moodleReadyUsers = computed(() =>
  usersStore.items.filter((user) => user.moodleUserId),
)

const moodleReadyRoles = computed(() =>
  rolesStore.items.filter((role) => role.moodleRoleId),
)

async function load() {
  errorMessage.value = ''

  try {
    await Promise.all([
      coursesStore.fetchCourseById(courseId.value),
      coursesStore.fetchEnrollments(courseId.value),
      usersStore.fetchUsers(),
      rolesStore.fetchRoles(),
    ])
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Erro ao carregar matriculas.'
  }
}

async function enroll() {
  errorMessage.value = ''

  if (!form.userId || !form.roleId) {
    errorMessage.value = 'Selecione usuario e papel.'
    return
  }

  isSubmitting.value = true

  try {
    await coursesStore.enrollUser(courseId.value, {
      userId: Number(form.userId),
      roleId: Number(form.roleId),
    })
    form.userId = ''
    form.roleId = ''
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Erro ao matricular usuario.'
  } finally {
    isSubmitting.value = false
  }
}

async function unenroll(enrollmentId: number) {
  errorMessage.value = ''

  try {
    await coursesStore.unenrollUser(courseId.value, enrollmentId)
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Erro ao remover matricula.'
  }
}

async function approvePayment(enrollmentId: number) {
  errorMessage.value = ''
  approvingEnrollmentId.value = enrollmentId

  try {
    await coursesStore.approveEnrollmentPayment(courseId.value, enrollmentId)
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Erro ao confirmar pagamento.'
  } finally {
    approvingEnrollmentId.value = null
  }
}

onMounted(() => {
  void load()
})
</script>

<template>
  <section class="space-y-6">
    <header class="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-xl shadow-slate-900/5 backdrop-blur">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p class="text-sm font-medium uppercase tracking-[0.22em] text-brand-700">Matriculas</p>
          <h1 class="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
            {{ coursesStore.current?.fullname ?? 'Curso' }}
          </h1>
        </div>
        <RouterLink :to="{ name: 'courses' }" class="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:border-brand-200 hover:text-brand-700">Voltar para cursos</RouterLink>
      </div>
    </header>

    <p v-if="errorMessage" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ errorMessage }}</p>

    <article class="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-lg shadow-slate-900/5 backdrop-blur">
      <h2 class="text-xl font-semibold text-slate-900">Adicionar usuario ao curso</h2>
      <div class="mt-5 grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
        <div>
          <label class="mb-2 block text-sm font-medium text-slate-700">Usuario</label>
          <select v-model="form.userId" class="block w-full rounded-xl border-slate-200 px-4 py-3 text-sm">
            <option value="">Selecione</option>
            <option v-for="user in moodleReadyUsers" :key="user.id" :value="String(user.id)">
              {{ user.name }} - {{ user.email }}
            </option>
          </select>
        </div>
        <div>
          <label class="mb-2 block text-sm font-medium text-slate-700">Papel no Moodle</label>
          <select v-model="form.roleId" class="block w-full rounded-xl border-slate-200 px-4 py-3 text-sm">
            <option value="">Selecione</option>
            <option v-for="role in moodleReadyRoles" :key="role.id" :value="String(role.id)">
              {{ role.name }} ({{ role.moodleRoleId }})
            </option>
          </select>
        </div>
        <button type="button" class="rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white disabled:opacity-70" :disabled="isSubmitting" @click="enroll">
          {{ isSubmitting ? 'Matriculando...' : 'Matricular' }}
        </button>
      </div>
    </article>

    <article class="overflow-x-auto rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-lg shadow-slate-900/5 backdrop-blur">
      <h2 class="mb-5 text-xl font-semibold text-slate-900">Usuarios matriculados</h2>
      <table class="min-w-full divide-y divide-slate-200">
        <thead>
          <tr class="text-left text-xs uppercase tracking-[0.18em] text-slate-400">
            <th class="px-4 py-3">Usuario</th>
            <th class="px-4 py-3">E-mail</th>
            <th class="px-4 py-3">Papel</th>
            <th class="px-4 py-3">Status</th>
            <th class="px-4 py-3">Pagamento</th>
            <th class="px-4 py-3 text-right">Acoes</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="enrollment in coursesStore.enrollments" :key="enrollment.id" class="text-sm text-slate-700">
            <td class="px-4 py-4 font-medium text-slate-900">{{ enrollment.user.name }}</td>
            <td class="px-4 py-4">{{ enrollment.user.email }}</td>
            <td class="px-4 py-4">{{ enrollment.role.name }}</td>
            <td class="px-4 py-4">
              <span class="rounded-full px-3 py-1 text-xs font-semibold" :class="enrollment.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'">
                {{ enrollment.status === 'active' ? 'Ativa' : 'Pagamento pendente' }}
              </span>
            </td>
            <td class="px-4 py-4">
              <p class="text-sm">{{ enrollment.paymentMethod || '-' }}</p>
              <p v-if="enrollment.amountDue" class="text-xs text-slate-500">{{ Number(enrollment.amountDue).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}</p>
              <p v-if="enrollment.pixTxid" class="text-xs text-slate-500">PIX {{ enrollment.pixTxid }}</p>
              <p v-if="enrollment.paidAt" class="text-xs text-emerald-600">Pago em {{ new Date(enrollment.paidAt).toLocaleDateString('pt-BR') }}</p>
            </td>
            <td class="px-4 py-4 text-right">
              <div class="flex justify-end gap-2">
                <button v-if="enrollment.status === 'pending_payment'" type="button" class="rounded-xl border border-emerald-200 px-3 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-70" :disabled="approvingEnrollmentId === enrollment.id" @click="approvePayment(enrollment.id)">
                  {{ approvingEnrollmentId === enrollment.id ? 'Confirmando...' : 'Marcar pago' }}
                </button>
                <button type="button" class="rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50" @click="unenroll(enrollment.id)">Remover</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="!coursesStore.enrollments.length" class="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">Nenhum usuario matriculado.</p>
    </article>
  </section>
</template>
