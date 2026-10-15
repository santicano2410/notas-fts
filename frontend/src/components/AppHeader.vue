<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
</script>

<template>
  <header class="header">
    <h1 class="header__title">Notas FTS</h1>
    <nav class="header__nav">
      <RouterLink to="/">Inicio</RouterLink>
      <RouterLink to="/about">Acerca de</RouterLink>
      <RouterLink v-if="!auth.isAuthenticated" to="/login">Ingresar</RouterLink>
      <template v-else>
        <span>{{ auth.email }}</span>
        <button type="button" @click="auth.logout()">Salir</button>
      </template>
    </nav>
  </header>
</template>