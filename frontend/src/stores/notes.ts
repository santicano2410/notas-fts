import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useAuthStore } from '@/stores/auth'

export interface Note {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
}

interface NoteInput {
  title: string
  content: string
}

const API_URL = 'http://localhost:3000'

export const useNotesStore = defineStore('notes', () => {
  const notes = ref<Note[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function request(path: string, options: RequestInit = {}): Promise<Response> {
    const auth = useAuthStore()
    return fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth.accessToken ?? ''}`,
      },
    })
  }

  async function fetchNotes(query = ''): Promise<void> {
    loading.value = true
    error.value = null
    try {
      const term = query.trim()
      const params = term ? `?q=${encodeURIComponent(term)}` : ''
      const response = await request(`/notes${params}`)
      if (!response.ok) {
        error.value = 'No se pudieron cargar las notas'
        return
      }
      notes.value = (await response.json()) as Note[]
    } catch {
      error.value = 'No se pudo conectar con el servidor'
    } finally {
      loading.value = false
    }
  }

  async function saveNote(input: NoteInput, id?: string): Promise<boolean> {
    error.value = null
    try {
      const response = await request(id ? `/notes/${id}` : '/notes', {
        method: id ? 'PUT' : 'POST',
        body: JSON.stringify(input),
      })
      if (!response.ok) {
        error.value = 'No se pudo guardar la nota'
        return false
      }
      return true
    } catch {
      error.value = 'No se pudo conectar con el servidor'
      return false
    }
  }

  async function removeNote(id: string): Promise<boolean> {
    error.value = null
    try {
      const response = await request(`/notes/${id}`, { method: 'DELETE' })
      if (!response.ok) {
        error.value = 'No se pudo borrar la nota'
        return false
      }
      return true
    } catch {
      error.value = 'No se pudo conectar con el servidor'
      return false
    }
  }

  return { notes, loading, error, fetchNotes, saveNote, removeNote }
})