<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import RichTextEditor from '@/components/RichTextEditor.vue'
import { useCategoriesStore } from '@/stores/categories'
import { useCoursesStore } from '@/stores/courses'

const router = useRouter()
const coursesStore = useCoursesStore()
const categoriesStore = useCategoriesStore()
const errorMessage = ref('')
const isSubmitting = ref(false)
const selectedImage = ref<File | null>(null)
const imagePreview = ref('')

const form = reactive({
  fullname: '',
  shortname: '',
  summary: '',
  visible: '1',
  isPublic: 'false',
  accessType: 'private' as 'open' | 'private',
  pricingType: 'free' as 'free' | 'paid',
  price: 0,
  capacityType: 'unlimited' as 'unlimited' | 'limited',
  capacityLimit: 1,
  paymentMethods: [] as string[],
  paymentTerms: 'cash' as 'cash' | 'installments' | 'both',
  maxInstallments: 1,
  bankTransferDetails: '',
  startdate: '',
  enddate: '',
  categoryId: 1,
})

function handleImageChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0] ?? null
  selectedImage.value = file
  imagePreview.value = file ? URL.createObjectURL(file) : ''
}

onMounted(async () => {
  try {
    await categoriesStore.fetchCategories()
    if (categoriesStore.items[0]) form.categoryId = categoriesStore.items[0].id
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Erro ao carregar categorias.'
  }
})

