<script setup lang="ts">
import { RouterView, useRoute } from "vue-router"

const route = useRoute()
</script>

<template>
  <header>
    <nav>
      <!-- ... -->
    </nav>
  </header>

  <main>
    <RouterView v-slot="{ Component }">
      <component :is="Component"/>
    </RouterView>
  </main>

  <footer>
    <!-- ... -->
  </footer>
</template>
