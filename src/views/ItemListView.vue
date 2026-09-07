<script setup lang="ts">
import { onMounted, ref, type Ref } from 'vue'

import { api, type Item } from '@/api'
import Modal from '@/components/Modal.vue'
import ItemListRow from '@/components/ItemListRow.vue'
import ItemForm from '@/components/ItemForm.vue'

let currentItems: Ref<Item[] | null> = ref(null)
let oldItems: Ref<Item[] | null> = ref(null)

let showNewItemModal = ref(false)

let itemToEdit: Ref<Item | null> = ref(null)

async function fetchItems() {
  // ensure the edit form is closed
  itemToEdit.value = null

  await api.get<Item[]>(
    "/items", {
      params: {
        sort: 'soonest_expiry',
        remaining: 1  // i.e. true
      }
    }
  ).then(response => currentItems.value = response.data)

  await api.get<Item[]>(
    "/items", {
      params: {
        sort: '-updated_at',
        remaining: 0
      }
    }
  ).then(response => oldItems.value = response.data)
}

onMounted(fetchItems)
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
            <th class="w-full min-w-48">item</th>
            <th class="min-w-32">expires</th>
            <th class="min-w-32">added</th>
          </tr>
        </thead>

        <tbody>
          <tr v-if="currentItems" v-for="item in currentItems" class="hover:bg-base-200 duration-100 cursor-pointer" @click="itemToEdit = item">
            <ItemListRow :item=item></ItemListRow>
          </tr>

          <tr v-if="oldItems" v-for="item in oldItems" class="hover:bg-base-200 duration-100 cursor-pointer opacity-50" @click="itemToEdit = item">
            <ItemListRow :item=item></ItemListRow>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="fab sticky bottom-4">
      <button class="btn btn-xl btn-circle btn-primary" @click="showNewItemModal = true">+</button>
    </div>

    <Modal v-if="showNewItemModal" @close="showNewItemModal = false">
      <h3 class="text-lg font-bold">new item</h3>

      <ItemForm :item-to-edit=null @submit="fetchItems"></ItemForm>
    </Modal>

    <Modal v-if="itemToEdit" @close="itemToEdit = null">
      <h3 class="text-lg font-bold text-nowrap overflow-hidden text-ellipsis">{{ itemToEdit.product.name }}</h3>

      <ItemForm :item-to-edit=itemToEdit @submit="fetchItems"></ItemForm>
    </Modal>
  </div>
</template>
