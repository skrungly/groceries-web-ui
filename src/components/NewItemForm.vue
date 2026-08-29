<script setup lang="ts">
import { ref, type Ref } from 'vue'

import { api, type Item, type Product } from '@/api'

const emit = defineEmits(["submit"])

let barcodeInput: Ref<string | null> = ref(null)
let barcodeChecked: Ref<boolean> = ref(false)

let itemInfo: Ref<Partial<Item>> = ref({})
let productInfo: Ref<Partial<Product>> = ref({})

let productInfoRequired = ref(false)

async function resetForm() {
  barcodeInput.value = null
  barcodeChecked.value = false
  itemInfo.value = {}
  productInfo.value = {}
  productInfoRequired.value = false

  document.getElementById("barcode")?.focus()
}

async function setupItemForm() {
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

async function submitItem() {
  if (productInfoRequired.value) {
    productInfo.value.barcode = barcodeInput.value

    productInfo.value = await api.post<Product>("/products", productInfo.value)
      .then(response => response.data)
  }

  itemInfo.value.product_id = productInfo.value.id
  await api.post<Item>("/items", itemInfo.value)

  resetForm()
  emit("submit")
}
</script>

<template>
  <div class="flex flex-col gap-4 pt-4">
    <form @submit.prevent="setupItemForm" class="flex gap-4">
      <input
        type="text"
        id="barcode"
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

      <div v-if="barcodeChecked" class="flex flex-col gap-4 w-full">
        <div class="divider text-xs m-0">item info</div>

        <label class="input w-full">
          <span class="label min-w-25">expires on</span>
          <input type="date"/>
        </label>

        <label class="input w-full">
          <span class="label min-w-25">remaining</span>
          <input v-model="itemInfo.percent_remaining" type="range" min="0" max="100" class="range range-xs h-4"/>
        </label>

      </div>

      <div v-show="barcodeChecked" class="flex gap-4 w-full">
        <button class="btn w-0 grow" type="button" @click="resetForm">reset</button>
        <button class="btn btn-neutral w-0 grow" type="submit">submit</button>
      </div>

      <div v-if="!barcodeChecked" class="flex flex-col gap-4 w-full">
        <div class="divider text-xs m-0">or</div>

        <div class="cursor-not-allowed">
          <button class="btn btn-primary btn-disabled w-full" disabled>select custom product</button>
        </div>

        <p class="text-xs text-center text-base-content/60">(coming soon)</p>
      </div>
    </form>
  </div>
</template>
