<script setup lang="ts">
import { FOOD_EMOJI, sample_n } from "@/utils"
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

let rotate_emoji = sample_n(FOOD_EMOJI, 6)  // daisyUI can rotate 6 items

interface NavLink {
  name: string,
  to: string,
  icon: string,
}

const NAV_LINKS: NavLink[] = [
  {
    name: "stats",
    to: "/stats",
    icon: "chart-simple",
  },
  {
    name: "items",
    to: "/",
    icon: "jar",
  },
  {
    name: "products",
    to: "/products",
    icon: "barcode",
  },
]
</script>

<template>
  <header class="flex gap-2 text-xl justify-center pt-6">
    groceries!
    <span class="text-rotate">
      <span>
        <span v-for="emoji in rotate_emoji">{{ emoji }}</span>
      </span>
    </span>
  </header>

  <!-- this is a dock on mobile, and a top navbar on desktop (above md breakpoint) -->
  <nav class="md:navbar max-md:dock max-md:dock-lg md:justify-center md:gap-24 justify-evenly mx-auto md:shadow-sm">
    <RouterLink v-for="link in NAV_LINKS" :to="link.to" exact-active-class="dock-active opacity-100" class="flex items-center md:gap-2 min-w-24 opacity-50 hover:opacity-100">
      <FontAwesomeIcon class="text-lg" :icon="`fa-solid fa-${link.icon}`"></FontAwesomeIcon>
      <span class="max-md:text-sm max-md:dock-label">{{ link.name }}</span>
    </RouterLink>
  </nav>
</template>
