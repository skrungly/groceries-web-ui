<script setup lang="ts">
import { nextTick, onMounted, ref, useTemplateRef, type Ref } from 'vue'

import { api, type Item, type Product } from '@/api'

const props = defineProps<{ itemToEdit: Item | null }>()
const emit = defineEmits(["submit"])

const barcodeInput: Ref<string | null> = ref(null)
const barcodeChecked: Ref<boolean> = ref(false)
const itemInfo: Ref<Partial<Item>> = ref({})
const productInfo: Ref<Partial<Product>> = ref({})
const productInfoRequired = ref(false)

const barcodeField = useTemplateRef("barcode")

async function resetForm() {
  barcodeInput.value = null
  barcodeChecked.value = false
  itemInfo.value = { ...props.itemToEdit }
  productInfo.value = props.itemToEdit?.product ?? {}
  productInfoRequired.value = false

  if (!props.itemToEdit) {
    // focus needs to be delayed in order to work
    nextTick(() => barcodeField.value?.focus())
  }
}

async function setupNewItemForm() {
  let products = await api.get<Product[]>(
    "/products", {
      params: {
        barcode: barcodeInput.value
      }
    }
  ).then(response => response.data)

  if (products.length != 0) {
    productInfo.value = products[0]!
  } else {
    productInfoRequired.value = true
  }

  barcodeChecked.value = true

  // set initial values for the form
  itemInfo.value.percent_remaining = 100
}

async function discardItem() {
  itemInfo.value.percent_wasted = itemInfo.value.percent_remaining
  itemInfo.value.percent_remaining = 0

  submitItem()
}

async function submitItem() {
  // adjust behaviour slightly for creating vs editing
  let method = props.itemToEdit ? "put" : "post"
  let endpoint = props.itemToEdit?.id ?? ""

  if (productInfoRequired.value) {
    productInfo.value.barcode = barcodeInput.value

    productInfo.value = await api.request<Product>({
      method: method,
      url: `/products/${endpoint}`,
      data: productInfo.value
    }).then(response => response.data)
  }

  if (itemInfo.value.expires_at) {
    // we want the *end* of the day of expiry, so add 1 day
    let actualExpiry = new Date(Date.parse(itemInfo.value.expires_at))
    actualExpiry.setDate(actualExpiry.getDate() + 1)
    itemInfo.value.expires_at = actualExpiry.toDateString()
  }

  itemInfo.value.product_id = productInfo.value.id
  await api.request<Item>({
    method: method,
    url: `/items/${endpoint}`,
    data: itemInfo.value
  })

  resetForm()
  emit("submit")
}

onMounted(resetForm)
</script>

<template>
  <div class="flex flex-col gap-4 pt-4">
    <!-- only need to scan a barcode when creating new item -->
    <form v-if="!itemToEdit" @submit.prevent="setupNewItemForm" class="flex gap-4">
      <input
        tabindex="0"
        type="text"
        ref="barcode"
        v-model="barcodeInput"
        placeholder="scan a barcode"
        class="input grow"
        :disabled="barcodeChecked"
        required
      />
      <button class="btn w-16" type="submit" :disabled="barcodeChecked">scan</button>
    </form>

    <form @submit.prevent.stop="submitItem" class="flex flex-col items-center gap-4">
      <div v-if="barcodeChecked" class="flex flex-col gap-4 w-full">
        <div class="divider text-xs m-0">product info</div>

        <label class="input w-full">
          <span class="label min-w-25 gap-0.75">
            name<span v-if="productInfoRequired" class="text-error text-xs">*</span>
          </span>
          <input v-model="productInfo.name" type="text" :disabled="!productInfoRequired" required/>
        </label>

        <label class="input w-full">
          <span class="label min-w-25">quantity</span>
          <input v-model="productInfo.quantity" type="number" placeholder="1" :disabled="!productInfoRequired"/>
        </label>

        <label v-if="productInfoRequired" class="input w-full">
          <span class="label min-w-25">use within</span>
          <input v-model="productInfo.shelf_life_opened" type="number" placeholder="0"/>
          <span class="label">days of opening</span>
        </label>

        <label v-if="productInfoRequired" class="input w-full">
          <span class="label min-w-25">cost (£)</span>
          <input v-model="productInfo.cost" type="number" placeholder="0.00" step=".01"/>
        </label>

        <label v-if="productInfoRequired" class="input w-full">
          <span class="label min-w-25">weight (g)</span>
          <input v-model="productInfo.net_weight" type="number" placeholder="0"/>
        </label>
      </div>

      <div v-if="barcodeChecked || itemToEdit" class="flex flex-col gap-4 w-full">
        <div class="divider text-xs m-0">item info</div>

        <label class="input w-full">
          <span class="label min-w-25">expires on</span>
          <input v-model="itemInfo.expires_at" type="date"/>
        </label>

        <label class="input w-full">
          <span class="label min-w-25">remaining</span>
          <input v-model="itemInfo.percent_remaining" type="range" min="0" max="100" class="range range-xs h-4"/>
        </label>
      </div>

      <div v-show="barcodeChecked || itemToEdit" class="flex gap-4 w-full">
        <button
          v-if="itemToEdit"
          class="btn btn-error w-0 grow"
          type="button"
          @click="discardItem"
          :disabled="itemInfo.percent_remaining == 0"
        >discard</button>

        <button class="btn w-0 grow" type="button" @click="resetForm">reset</button>

        <button class="btn btn-accent w-0 grow" type="submit">
          <span v-if="itemToEdit && itemInfo.percent_remaining == 0">finish</span>
          <span v-else-if="itemToEdit">submit</span>
          <span v-else>create</span>
        </button>
      </div>

      <div v-if="!barcodeChecked && !itemToEdit" class="flex flex-col gap-4 w-full">
        <div class="divider text-xs m-0">or</div>

        <div class="cursor-not-allowed">
          <button class="btn btn-primary btn-disabled w-full" disabled>select custom product</button>
        </div>

        <p class="text-xs text-center text-base-content/60">(coming soon)</p>
      </div>
    </form>
  </div>
</template>
