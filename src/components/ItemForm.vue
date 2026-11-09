<script setup lang="ts">
import { submitItem, type Item, type Product } from "@/api"
import { nextTick, onMounted, ref, toRef, watch, type Ref } from "vue"

const props = defineProps<{
  productInfo: Partial<Product>
  itemToEdit?: Partial<Item>
  showButtons: boolean
}>()

const emit = defineEmits<{
  (e: "submit", item: Item): void
  (e: "update", item: Partial<Item>): void
}>()

const itemInputs: Ref<Partial<Item>> = ref({})
const expiryInput: Ref<string | null> = ref(null)

const productInfo = toRef(props, "productInfo")
const submittingForm = ref(false)

function getLocalISOString(date?: Date): string {
  if (date === undefined) {
    date = new Date(Date.now())
  }

  let tzOffset = date.getTimezoneOffset() * 60000  // minutes -> ms
  let localTimestamp = new Date(date.getTime() - tzOffset)
  return localTimestamp.toISOString().slice(0, 16)
}

function adjustExpiryTime() {
  if (!expiryInput.value) {
    itemInputs.value.expires_at = null
    return
  }

  // expiry dates on packaging refers to the end of the day
  let expiryDate = new Date(Date.parse(expiryInput.value))
  expiryDate.setHours(23)
  expiryDate.setMinutes(59)
  expiryDate.setSeconds(59)
  expiryDate.setMilliseconds(999)

  itemInputs.value.expires_at = expiryDate.toISOString()
}

function updateQuantity() {
  // if we try to modify `percent_remaining` now, its corresponding input[type=range] will
  // enforce its current 'max' attribute, which is based on the old product quantity. by
  // deferring this to nextTick, we can ensure that the 'max' attribute adapts to the new
  // quantity change *before* we set `percent_remaining` to its new maximum value
  if (!props.itemToEdit) {
    nextTick(() => itemInputs.value.percent_remaining = 100 * (productInfo.value.quantity ?? 1))
  }
}

async function discardItem() {
  itemInputs.value.percent_wasted = itemInputs.value.percent_remaining
  itemInputs.value.percent_remaining = 0

  submitForm()
}

async function resetForm() {
  itemInputs.value = { ...props.itemToEdit }
  expiryInput.value = null

  if (props.itemToEdit?.expires_at) {
    expiryInput.value = getLocalISOString(
      new Date(Date.parse(props.itemToEdit.expires_at)),
    ).split("T")[0] ?? null
  }

  if (props.itemToEdit?.opened_at) {
    itemInputs.value.opened_at = getLocalISOString(
      new Date(Date.parse(props.itemToEdit.opened_at))
    )
  }
}

async function submitForm() {
  submittingForm.value = true

  itemInputs.value.product_id = productInfo.value.id

  submitItem(itemInputs.value)
    .then(response => emit("submit", response.data))
    .finally(() => submittingForm.value = false)
}

watch(expiryInput, adjustExpiryTime)
watch(() => productInfo.value.quantity, updateQuantity, { immediate: true })
watch(itemInputs, () => emit("update", itemInputs.value))
onMounted(resetForm)
</script>

<template>
  <form
    @submit.prevent.stop="submitForm"
    class="flex flex-col gap-4 w-full"
  >
    <label class="input w-full">
      <span class="label min-w-25">expires on</span>
      <input v-model="expiryInput" type="date"/>
    </label>

    <div class="join w-full">
      <label class="input join-item grow">
        <span class="label min-w-25">opened at</span>
        <input class="w-0 grow overflow-scroll" v-model="itemInputs.opened_at" type="datetime-local" step="60"/>
      </label>

      <button
        class="btn join-item"
        type="button"
        @click="itemInputs.opened_at = getLocalISOString()"
      >now</button>
    </div>

    <label class="input w-full">
      <span class="label min-w-25">remaining</span>
      <input
        v-model="itemInputs.percent_remaining"
        type="range"
        min="0"
        :max="100 * (productInfo.quantity ?? 1)"
        :step="productInfo.quantity && productInfo.quantity > 1 ? 100 : 1"
        class="range range-xs h-4"
      />

      <span v-if="productInfo.quantity && productInfo.quantity > 1" class="label min-w-12 justify-center">
        {{ itemInputs.percent_remaining! / 100 }}
      </span>
    </label>

    <div v-show=showButtons class="flex gap-4 w-full">
      <button
        v-if="itemToEdit"
        class="btn btn-error w-0 grow"
        type="button"
        @click="discardItem"
        :disabled="itemInputs.percent_remaining == 0"
      >discard</button>

      <button class="btn w-0 grow" type="button" @click="resetForm">reset</button>

      <button class="btn btn-accent w-0 grow" type="submit">
        <span v-if="submittingForm" class="loading loading-spinner"></span>
        <span v-else-if="itemToEdit && itemInputs.percent_remaining == 0">finish</span>
        <span v-else>submit</span>
      </button>
    </div>
  </form>
</template>