async function save(redirectToEnrollments = false) {
  errorMessage.value = ''
  isSubmitting.value = true

  try {
    const course = await coursesStore.createCourse({
      ...form,
      isPublic: form.accessType === 'open' ? 'true' : 'false',
      price: form.pricingType === 'paid' ? Number(form.price) : undefined,
      capacityLimit:
        form.capacityType === 'limited' ? Number(form.capacityLimit) : undefined,
      paymentMethods:
        form.pricingType === 'paid' ? [...form.paymentMethods] : undefined,
      maxInstallments:
        form.paymentTerms === 'installments' || form.paymentTerms === 'both'
          ? Number(form.maxInstallments)
          : undefined,
      bankTransferDetails: form.paymentMethods.includes('bank_transfer')
        ? form.bankTransferDetails
        : undefined,
    })
    if (selectedImage.value) {
      await coursesStore.uploadCourseImage(course.id, selectedImage.value)
    }
    await router.push(
      redirectToEnrollments
        ? { name: 'courses-enrollments', params: { id: course.id } }
        : { name: 'courses' },
    )
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Erro ao criar curso.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <section class="space-y-6">
    <header class="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-xl shadow-slate-900/5 backdrop-blur">
      <h1 class="text-3xl font-semibold tracking-tight text-slate-900">Novo curso</h1>
    </header>

    <article class="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-lg shadow-slate-900/5 backdrop-blur">
      <div class="grid gap-4 sm:grid-cols-2">
        <input v-model="form.fullname" placeholder="Nome completo" class="rounded-xl border-slate-200 px-4 py-3 text-sm" />
        <input v-model="form.shortname" placeholder="Nome curto" class="rounded-xl border-slate-200 px-4 py-3 text-sm" />

        <div class="sm:col-span-2 grid gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:grid-cols-[220px_1fr] sm:items-center">
          <img v-if="imagePreview" :src="imagePreview" alt="Preview da imagem do curso" class="h-32 w-full rounded-xl object-cover" />
          <div v-else class="flex h-32 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white text-sm text-slate-400">Imagem do curso</div>
          <label class="text-sm font-medium text-slate-700">
            Imagem de capa
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" class="mt-2 block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm" @change="handleImageChange" />
          </label>
        </div>

        <select v-model.number="form.categoryId" class="rounded-xl border-slate-200 px-4 py-3 text-sm">
          <option v-for="cat in categoriesStore.items" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
        </select>

        <div class="sm:col-span-2 grid gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:grid-cols-2">
          <label class="text-sm font-medium text-slate-700">
            Acesso
            <select v-model="form.accessType" class="mt-2 block w-full rounded-xl border-slate-200 px-4 py-3 text-sm">
              <option value="private">Privado</option>
              <option value="open">Aberto</option>
            </select>
          </label>
          <label class="text-sm font-medium text-slate-700">
            Tipo
            <select v-model="form.pricingType" class="mt-2 block w-full rounded-xl border-slate-200 px-4 py-3 text-sm">
              <option value="free">Gratuito</option>
              <option value="paid">Pago</option>
            </select>
          </label>
          <label v-if="form.pricingType === 'paid'" class="text-sm font-medium text-slate-700">
            Valor
            <input v-model.number="form.price" type="number" min="0" step="0.01" class="mt-2 block w-full rounded-xl border-slate-200 px-4 py-3 text-sm" />
          </label>
          <label class="text-sm font-medium text-slate-700">
            Vagas
            <select v-model="form.capacityType" class="mt-2 block w-full rounded-xl border-slate-200 px-4 py-3 text-sm">
              <option value="unlimited">Ilimitado</option>
              <option value="limited">Limitado</option>
            </select>
          </label>
          <label v-if="form.capacityType === 'limited'" class="text-sm font-medium text-slate-700">
            Limite de vagas
            <input v-model.number="form.capacityLimit" type="number" min="1" class="mt-2 block w-full rounded-xl border-slate-200 px-4 py-3 text-sm" />
          </label>
          <div v-if="form.pricingType === 'paid'" class="sm:col-span-2 grid gap-4 sm:grid-cols-2">
            <fieldset class="rounded-xl border border-slate-200 bg-white p-4">
              <legend class="px-1 text-sm font-medium text-slate-700">Forma de pagamento</legend>
              <label class="mt-2 flex items-center gap-2 text-sm"><input v-model="form.paymentMethods" type="checkbox" value="pix" /> PIX</label>
              <label class="mt-2 flex items-center gap-2 text-sm"><input v-model="form.paymentMethods" type="checkbox" value="boleto" /> Boleto</label>
              <label class="mt-2 flex items-center gap-2 text-sm"><input v-model="form.paymentMethods" type="checkbox" value="card" /> Cartao</label>
              <label class="mt-2 flex items-center gap-2 text-sm"><input v-model="form.paymentMethods" type="checkbox" value="bank_transfer" /> Transferencia bancaria</label>
              <label class="mt-2 flex items-center gap-2 text-sm"><input v-model="form.paymentMethods" type="checkbox" value="cash_in_person" /> Dinheiro no local</label>
            </fieldset>
            <label class="text-sm font-medium text-slate-700">
              Condicao
              <select v-model="form.paymentTerms" class="mt-2 block w-full rounded-xl border-slate-200 px-4 py-3 text-sm">
                <option value="cash">A vista</option>
                <option value="installments">A prazo</option>
                <option value="both">A vista ou a prazo</option>
              </select>
            </label>
            <label v-if="form.paymentTerms !== 'cash'" class="text-sm font-medium text-slate-700">
              Maximo de parcelas
              <input v-model.number="form.maxInstallments" type="number" min="1" class="mt-2 block w-full rounded-xl border-slate-200 px-4 py-3 text-sm" />
            </label>
            <label v-if="form.paymentMethods.includes('bank_transfer')" class="sm:col-span-2 text-sm font-medium text-slate-700">
              Dados para transferencia bancaria
              <textarea v-model="form.bankTransferDetails" rows="5" placeholder="Banco, agencia, conta, titular, IBAN/SWIFT ou instrucoes para transferencia" class="mt-2 block w-full rounded-xl border-slate-200 px-4 py-3 text-sm" />
            </label>
          </div>
        </div>

        <input v-model="form.startdate" type="datetime-local" class="rounded-xl border-slate-200 px-4 py-3 text-sm" />
        <input v-model="form.enddate" type="datetime-local" class="rounded-xl border-slate-200 px-4 py-3 text-sm" />
        <RichTextEditor v-model="form.summary" placeholder="Resumo do curso" />
      </div>

      <p v-if="errorMessage" class="mt-4 text-sm text-red-600">{{ errorMessage }}</p>

      <div class="mt-6 flex flex-wrap gap-2">
        <button class="rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white disabled:opacity-70" :disabled="isSubmitting" @click="save(false)">
          {{ isSubmitting ? 'Salvando...' : 'Salvar' }}
        </button>
        <button class="rounded-xl border border-brand-200 bg-brand-50 px-6 py-3 text-sm font-semibold text-brand-700 disabled:opacity-70" :disabled="isSubmitting" @click="save(true)">
          Salvar e matricular alunos
        </button>
        <RouterLink :to="{ name: 'courses' }" class="rounded-xl border border-slate-200 px-6 py-3 text-sm">Cancelar</RouterLink>
      </div>
    </article>
  </section>
</template>
