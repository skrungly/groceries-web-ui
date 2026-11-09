<script setup lang="ts">
import { api, submitItem, submitProduct, type Item, type Product } from "@/api"
import { basicErrorMessage } from "@/utils.ts"
import { nextTick, onMounted, ref, useTemplateRef, type Ref } from "vue"
import ItemForm from "./ItemForm.vue"
import ProductForm from "./ProductForm.vue"

const emit = defineEmits<{
  (e: "submit"): void
}>()

const barcodeInput: Ref<string | null> = ref(null)
const barcodeChecked: Ref<boolean> = ref(false)
const barcodeField = useTemplateRef("barcode")

const productInfo: Ref<Partial<Product>> = ref({})
const itemInfo: Ref<Partial<Item>> = ref({})

const productInfoRequired = ref(true)

const loadingProductInfo = ref(false)
const submittingForm = ref(false)

const errorMsg: Ref<string | null> = ref(null)

async function resetForm() {
  barcodeInput.value = null
  barcodeChecked.value = false

  productInfo.value = {}
  itemInfo.value = {}
  productInfoRequired.value = true

  nextTick(() => barcodeField.value?.focus())
}

async function setupItemForm() {
  loadingProductInfo.value = true
  let products: Product[] = []

  await api
    .get<Product[]>(
      "/products", {
        params: {
          barcode: barcodeInput.value
        }
      }
    )
    .then(response => products = response.data)
    .catch(error => errorMsg.value = `couldn't get product info [${basicErrorMessage(error)}]`)

  loadingProductInfo.value = false

  if (errorMsg.value) {
    return
  }

  barcodeChecked.value = true

  if (products.length != 0) {
    productInfo.value = products[0]!
    productInfoRequired.value = false
  }
}

async function submitForm() {
  submittingForm.value = true
  errorMsg.value = null

  productInfo.value.barcode = barcodeInput.value

  await submitProduct(productInfo.value)
    .then(response => productInfo.value.id = response.data.id)
    .catch(e => errorMsg.value = `product submission failed [${basicErrorMessage(e)}]`)

  if (errorMsg.value) {
    submittingForm.value = false
    return
  }

  itemInfo.value.product_id = productInfo.value.id

  await submitItem(itemInfo.value)
    .then(() => emit("submit"))
    .catch(e => errorMsg.value = `item submission failed [${basicErrorMessage(e)}]`)

  submittingForm.value = false
}

onMounted(resetForm)
</script>

<template>
  <div class="flex flex-col gap-4">
    <form @submit.prevent=setupItemForm class="flex gap-4">
      <input
        tabindex="0"
        type="text"
        ref="barcode"
        v-model="barcodeInput"
        placeholder="scan a barcode"
        class="input grow"
        :disabled="barcodeChecked || loadingProductInfo"
        required
        maxlength="128"
      />

      <button class="btn w-16" type="submit" :disabled="barcodeChecked || loadingProductInfo">
        <span v-if="!loadingProductInfo">scan</span>
        <span v-else class="loading loading-spinner"></span>
      </button>
    </form>

    <div v-if="barcodeChecked" class="flex flex-col items-center gap-4">
      <div class="divider text-xs m-0">product info</div>

      <ProductForm
        :product-to-edit="productInfo"
        :read-only="!productInfoRequired"
        :show-buttons="false"
        @update="product => productInfo = product"
      />

      <div class="divider text-xs m-0">item info</div>

      <ItemForm
        :product-info="productInfo"
        :show-buttons="false"
        @update="item => itemInfo = item"
      />

      <span v-if="errorMsg" class="text-error text-sm">{{ errorMsg.toLowerCase() }}</span>

      <div v-show=barcodeChecked class="flex gap-4 w-full">
        <button class="btn w-0 grow" type="button" @click="resetForm">reset</button>

        <button class="btn btn-accent w-0 grow" @click=submitForm>
          <span v-if="submittingForm" class="loading loading-spinner"></span>
          <span v-else>create</span>
        </button>
      </div>
    </div>

    <div v-else class="flex flex-col gap-4 w-full">
      <div class="divider text-xs m-0">or</div>

      <div class="cursor-not-allowed">
        <button class="btn btn-primary btn-disabled w-full" disabled>select custom product</button>
      </div>

      <p class="text-xs text-center text-base-content/60">(coming soon)</p>
    </div>
  </div>
</template>
