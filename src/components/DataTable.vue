<script setup lang="ts">
import { onUnmounted, ref, type Ref } from "vue"

const props = defineProps<{
  loading: boolean,
  errorMsg: string | null,
}>()

const emit = defineEmits<{(e: "search", search: string): void}>()

const SEARCH_INTERVAL_MS = 200

const searchInput: Ref<string> = ref("")
let prevSearch = ""

const searchInterval = setInterval(
  function () {
    if (searchInput.value != prevSearch) {
      emit("search", searchInput.value)
      prevSearch = searchInput.value
    }
  }, SEARCH_INTERVAL_MS
)

onUnmounted(() => clearInterval(searchInterval))
</script>

<template>
  <div class="flex flex-col h-full relative">
    <div class="flex gap-4 bg-base-100 sticky py-4 top-0 z-1">
      <label class="input grow shrink-0 pr-0">
        <FontAwesomeIcon icon="fa-solid fa-magnifying-glass" class="opacity-50"/>
        <input type="text" v-model="searchInput" placeholder="search"/>


        <div class="mx-3 opacity-50 hover:opacity-80">
          <button v-if="searchInput" class="cursor-pointer" @click="searchInput = ''">
            <FontAwesomeIcon icon="fa-solid fa-xmark"/>
          </button>

          <button v-else class="cursor-pointer" @click="emit('search', searchInput)">
            <FontAwesomeIcon icon="fa-solid fa-arrows-rotate"/>
          </button>
        </div>
      </label>

      <slot name="create"></slot>
    </div>

    <div class="overflow-x-scroll h-full">
      <table class="table">
        <slot name="header"></slot>

        <slot name="body"></slot>
      </table>

      <div class="flex justify-center opacity-80 text-md my-8">
        <div v-if="errorMsg" class="text-error">
          <FontAwesomeIcon class="text-xl px-2" icon="fa-solid fa-cat"/>
          <span>could not load table [{{ errorMsg.toLowerCase() }}]</span>
        </div>
      </div>
    </div>

    <div v-if="loading" class="flex absolute justify-center top-32 right-0 left-0">
      <span class="loading loading-spinner loading-xl opacity-80"></span>
    </div>
  </div>
</template>
