<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <RouterView />
</template>

<style scoped>
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden; /* removes scrollbars */
}

* {
  box-sizing: border-box;
  max-width: 100vw !important;
  overflow: hidden !important;
}
</style>
