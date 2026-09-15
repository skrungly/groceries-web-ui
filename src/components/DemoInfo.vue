<script setup lang="ts">
import type { Ref } from 'vue'
import { onMounted, onUnmounted, ref } from 'vue'
import Modal from './Modal.vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const DEMO_REFRESH_DELAY = 10  // plenty for db to refresh
const DEMO_REFRESH_NOTICE = 60

const demoInterval: Ref<number | null> = ref(null)
const demoTimeRemaining: Ref<number | null> = ref(null)
const demoInfoDismissed = ref(false)
const demoTimerDismissed = ref(false)

function checkDemoTimer(refreshAt: Date) {
  demoTimeRemaining.value = Math.round(
    (refreshAt.getTime() - Date.now()) / 1000  // ms -> s
  )

  if (demoTimeRemaining.value + DEMO_REFRESH_DELAY <= 0 && demoInterval.value) {
    clearInterval(demoInterval.value)
    window.location.reload()
  }
}

function startDemoTimer() {
  // the demo database refreshes on the hour
  const refreshAt = new Date(Date.now())
  refreshAt.setMinutes(59)
  refreshAt.setSeconds(59)

  checkDemoTimer(refreshAt)
  demoInterval.value = setInterval(() => checkDemoTimer(refreshAt), 1000)
}

onMounted(startDemoTimer)
onUnmounted(() => demoInterval.value && clearInterval(demoInterval.value))
</script>

<template>
  <!-- force the banner to be visible for the last 60 seconds -->
  <div
    v-if="demoTimeRemaining != null && (!demoTimerDismissed || demoTimeRemaining < DEMO_REFRESH_NOTICE)"
    class="bg-secondary py-4 text-secondary-content text-sm gap-2 flex flex-col sm:flex-row justify-center text-center sticky top-0 z-1"
  >
    <div>
      <FontAwesomeIcon class="text-lg mx-2" icon="fa-solid fa-info-circle"/>
      <span class="font-bold">this is a demo!</span>
    </div>

    <div class="mx-4 sm:mx-0">
      the page and database will refresh automatically in
      <span class="inline-block text-start mx-1 min-w-16" v-if="demoTimeRemaining > 0">
        <span v-if="demoTimeRemaining >= 60" class="font-bold">
          {{ Math.trunc(demoTimeRemaining / 60).toString() }}m
        </span>
        <span v-if="demoTimeRemaining % 60" class="font-bold">
          {{ (demoTimeRemaining % 60).toString() }}s
        </span>
      </span>
      <span v-else class="font-bold text-center w-16">
        a moment
      </span>
    </div>

    <button v-if="demoTimeRemaining >= DEMO_REFRESH_NOTICE" class="cursor-pointer" @click="demoTimerDismissed = true">
      <FontAwesomeIcon class="text-sm sm:inline-block! hidden!" icon="fa-solid fa-xmark"/>
      <FontAwesomeIcon class="text-sm sm:hidden! inline-block!" icon="fa-solid fa-angle-up"/>
    </button>
  </div>

  <Modal v-if="!demoInfoDismissed" @close="demoInfoDismissed = true">
    <div class="flex flex-col gap-4">
      <div class="flex gap-4 w-full items-center">
        <FontAwesomeIcon class="text-xl" icon="fa-solid fa-crow"/>
        <h3 class="text-lg font-bold">hey!</h3>
      </div>
      <p class="text-sm">
        you're currently viewing a demo. the database is randomly regenerated
        every hour, so feel free to create and edit items!
      </p>
      <button class="btn" @click="demoInfoDismissed = true">got it!</button>
    </div>
  </Modal>

  <!-- TODO: use a lock-file system to handle this situation on page load also -->
  <Modal v-if="demoTimeRemaining !== null && demoTimeRemaining <= 0">
    <div class="flex flex-col text-center">
      the database is currently being regenerated :)
      <br/>
      the page will refresh in {{ Math.max(DEMO_REFRESH_DELAY + demoTimeRemaining, 0) + 1 }} seconds
    </div>
  </Modal>
</template>
