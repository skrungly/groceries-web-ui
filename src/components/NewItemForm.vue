<script setup lang="ts">
import { ref, type Ref } from 'vue'

let barcodeInput: Ref<string | null> = ref(null)

let checkedBarcode = ref(false);

// /**
//  * returns the soonest known expiry date for a given Item.
//  *
//  * @param {Item} item an Item
//  */
// function findActualExpiry(item: Item): Date | null {
//   if (!item.opened_at || !item.product.shelf_life_opened) {
//     return item.expires_at
//   }

//   let opened_expiry = new Date(
//     item.opened_at.getTime() + item.product.shelf_life_opened
//   )

//   if (!item.expires_at) {
//     return opened_expiry
//   }

//   return opened_expiry < item.expires_at ? opened_expiry : item.expires_at
// }

async function submit() {
  checkedBarcode.value = true

  barcodeInput.value = null
}
</script>

<template>
  <form @submit.prevent="submit" class="flex flex-col gap-2 pt-4">
    <input type="text" v-model="barcodeInput" placeholder="scan a barcode" class="input w-full"/>
    <button type="submit" class="hidden"></button>

    <div class="divider">or</div>

    <div class="cursor-not-allowed">
      <button class="btn btn-primary btn-disabled w-full" disabled>select custom product</button>
    </div>

    <p class="text-xs text-center text-base-content/60">(coming soon)</p>
  </form>
</template>
