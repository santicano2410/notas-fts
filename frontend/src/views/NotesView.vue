<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useNotesStore, type Note } from '@/stores/notes'

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
    <h2>Mis notas</h2>

    <form @submit.prevent="onSubmit">
      <div>
        <label for="title">Título</label>
        <input id="title" v-model="title" type="text" maxlength="200" required />
      </div>
      <div>
        <label for="content">Contenido</label>
        <textarea id="content" v-model="content" rows="4"></textarea>
      </div>
      <button type="submit">{{ editingId ? 'Guardar cambios' : 'Crear nota' }}</button>
      <button v-if="editingId" type="button" @click="resetForm">Cancelar</button>
    </form>

    <div>
      <label for="search">Buscar</label>
      <input id="search" v-model="query" type="search" placeholder="Buscar en título o contenido" />
    </div>

    <p v-if="store.error" role="alert">{{ store.error }}</p>
    <p v-if="store.loading">Cargando...</p>
    <p v-else-if="store.notes.length === 0">No hay notas todavía.</p>

    <ul v-else>
      <li v-for="note in store.notes" :key="note.id">
        <h3>{{ note.title }}</h3>
        <p>{{ note.content }}</p>
        <button type="button" @click="startEdit(note)">Editar</button>
        <button type="button" @click="onDelete(note.id)">Borrar</button>
      </li>
    </ul>
  </section>
</template>