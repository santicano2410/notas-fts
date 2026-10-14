<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <header class="header">
    <h1 class="header__title">Notas FTS</h1>
    <nav class="header__nav">
      <RouterLink to="/">Inicio</RouterLink>
      <RouterLink to="/about">Acerca de</RouterLink>
    </nav>
  </header>
</template>