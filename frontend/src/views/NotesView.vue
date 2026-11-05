<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import {
  CATEGORIES,
  useNotesStore,
  type Note,
  type NoteCategory,
  type NoteFilters,
} from '@/stores/notes'

interface Segment {
  text: string
  match: boolean
}

const store = useNotesStore()

const filters = reactive<NoteFilters>({
  q: '',
  scope: 'all',
  category: '',
  tag: '',
  favorite: false,
  from: '',
  to: '',
  sort: 'recent',
})

const title = ref('')
const content = ref('')
const category = ref<NoteCategory>('otros')
const tagsText = ref('')
const favorite = ref(false)
const editingId = ref<string | null>(null)
let timer: ReturnType<typeof setTimeout> | undefined

const activeFilters = computed(() => {
  let count = 0
  if (filters.category) count += 1
  if (filters.tag.trim()) count += 1
  if (filters.favorite) count += 1
  if (filters.from) count += 1
  if (filters.to) count += 1
  return count
})

onMounted(() => {
  void store.fetchNotes(filters)
})

watch(
  filters,
  () => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      void store.fetchNotes(filters)
    }, 300)
  },
  { deep: true },
)

function categoryLabel(value: NoteCategory): string {
  return CATEGORIES.find((item) => item.value === value)?.label ?? value
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function highlight(text: string, field: 'title' | 'content'): Segment[] {
  const term = filters.q.trim()
  const enabled = filters.scope === 'all' || filters.scope === field
  if (!term || !enabled) {
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

function parseTags(): string[] {
  const list = tagsText.value
    .split(',')
    .map((tag) => tag.trim().toLowerCase())
    .filter((tag) => tag !== '')
  return [...new Set(list)].slice(0, 5)
}

function clearFilters(): void {
  filters.q = ''
  filters.scope = 'all'
  filters.category = ''
  filters.tag = ''
  filters.favorite = false
  filters.from = ''
  filters.to = ''
  filters.sort = 'recent'
}

function resetForm(): void {
  title.value = ''
  content.value = ''
  category.value = 'otros'
  tagsText.value = ''
  favorite.value = false
  editingId.value = null
}

function startEdit(note: Note): void {
  title.value = note.title
  content.value = note.content
  category.value = note.category
  tagsText.value = note.tags.join(', ')
  favorite.value = note.favorite
  editingId.value = note.id
}

async function onSubmit(): Promise<void> {
  const ok = await store.saveNote(
    {
      title: title.value,
      content: content.value,
      category: category.value,
      tags: parseTags(),
      favorite: favorite.value,
    },
    editingId.value ?? undefined,
  )
  if (ok) {
    resetForm()
    await store.fetchNotes(filters)
  }
}

async function toggleFavorite(note: Note): Promise<void> {
  const ok = await store.saveNote(
    {
      title: note.title,
      content: note.content,
      category: note.category,
      tags: note.tags,
      favorite: !note.favorite,
    },
    note.id,
  )
  if (ok) {
    await store.fetchNotes(filters)
  }
}

async function onDelete(id: string): Promise<void> {
  const ok = await store.removeNote(id)
  if (ok) {
    await store.fetchNotes(filters)
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
      <div class="field">
        <label for="category">Categoría</label>
        <select id="category" v-model="category" class="select">
          <option v-for="item in CATEGORIES" :key="item.value" :value="item.value">
            {{ item.label }}
          </option>
        </select>
      </div>
      <div class="field">
        <label for="tags">Etiquetas (separadas por coma, máximo 5)</label>
        <input
          id="tags"
          v-model="tagsText"
          class="input"
          type="text"
          placeholder="parcial, examen"
        />
      </div>
      <label class="check">
        <input v-model="favorite" type="checkbox" />
        Marcar como favorita
      </label>
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
        <div class="searchbar">
          <input
            v-model="filters.q"
            class="input"
            type="search"
            placeholder="Buscar notas"
            aria-label="Buscar notas"
          />
          <select v-model="filters.scope" class="select" aria-label="Buscar en">
            <option value="all">Todo</option>
            <option value="title">Solo título</option>
            <option value="content">Solo contenido</option>
          </select>
        </div>
      </div>

      <div class="card filters">
        <div class="chips" role="group" aria-label="Categorías">
          <button
            type="button"
            class="chip-btn"
            :class="{ 'is-active': filters.category === '' }"
            @click="filters.category = ''"
          >
            Todas
          </button>
          <button
            v-for="item in CATEGORIES"
            :key="item.value"
            type="button"
            class="chip-btn"
            :class="[`cat--${item.value}`, { 'is-active': filters.category === item.value }]"
            @click="filters.category = item.value"
          >
            {{ item.label }}
          </button>
        </div>

        <div class="filters__row">
          <div class="field">
            <label for="f-tag">Etiqueta</label>
            <input
              id="f-tag"
              v-model="filters.tag"
              class="input"
              type="text"
              placeholder="ej. parcial"
            />
          </div>
          <div class="field">
            <label for="f-from">Desde</label>
            <input id="f-from" v-model="filters.from" class="input" type="date" />
          </div>
          <div class="field">
            <label for="f-to">Hasta</label>
            <input id="f-to" v-model="filters.to" class="input" type="date" />
          </div>
          <div class="field">
            <label for="f-sort">Ordenar por</label>
            <select id="f-sort" v-model="filters.sort" class="select">
              <option value="recent">Más recientes</option>
              <option value="oldest">Más antiguas</option>
              <option value="title">Título (A-Z)</option>
            </select>
          </div>
        </div>

        <div class="filters__footer">
          <label class="check">
            <input v-model="filters.favorite" type="checkbox" />
            Solo favoritas
          </label>
          <button
            v-if="activeFilters > 0 || filters.q"
            class="btn btn--ghost btn--sm"
            type="button"
            @click="clearFilters"
          >
            Limpiar filtros ({{ activeFilters + (filters.q ? 1 : 0) }})
          </button>
        </div>
      </div>

      <p v-if="store.error" class="alert" role="alert">{{ store.error }}</p>
      <p v-if="store.loading" class="muted">Cargando...</p>
      <div v-else-if="store.notes.length === 0" class="empty">
        {{
          activeFilters > 0 || filters.q.trim()
            ? 'No se encontraron notas con esos filtros.'
            : 'Aún no tienes notas. Crea la primera desde el formulario.'
        }}
      </div>

      <ul v-else class="notes__grid">
        <li v-for="note in store.notes" :key="note.id" class="card note">
          <div class="note__top">
            <span class="cat-badge" :class="`cat--${note.category}`">
              {{ categoryLabel(note.category) }}
            </span>
            <button
              class="star"
              :class="{ 'is-on': note.favorite }"
              type="button"
              :aria-label="note.favorite ? 'Quitar de favoritas' : 'Marcar como favorita'"
              @click="toggleFavorite(note)"
            >
              {{ note.favorite ? '★' : '☆' }}
            </button>
          </div>
          <h3 class="note__title">
            <template v-for="(part, i) in highlight(note.title, 'title')" :key="i">
              <mark v-if="part.match">{{ part.text }}</mark>
              <template v-else>{{ part.text }}</template>
            </template>
          </h3>
          <p class="note__content">
            <template v-for="(part, i) in highlight(note.content, 'content')" :key="i">
              <mark v-if="part.match">{{ part.text }}</mark>
              <template v-else>{{ part.text }}</template>
            </template>
          </p>
          <div v-if="note.tags.length > 0" class="tags">
            <button
              v-for="tag in note.tags"
              :key="tag"
              class="tag"
              type="button"
              @click="filters.tag = tag"
            >
              #{{ tag }}
            </button>
          </div>
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