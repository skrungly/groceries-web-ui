<script setup lang="ts">
import { onMounted, ref, type Ref } from 'vue'

import { api, ItemSortOption, type Item } from '@/api'
import Modal from '@/components/Modal.vue'
import ItemListRow from '@/components/ItemListRow.vue'
import ItemForm from '@/components/ItemForm.vue'

const items: Ref<Item[] | null> = ref(null)

interface SortableTableHeader {
  title: string,
  sort: ItemSortOption,
  style: string
}

const SORTABLE_HEADERS: SortableTableHeader[] = [
  {
    title: "item",
    sort: ItemSortOption.Name,
    style: "w-full min-w-48",
  },
  {
    title: "expires",
    sort: ItemSortOption.Expiry,
    style: "min-w-32",
  },
  {
    title: "added",
    sort: ItemSortOption.Created,
    style: "min-w-32",
  }
]

const sortBy: Ref<ItemSortOption | null> = ref(null)
const sortAsc: Ref<boolean> = ref(true)

const showNewItemModal = ref(false)
const itemToEdit: Ref<Item | null> = ref(null)

async function fetchItems() {
  // ensure the edit form is closed
  itemToEdit.value = null

  let sortPrefix = sortBy.value && !sortAsc.value ? "-" : ""
  let sortQuery = sortBy.value ? sortPrefix + sortBy.value : null

  await api.get<Item[]>(
    "/items", {
      params: {
        sort: sortQuery ?? ItemSortOption.Expiry,
        remaining: 1  // i.e. true
      }
    }
  ).then(response => items.value = response.data)

  await api.get<Item[]>(
    "/items", {
      params: {
        sort: sortQuery ?? `-${ItemSortOption.Updated}`,
        remaining: 0
      }
    }
  ).then(response => items.value = items.value?.concat(response.data) ?? null)
}

async function changeSort(option: ItemSortOption) {
  if (sortBy.value !== option) {
    sortBy.value = option
    sortAsc.value = true

  } else if (sortAsc.value) {
    sortAsc.value = false

  } else {
    sortBy.value = null
  }

  fetchItems()
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
        <thead class="select-none">
          <tr>
            <th class="w-24 min-w-24">remaining</th>

            <th
              v-for="header in SORTABLE_HEADERS"
              class="cursor-pointer"
              :class="header.style"
              @click="changeSort(header.sort)"
            >
              <span class="flex gap-1">
                {{ header.title }}
                <span v-if="sortBy == header.sort">
                  <span v-if="sortAsc">↑</span>
                  <span v-else>↓</span>
                </span>
              </span>
            </th>

          </tr>
        </thead>

        <tbody>
          <tr
            v-if="items"
            v-for="item in items"
            class="hover:bg-base-200 duration-100 cursor-pointer"
            :class="item.percent_remaining ? 'opacity-100' : 'opacity-50'"
            @click="itemToEdit = item"
          >
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
