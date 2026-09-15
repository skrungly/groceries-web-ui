<script setup lang="ts">
import { RouterView } from "vue-router"

import LayoutFooter from "@/components/LayoutFooter.vue"
import LayoutHeader from "@/components/LayoutHeader.vue"
import DemoInfo from "@/components/DemoInfo.vue"

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true'
</script>

<template>
  <DemoInfo v-if="DEMO_MODE"></DemoInfo>

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
