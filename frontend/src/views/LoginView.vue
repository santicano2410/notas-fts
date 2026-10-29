<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const email = ref('')
const password = ref('')

async function onSubmit(): Promise<void> {
  const ok = await auth.login(email.value, password.value)
  if (ok) {
    await router.push('/notes')
  }
}
</script>

<template>
  <section class="card auth">
    <div>
      <h2 class="auth__title">Iniciar sesión</h2>
      <p class="muted">Accede para ver y buscar tus notas.</p>
    </div>

    <form @submit.prevent="onSubmit">
      <div class="field">
        <label for="email">Correo</label>
        <input
          id="email"
          v-model="email"
          class="input"
          type="email"
          autocomplete="username"
          required
        />
      </div>
      <div class="field">
        <label for="password">Contraseña</label>
        <input
          id="password"
          v-model="password"
          class="input"
          type="password"
          autocomplete="current-password"
          required
        />
      </div>
      <p v-if="auth.error" class="alert" role="alert">{{ auth.error }}</p>
      <button class="btn btn--primary" type="submit" :disabled="auth.loading">
        {{ auth.loading ? 'Ingresando...' : 'Ingresar' }}
      </button>
    </form>
  </section>
</template>