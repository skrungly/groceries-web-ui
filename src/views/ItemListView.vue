<script setup lang="ts">
import { onMounted, ref, type Ref } from 'vue'

import { api, type Item, type Product } from '@/api'
import Modal from '@/components/Modal.vue'
import { time_ago } from '@/utils'

let showNewItemModal = ref(false)

// /**
//  * returns the soonest known expiry date for a given Item.
//  *
//  * @param {Item} item an Item
//  */
// function actualExpiry(item: Item): Date | null {
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

let barcodeInput: Ref<string | null> = ref(null)
// let newItem: Ref<Item | null> = ref(null)

/* just a couple of functions for debugging purposes */
function showItem(item: Item) {
  return alert(item.product.name)
}

function checkNewItem() {
  showNewItemModal.value = false
  console.log(barcodeInput.value)
}

let items: Ref<Item[] | null> = ref(null)
let shownItems: Ref<Item[] | null> = ref(null)

onMounted(async () => {
  // TODO: error handling
  items.value = await api.get<Item[]>("items")
    .then(response => response.data)

  shownItems.value = items.value?.filter(i => i.percent_remaining)!
})
</script>

<template>
  <div class="flex flex-col gap-4 h-full relative">
    <label class="input w-full">
      <input type="search" placeholder="search"/>
    </label>

    <div class="overflow-x-scroll h-full">
      <table class="table">
        <thead>
          <tr>
            <th class="w-24 min-w-24">remaining</th>
            <th class="w-full min-w-32">item</th>
            <th class="min-w-32">expires</th>
            <th class="min-w-32">added</th>
          </tr>
        </thead>

        <tbody>
          <tr v-if="shownItems" v-for="item in shownItems" class="hover:bg-base-200 duration-100 cursor-pointer" @click="showItem(item)">
            <!-- TODO: ItemTableRow component to allow storing each actualExpiry result -->
            <td><progress class="progress w-full" :value="item.percent_remaining" max="100"></progress></td>
            <td class="text-nowrap max-w-0 overflow-hidden text-ellipsis">{{ item.product.name }}</td>
            <td class="text-nowrap">&nbsp</td> <!-- actualExpiry needed here -->
            <td class="text-nowrap">{{ time_ago.format(new Date(Date.parse(item.created_at))) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="fab sticky bottom-4">
      <button class="btn btn-xl btn-circle btn-primary" @click="showNewItemModal = true">+</button>
    </div>

    <Modal v-show="showNewItemModal" @close="showNewItemModal = false">
      <h3 class="text-lg font-bold">new item</h3>

      <form @submit.prevent="checkNewItem" class="flex flex-col gap-2 pt-4">
        <div class="join">
          <input type="text" v-model="barcodeInput" placeholder="scan a barcode" class="input grow join-item"/>
          <button type="submit" class="btn btn-primary join-item">+</button>
        </div>

        <div class="divider">or</div>

        <div class="cursor-not-allowed">
          <button class="btn btn-primary btn-disabled w-full" disabled>select custom product</button>
        </div>
        <p class="text-xs text-center text-base-content/60">(coming soon)</p>
      </form>
    </Modal>
  </div>
</template>
