<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useNotesStore, type Note } from '@/stores/notes'

interface Segment {
  text: string
  match: boolean
}

const store = useNotesStore()
const query = ref('')
const title = ref('')
const content = ref('')
const editingId = ref<string | null>(null)
let timer: ReturnType<typeof setTimeout> | undefined

onMounted(() => {
  void store.fetchNotes()
})

watch(query, (value) => {
  clearTimeout(timer)
  timer = setTimeout(() => {
    void store.fetchNotes(value)
  }, 300)
})

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function highlight(text: string): Segment[] {
  const term = query.value.trim()
  if (!term) {
    return [{ text, match: false }]
  }
  const regex = new RegExp(`(${escapeRegExp(term)})`, 'gi')
  return text
    .split(regex)
    .filter((part) => part !== '')
    .map((part) => ({ text: part, match: part.toLowerCase() === term.toLowerCase() }))
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function resetForm(): void {
  title.value = ''
  content.value = ''
  editingId.value = null
}

function startEdit(note: Note): void {
  title.value = note.title
  content.value = note.content
  editingId.value = note.id
}

async function onSubmit(): Promise<void> {
  const ok = await store.saveNote(
    { title: title.value, content: content.value },
    editingId.value ?? undefined,
  )
  if (ok) {
    resetForm()
    await store.fetchNotes(query.value)
  }
}

async function onDelete(id: string): Promise<void> {
  const ok = await store.removeNote(id)
  if (ok) {
    await store.fetchNotes(query.value)
  }
}
</script>

<template>
  <section class="notes">
    <form class="card notes__form" @submit.prevent="onSubmit">
      <h2 class="card__title">{{ editingId ? 'Editar nota' : 'Nueva nota' }}</h2>
      <div class="field">
        <label for="title">Título</label>
        <input id="title" v-model="title" class="input" type="text" maxlength="200" required />
      </div>
      <div class="field">
        <label for="content">Contenido</label>
        <textarea id="content" v-model="content" class="textarea"></textarea>
      </div>
      <div class="form-actions">
        <button class="btn btn--primary" type="submit">
          {{ editingId ? 'Guardar cambios' : 'Crear nota' }}
        </button>
        <button v-if="editingId" class="btn btn--ghost" type="button" @click="resetForm">
          Cancelar
        </button>
      </div>
    </form>

    <div>
      <div class="notes__toolbar">
        <div>
          <h2 class="notes__heading">Mis notas</h2>
          <p class="notes__count">{{ store.notes.length }} nota(s)</p>
        </div>
        <input
          v-model="query"
          class="input search"
          type="search"
          placeholder="Buscar en título o contenido"
          aria-label="Buscar notas"
        />
      </div>

      <p v-if="store.error" class="alert" role="alert">{{ store.error }}</p>
      <p v-if="store.loading" class="muted">Cargando...</p>
      <div v-else-if="store.notes.length === 0" class="empty">
        {{
          query.trim()
            ? 'No se encontraron notas con esa búsqueda.'
            : 'Aún no tienes notas. Crea la primera desde el formulario.'
        }}
      </div>

      <ul v-else class="notes__grid">
        <li v-for="note in store.notes" :key="note.id" class="card note">
          <h3 class="note__title">
            <template v-for="(part, i) in highlight(note.title)" :key="i">
              <mark v-if="part.match">{{ part.text }}</mark>
              <template v-else>{{ part.text }}</template>
            </template>
          </h3>
          <p class="note__content">
            <template v-for="(part, i) in highlight(note.content)" :key="i">
              <mark v-if="part.match">{{ part.text }}</mark>
              <template v-else>{{ part.text }}</template>
            </template>
          </p>
          <div class="note__footer">
            <span class="note__date">{{ formatDate(note.updatedAt) }}</span>
            <div class="note__actions">
              <button class="btn btn--ghost btn--sm" type="button" @click="startEdit(note)">
                Editar
              </button>
              <button class="btn btn--danger btn--sm" type="button" @click="onDelete(note.id)">
                Borrar
              </button>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>