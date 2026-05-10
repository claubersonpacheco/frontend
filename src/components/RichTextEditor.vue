<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'

const props = defineProps<{
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const editorRoot = ref<HTMLElement | null>(null)
const isPreview = ref(false)
let quill: Quill | null = null

const html = computed(() => props.modelValue || '')

function normalizeHtml(value: string) {
  return value === '<p><br></p>' ? '' : value
}

function setEditorHtml(value: string) {
  if (!quill) return
  const currentSelection = quill.getSelection()
  const editor = quill.root

  if (editor.innerHTML !== value) {
    editor.innerHTML = value || ''
  }

  if (currentSelection) {
    quill.setSelection(currentSelection)
  }
}

onMounted(() => {
  if (!editorRoot.value) return

  quill = new Quill(editorRoot.value, {
    theme: 'snow',
    placeholder: props.placeholder || 'Digite o conteudo formatado...',
    modules: {
      toolbar: [
        [{ header: [2, 3, false] }],
        ['bold', 'italic', 'underline'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link'],
        ['clean'],
      ],
    },
  })

  setEditorHtml(props.modelValue)

  quill.on('text-change', () => {
    emit('update:modelValue', normalizeHtml(quill?.root.innerHTML ?? ''))
  })
})

watch(
  () => props.modelValue,
  (value) => {
    void nextTick(() => setEditorHtml(value || ''))
  },
)

onBeforeUnmount(() => {
  quill = null
})
</script>

<template>
  <div class="sm:col-span-2 overflow-hidden rounded-2xl border border-slate-200 bg-white">
    <div class="flex justify-end border-b border-slate-100 bg-slate-50 px-3 py-2">
      <button type="button" class="rounded-lg px-3 py-2 text-sm font-medium text-brand-700 hover:bg-white" @click="isPreview = !isPreview">
        {{ isPreview ? 'Editar' : 'Preview' }}
      </button>
    </div>

    <div v-show="!isPreview" class="[&_.ql-container]:min-h-48 [&_.ql-container]:border-0 [&_.ql-editor]:min-h-48 [&_.ql-toolbar]:border-x-0 [&_.ql-toolbar]:border-t-0">
      <div ref="editorRoot" />
    </div>

    <div v-if="isPreview" class="prose prose-sm min-h-48 max-w-none px-4 py-3 text-slate-800" v-html="html || '<p class=&quot;text-slate-400&quot;>Sem conteudo.</p>'" />
  </div>
</template>

