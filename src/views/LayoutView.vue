<script setup lang="ts">
import { RouterView } from "vue-router"

import LayoutFooter from "@/components/LayoutFooter.vue"
import LayoutHeader from "@/components/LayoutHeader.vue"
</script>

<template>
  <LayoutHeader></LayoutHeader>

  <main class="flex grow justify-center">
    <div class="px-4 w-full max-w-7xl">
      <RouterView v-slot="{ Component }">
        <component :is="Component"/>
      </RouterView>
    </div>
  </main>

  <LayoutFooter></LayoutFooter>
</template>
