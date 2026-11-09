<script setup lang="ts">
import { submitProduct, type Product } from "@/api"
import { onMounted, ref, watch, type Ref } from "vue"

const props = defineProps<{
  productToEdit?: Partial<Product>
  readOnly: boolean
  showButtons: boolean
}>()

const emit = defineEmits<{
  (e: "submit", product: Product): void
  (e: "update", product: Partial<Product>): void
}>()

const productInputs: Ref<Partial<Product>> = ref({})
const submittingForm = ref(false)

async function resetForm() {
  productInputs.value = { ...props.productToEdit }
}

async function submitForm() {
  submittingForm.value = true

  await submitProduct(productInputs.value)
    .then(response => emit("submit", response.data))
    .finally(() => submittingForm.value = false)
}

watch(productInputs, () => emit("update", productInputs.value))
onMounted(resetForm)
</script>

<template>
  <form @submit.prevent.stop=submitForm class="flex flex-col gap-4 w-full">
    <label class="input w-full">
      <span class="label min-w-25 gap-0.75">
        name<span v-if="!readOnly" class="text-error text-xs">*</span>
      </span>
      <input
        v-model="productInputs.name"
        type="text"
        :disabled="readOnly"
        required
        maxlength="128"
      />
    </label>

    <label v-if="!readOnly" class="input w-full">
      <span class="label min-w-25">quantity</span>
      <input
        v-model="productInputs.quantity"
        type="number"
        placeholder="1"
        min="1"
        step="1"
      />
    </label>

    <label v-if="!readOnly" class="input w-full">
      <span class="label min-w-25">use within</span>
      <input v-model="productInputs.shelf_life_opened" placeholder="0" min="0" step="1"/>
      <span class="label">days of opening</span>
    </label>

    <label v-if="!readOnly" class="input w-full">
      <span class="label min-w-25">cost (£)</span>
      <input v-model="productInputs.cost" type="number" placeholder="0.00" min="0" step=".01"/>
    </label>

    <label v-if="!readOnly" class="input w-full">
      <span class="label min-w-25">weight (g)</span>
      <input v-model="productInputs.net_weight" type="number" min="0" placeholder="0"/>
    </label>

    <div v-show=showButtons class="flex gap-4 w-full">
      <button class="btn w-0 grow" type="button" @click="resetForm">reset</button>

      <button class="btn btn-accent w-0 grow" type="submit" :disabled="submittingForm">
        <span v-if="submittingForm" class="loading loading-spinner"></span>
        <span v-else>submit</span>
      </button>
    </div>
  </form>
</template>
