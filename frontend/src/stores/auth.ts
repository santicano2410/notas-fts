import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

interface LoginResponse {
  accessToken: string
  user: { email: string }
}

const API_URL = 'http://localhost:3000'

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(null)
  const email = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => accessToken.value !== null)

  async function login(emailInput: string, password: string): Promise<boolean> {
    loading.value = true
    error.value = null
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput, password }),
      })
      if (!response.ok) {
        error.value = 'Credenciales inválidas'
        return false
      }
      const data = (await response.json()) as LoginResponse
      accessToken.value = data.accessToken
      email.value = data.user.email
      return true
    } catch {
      error.value = 'No se pudo conectar con el servidor'
      return false
    } finally {
      loading.value = false
    }
  }

  function logout(): void {
    accessToken.value = null
    email.value = null
  }

  return { accessToken, email, loading, error, isAuthenticated, login, logout }
})