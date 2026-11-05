import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useAuthStore } from '@/stores/auth'

export const CATEGORIES = [
  { value: 'personal', label: 'Personal' },
  { value: 'estudio', label: 'Estudio' },
  { value: 'trabajo', label: 'Trabajo' },
  { value: 'ideas', label: 'Ideas' },
  { value: 'otros', label: 'Otros' },
] as const

export type NoteCategory = (typeof CATEGORIES)[number]['value']
export type SearchScope = 'all' | 'title' | 'content'
export type SortOrder = 'recent' | 'oldest' | 'title'

export interface Note {
  id: string
  title: string
  content: string
  category: NoteCategory
  tags: string[]
  favorite: boolean
  createdAt: string
  updatedAt: string
}

export interface NoteInput {
  title: string
  content: string
  category: NoteCategory
  tags: string[]
  favorite: boolean
}

export interface NoteFilters {
  q: string
  scope: SearchScope
  category: NoteCategory | ''
  tag: string
  favorite: boolean
  from: string
  to: string
  sort: SortOrder
}

const API_URL = 'http://localhost:3000'

function buildQuery(filters: NoteFilters): string {
  const params = new URLSearchParams()
  const q = filters.q.trim()
  const tag = filters.tag.trim()
  if (q) params.set('q', q)
  if (filters.scope !== 'all') params.set('scope', filters.scope)
  if (filters.category) params.set('category', filters.category)
  if (tag) params.set('tag', tag)
  if (filters.favorite) params.set('favorite', 'true')
  if (filters.from) params.set('from', filters.from)
  if (filters.to) params.set('to', filters.to)
  if (filters.sort !== 'recent') params.set('sort', filters.sort)
  const text = params.toString()
  return text ? `?${text}` : ''
}

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

  async function fetchNotes(filters: NoteFilters): Promise<void> {
    loading.value = true
    error.value = null
    try {
      const response = await request(`/notes${buildQuery(filters)}`)
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