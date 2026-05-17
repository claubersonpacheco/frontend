<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import RichTextEditor from '@/components/RichTextEditor.vue'
import { useCategoriesStore } from '@/stores/categories'
import { useCoursesStore } from '@/stores/courses'

const route = useRoute()
const router = useRouter()
const coursesStore = useCoursesStore()
const categoriesStore = useCategoriesStore()
const errorMessage = ref('')
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

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

watch(
  () => form.fullname,
  (fullname) => {
    form.shortname = slugify(fullname)
  },
)

function handleImageChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0] ?? null
  selectedImage.value = file
  imagePreview.value = file ? URL.createObjectURL(file) : (coursesStore.current?.imageUrl ?? '')
}

onMounted(async () => {
  try {
    await categoriesStore.fetchCategories()
    const course = await coursesStore.fetchCourseById(String(route.params.id))
    form.fullname = course.fullname
    form.shortname = course.shortname
    form.summary = course.summary ?? ''
    form.visible = course.visible ?? '1'
    form.isPublic = course.isPublic ? 'true' : 'false'
    form.accessType = course.accessType ?? (course.isPublic ? 'open' : 'private')
    form.pricingType = course.pricingType ?? 'free'
    form.price = course.price ? Number(course.price) : 0
    form.capacityType = course.capacityType ?? 'unlimited'
    form.capacityLimit = course.capacityLimit ?? 1
    form.paymentMethods = course.paymentMethods ?? []
    form.paymentTerms = course.paymentTerms ?? 'cash'
    form.maxInstallments = course.maxInstallments ?? 1
    form.bankTransferDetails = course.bankTransferDetails ?? ''
    imagePreview.value = course.imageUrl ?? ''
    form.startdate = course.startdate ? new Date(course.startdate).toISOString().slice(0, 16) : ''
    form.enddate = course.enddate ? new Date(course.enddate).toISOString().slice(0, 16) : ''
    form.categoryId = course.category.id
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Erro ao carregar curso.'
  }
})

