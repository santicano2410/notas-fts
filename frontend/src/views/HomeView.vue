<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
</script>

<template>
  <section class="hero">
    <span class="badge">Notas con búsqueda</span>
    <h1 class="hero__title">Tus notas, <span>encontradas al instante</span></h1>
    <p class="hero__text">
      Escribe, organiza y busca en el título y el contenido de todas tus notas desde un solo lugar.
    </p>
    <div class="hero__actions">
      <RouterLink class="btn btn--primary" :to="auth.isAuthenticated ? '/notes' : '/login'">
        {{ auth.isAuthenticated ? 'Ir a mis notas' : 'Iniciar sesión' }}
      </RouterLink>
      <RouterLink class="btn btn--ghost" to="/about">Conocer más</RouterLink>
    </div>
  </section>

  <section class="features">
    <article class="card feature">
      <h3>Seguro</h3>
      <p>Contraseñas cifradas y sesión protegida con token de acceso.</p>
    </article>
    <article class="card feature">
      <h3>Rápido</h3>
      <p>Busca en título y contenido mientras escribes, con la coincidencia resaltada.</p>
    </article>
    <article class="card feature">
      <h3>Privado</h3>
      <p>Cada usuario ve únicamente sus propias notas.</p>
    </article>
  </section>
</template>