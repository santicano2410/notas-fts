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
    await router.push('/')
  }
}
</script>

<template>
  <section class="login">
    <h2>Iniciar sesión</h2>
    <form @submit.prevent="onSubmit">
      <div>
        <label for="email">Correo</label>
        <input id="email" v-model="email" type="email" autocomplete="username" required />
      </div>
      <div>
        <label for="password">Contraseña</label>
        <input
          id="password"
          v-model="password"
          type="password"
          autocomplete="current-password"
          required
        />
      </div>
      <p v-if="auth.error" role="alert">{{ auth.error }}</p>
      <button type="submit" :disabled="auth.loading">
        {{ auth.loading ? 'Ingresando...' : 'Ingresar' }}
      </button>
    </form>
  </section>
</template>