async function save() {
  try {
    const course = await coursesStore.updateCourse(String(route.params.id), {
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
    await router.push({ name: 'courses' })
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Erro ao salvar curso.'
  }
}
</script>

<template>
  <section class="space-y-6">
    <header class="rounded-md border border-white/70 bg-white/85 p-6 shadow-xl shadow-slate-900/5 backdrop-blur">
      <h1 class="text-3xl font-semibold tracking-tight text-slate-900">Editar curso</h1>
    </header>

    <article class="rounded-md border border-white/70 bg-white/90 p-6 shadow-lg shadow-slate-900/5 backdrop-blur">
      <div class="grid gap-4 sm:grid-cols-2">
        <input v-model="form.fullname" class="rounded-md border-slate-200 px-4 py-3 text-sm" />
        <input v-model="form.shortname" class="rounded-md border-slate-200 px-4 py-3 text-sm" />

        <div class="sm:col-span-2 grid gap-4 rounded-md border border-slate-100 bg-slate-50 p-4 sm:grid-cols-[220px_1fr] sm:items-center">
          <img v-if="imagePreview" :src="imagePreview" alt="Imagem atual do curso" class="h-32 w-full rounded-md object-cover" />
          <div v-else class="flex h-32 items-center justify-center rounded-md border border-dashed border-slate-200 bg-white text-sm text-slate-400">Sem imagem</div>
          <label class="text-sm font-medium text-slate-700">
            Imagem de capa
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" class="mt-2 block w-full rounded-md border border-slate-200 bg-white px-4 py-3 text-sm" @change="handleImageChange" />
          </label>
        </div>

        <select v-model.number="form.categoryId" class="rounded-md border-slate-200 px-4 py-3 text-sm">
          <option v-for="cat in categoriesStore.items" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
        </select>

        <div class="sm:col-span-2 grid gap-4 rounded-md border border-slate-100 bg-slate-50 p-4 sm:grid-cols-2">
          <label class="text-sm font-medium text-slate-700">
            Acesso
            <select v-model="form.accessType" class="mt-2 block w-full rounded-md border-slate-200 px-4 py-3 text-sm">
              <option value="private">Privado</option>
              <option value="open">Aberto</option>
            </select>
          </label>
          <label class="text-sm font-medium text-slate-700">
            Tipo
            <select v-model="form.pricingType" class="mt-2 block w-full rounded-md border-slate-200 px-4 py-3 text-sm">
              <option value="free">Gratuito</option>
              <option value="paid">Pago</option>
            </select>
          </label>
          <label v-if="form.pricingType === 'paid'" class="text-sm font-medium text-slate-700">
            Valor
            <input v-model.number="form.price" type="number" min="0" step="0.01" class="mt-2 block w-full rounded-md border-slate-200 px-4 py-3 text-sm" />
          </label>
          <label class="text-sm font-medium text-slate-700">
            Vagas
            <select v-model="form.capacityType" class="mt-2 block w-full rounded-md border-slate-200 px-4 py-3 text-sm">
              <option value="unlimited">Ilimitado</option>
              <option value="limited">Limitado</option>
            </select>
          </label>
          <label v-if="form.capacityType === 'limited'" class="text-sm font-medium text-slate-700">
            Limite de vagas
            <input v-model.number="form.capacityLimit" type="number" min="1" class="mt-2 block w-full rounded-md border-slate-200 px-4 py-3 text-sm" />
          </label>
          <div v-if="form.pricingType === 'paid'" class="sm:col-span-2 grid gap-4 sm:grid-cols-2">
            <fieldset class="rounded-md border border-slate-200 bg-white p-4">
              <legend class="px-1 text-sm font-medium text-slate-700">Forma de pagamento</legend>
              <label class="mt-2 flex items-center gap-2 text-sm"><input v-model="form.paymentMethods" type="checkbox" value="pix" /> PIX</label>
              <label class="mt-2 flex items-center gap-2 text-sm"><input v-model="form.paymentMethods" type="checkbox" value="boleto" /> Boleto</label>
              <label class="mt-2 flex items-center gap-2 text-sm"><input v-model="form.paymentMethods" type="checkbox" value="card" /> Cartao</label>
              <label class="mt-2 flex items-center gap-2 text-sm"><input v-model="form.paymentMethods" type="checkbox" value="bank_transfer" /> Transferencia bancaria</label>
              <label class="mt-2 flex items-center gap-2 text-sm"><input v-model="form.paymentMethods" type="checkbox" value="cash_in_person" /> Dinheiro no local</label>
            </fieldset>
            <label class="text-sm font-medium text-slate-700">
              Condicao
              <select v-model="form.paymentTerms" class="mt-2 block w-full rounded-md border-slate-200 px-4 py-3 text-sm">
                <option value="cash">A vista</option>
                <option value="installments">A prazo</option>
                <option value="both">A vista ou a prazo</option>
              </select>
            </label>
            <label v-if="form.paymentTerms !== 'cash'" class="text-sm font-medium text-slate-700">
              Maximo de parcelas
              <input v-model.number="form.maxInstallments" type="number" min="1" class="mt-2 block w-full rounded-md border-slate-200 px-4 py-3 text-sm" />
            </label>
            <label v-if="form.paymentMethods.includes('bank_transfer')" class="sm:col-span-2 text-sm font-medium text-slate-700">
              Dados para transferencia bancaria
              <textarea v-model="form.bankTransferDetails" rows="5" placeholder="Banco, agencia, conta, titular, IBAN/SWIFT ou instrucoes para transferencia" class="mt-2 block w-full rounded-md border-slate-200 px-4 py-3 text-sm" />
            </label>
          </div>
        </div>

        <input v-model="form.startdate" type="datetime-local" class="rounded-md border-slate-200 px-4 py-3 text-sm" />
        <input v-model="form.enddate" type="datetime-local" class="rounded-md border-slate-200 px-4 py-3 text-sm" />
        <RichTextEditor v-model="form.summary" placeholder="Resumo do curso" />
      </div>

      <p v-if="errorMessage" class="mt-4 text-sm text-red-600">{{ errorMessage }}</p>

      <div class="mt-6 flex gap-2">
        <button class="rounded-md bg-brand-600 px-6 py-3 text-sm font-semibold text-white" @click="save">Salvar</button>
        <RouterLink :to="{ name: 'courses' }" class="rounded-md border border-slate-200 px-6 py-3 text-sm">Cancelar</RouterLink>
      </div>
    </article>
  </section>
</template>
