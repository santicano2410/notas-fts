<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
</script>

<template>
  <div class="layout">
    <AppHeader />
    <main class="layout__content">
      <RouterView />
    </main>
  </div>
</template>