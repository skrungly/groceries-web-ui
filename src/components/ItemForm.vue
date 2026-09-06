<script setup lang="ts">
import { nextTick, onMounted, ref, useTemplateRef, watch, type Ref } from 'vue'

import { api, type Item, type Product } from '@/api'

const props = defineProps<{ itemToEdit: Item | null }>()
const emit = defineEmits(["submit"])

const barcodeInput: Ref<string | null> = ref(null)
const barcodeChecked: Ref<boolean> = ref(false)
const itemInfo: Ref<Partial<Item>> = ref({})
const productInfo: Ref<Partial<Product>> = ref({})
const productInfoRequired = ref(false)

const expiryInput: Ref<string | null> = ref(null)

const barcodeField = useTemplateRef("barcode")

function getLocalISOString(date?: Date): string {
  if (date === undefined) {
    date = new Date(Date.now())
  }

  let tzOffset = date.getTimezoneOffset() * 60000  // minutes -> ms
  let localTimestamp = new Date(date.getTime() - tzOffset)
  return localTimestamp.toISOString().slice(0, 16)
}

async function resetForm() {
  barcodeInput.value = null
  barcodeChecked.value = false
  itemInfo.value = { ...props.itemToEdit }
  productInfo.value = props.itemToEdit?.product ?? {}
  productInfoRequired.value = false

  if (!props.itemToEdit) {
    // focus doesn't apply without deferring to nextTick. not sure why!
    nextTick(() => barcodeField.value?.focus())
  }

  if (props.itemToEdit?.expires_at) {
    expiryInput.value = getLocalISOString(
      new Date(Date.parse(props.itemToEdit.expires_at)),
    ).split("T")[0] ?? null
  }

  if (props.itemToEdit?.opened_at) {
    itemInfo.value.opened_at = getLocalISOString(
      new Date(Date.parse(props.itemToEdit.opened_at))
    )
  }
}

async function onEditQuantity(event: InputEvent) {
  productInfo.value.quantity = parseInt((event.target as HTMLInputElement).value) || undefined

  // if we try to modify `percent_remaining` now, its corresponding input[type=range] will
  // enforce its current 'max' attribute, which is based on the old product quantity. by
  // deferring this to nextTick, we can ensure that the 'max' attribute adapts to the new
  // quantity change *before* we set `percent_remaining` to its new maximum value
  nextTick(() => itemInfo.value.percent_remaining = 100 * (productInfo.value.quantity ?? 1))
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
  itemInfo.value.percent_remaining = 100 * (productInfo.value.quantity ?? 1)
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

  // it would be nice to track both remaining % and waste % at the same time,
  // but for now the user can edit 'percent_remaining' to undiscard an item
  if (itemInfo.value.percent_remaining && itemInfo.value.percent_wasted) {
    itemInfo.value.percent_wasted = 0
  }

  if (expiryInput.value) {
    // expiry dates on packaging refers to the end of the day
    let expiryDate = new Date(Date.parse(expiryInput.value))
    expiryDate.setHours(23)
    expiryDate.setMinutes(59)
    expiryDate.setSeconds(59)
    expiryDate.setMilliseconds(999)

    itemInfo.value.expires_at = expiryDate.toISOString()
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
          <input
            :value="productInfo.quantity"
            @input="onEditQuantity"
            type="number"
            placeholder="1"
            :disabled="!productInfoRequired"
          />
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
          <input v-model="expiryInput" type="date"/>
        </label>

        <div class="join w-full">
          <label class="input join-item grow">
            <span class="label min-w-25">opened at</span>
            <input class="w-0 grow overflow-scroll" v-model="itemInfo.opened_at" type="datetime-local" step="60"/>
          </label>

          <button
            class="btn join-item"
            type="button"
            @click="itemInfo.opened_at = getLocalISOString()"
          >now</button>
        </div>

        <label v-if="!itemToEdit || productInfo.quantity" class="input w-full">
          <span class="label min-w-25">remaining</span>
          <input
            v-model="itemInfo.percent_remaining"
            type="range"
            min="0"
            :max="100 * (productInfo.quantity ?? 1)"
            :step="productInfo.quantity && productInfo.quantity > 1 ? 100 : 1"
            class="range range-xs h-4"
          />

          <span v-if="productInfo.quantity && productInfo.quantity > 1" class="label min-w-12 justify-center">
            {{ itemInfo.percent_remaining! / 100 }}
          </span>
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
