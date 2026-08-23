<script setup lang="ts">
import { FOOD_EMOJI, sample_n } from "@/utils"

let rotate_emoji = sample_n(FOOD_EMOJI, 6)  // daisyUI can rotate 6 items
</script>

<template>
  <header>
    <nav class="navbar border-b border-b-gray-300">
      <div class="navbar-start"></div>
      <div class="navbar-center">
        <RouterLink to="/" class="text-xl">
          groceries!
          <span class="text-rotate">
            <span>
              <span v-for="emoji in rotate_emoji">{{ emoji }}</span>
            </span>
          </span>
        </RouterLink>
      </div>
      <div class="navbar-end"></div>
    </nav>
  </header>
</template>
