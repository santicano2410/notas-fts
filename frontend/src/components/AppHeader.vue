<script setup lang="ts">
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

async function onLogout(): Promise<void> {
  auth.logout()
  await router.push('/login')
}
</script>

<template>
  <header class="header">
    <div class="header__inner">
      <RouterLink to="/" class="brand">
        <span class="brand__logo">N</span>
        <span>Notas FTS</span>
      </RouterLink>

      <nav class="nav">
        <RouterLink class="nav-link" to="/">Inicio</RouterLink>
        <RouterLink v-if="auth.isAuthenticated" class="nav-link" to="/notes">Notas</RouterLink>
        <RouterLink class="nav-link" to="/about">Acerca de</RouterLink>
      </nav>

      <div class="header__user">
        <RouterLink v-if="!auth.isAuthenticated" class="btn btn--primary btn--sm" to="/login">
          Ingresar
        </RouterLink>
        <template v-else>
          <span class="chip">{{ auth.email }}</span>
          <button class="btn btn--ghost btn--sm" type="button" @click="onLogout">Salir</button>
        </template>
      </div>
    </div>
  </header>
</template>