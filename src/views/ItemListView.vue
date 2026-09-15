<script setup lang="ts">
import { onMounted, onUnmounted, ref, type Ref } from 'vue'

import { api, ItemSortOption, type Item } from '@/api'
import { basicErrorMessage } from '@/utils'
import Modal from '@/components/Modal.vue'
import ItemListRow from '@/components/ItemListRow.vue'
import ItemForm from '@/components/ItemForm.vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

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
    title: "updated",
    sort: ItemSortOption.Updated,
    style: "min-w-32",
  }
]

const items: Ref<Item[] | null> = ref(null)
const itemListLoading = ref(false)
const itemListErrorMsg: Ref<string | null> = ref(null)

const SEARCH_INTERVAL_MS = 200

const searchInput: Ref<string> = ref("")
let prevSearch = ""

const searchInterval = setInterval(
  function () {
    if (searchInput.value != prevSearch) {
      fetchItems()
      prevSearch = searchInput.value
    }
  }, SEARCH_INTERVAL_MS
)

const sortBy: Ref<ItemSortOption | null> = ref(null)
const sortAsc: Ref<boolean> = ref(true)

const showNewItemModal = ref(false)
const itemToEdit: Ref<Item | null> = ref(null)

async function fetchItems() {
  // ensure the edit form is closed
  itemToEdit.value = null
  itemListErrorMsg.value = null

  let sortPrefix = sortBy.value && !sortAsc.value ? "-" : ""
  let sortQuery = sortBy.value ? sortPrefix + sortBy.value : null

  let search = searchInput.value.trim();

  // intentionally undefined so unset params aren't included
  let barcode;
  let name;

  // barcode searching doesn't really need a regex, but it would be
  // nice to explicitly support other non-numeric formats in future
  if (search.match(/^\d+$/)) {
    barcode = search
  } else if (search) {
    name = search
  }

  itemListLoading.value = true

  try {
    let itemsResponse = await api.get<Item[]>(
      "/items", {
        params: {
          sort: sortQuery ?? ItemSortOption.Expiry,
          remaining: 1,  // i.e. true
          barcode: barcode,
          name: name,
        }
      }
    )

    let olderItemsResponse = await api.get<Item[]>(
      "/items", {
        params: {
          sort: sortQuery ?? `-${ItemSortOption.Updated}`,
          remaining: 0,
          barcode: barcode,
          name: name,
        }
      }
    )

    items.value = itemsResponse.data.concat(olderItemsResponse.data)

  } catch (error) {
    items.value = null
    itemListErrorMsg.value = basicErrorMessage(error)
  }

  itemListLoading.value = false
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
onUnmounted(() => clearInterval(searchInterval))
</script>

<template>
  <div class="flex flex-col gap-4 h-full relative">
    <div class="flex gap-4">
      <label class="input grow shrink-0 pr-0">
        <FontAwesomeIcon icon="fa-solid fa-magnifying-glass" class="opacity-50"/>
        <input type="text" v-model="searchInput" placeholder="search"/>


        <div class="mx-3 opacity-50 hover:opacity-80">
          <button v-if="searchInput" class="cursor-pointer" @click="searchInput = ''">
            <FontAwesomeIcon icon="fa-solid fa-xmark"/>
          </button>

          <button v-else class="cursor-pointer" @click="fetchItems">
            <FontAwesomeIcon icon="fa-solid fa-arrows-rotate"/>
          </button>
        </div>
      </label>

      <button class="hidden sm:flex btn btn-primary" @click="showNewItemModal = true">
        <FontAwesomeIcon icon="fa-solid fa-barcode"/>
      </button>
    </div>

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
                <span class="flex flex-col justify-center text-xs">
                  <FontAwesomeIcon v-if="sortBy !== header.sort" class="opacity-50" icon="fa-solid fa-sort"/>
                  <FontAwesomeIcon v-else-if="sortAsc" class="opacity-80" icon="fa-solid fa-sort-up"/>
                  <FontAwesomeIcon v-else class="opacity-80" icon="fa-solid fa-sort-down"/>
                </span>
              </span>
            </th>

          </tr>
        </thead>

        <tbody v-if="items && items.length">
          <tr
            v-for="item in items"
            class="hover:bg-base-200 cursor-pointer"
            :class="item.percent_remaining ? 'opacity-100' : 'opacity-50'"
            @click="itemToEdit = item"
          >
            <ItemListRow :item=item></ItemListRow>
          </tr>
        </tbody>
      </table>

      <div class="flex justify-center opacity-80 text-md my-8">
        <div v-if="itemListErrorMsg" class="text-error">
          <FontAwesomeIcon class="text-xl px-2" icon="fa-solid fa-cat"/>
          <span>could not load items [{{ itemListErrorMsg.toLowerCase() }}]</span>
        </div>

        <div v-else-if="items && items.length == 0">
          <FontAwesomeIcon class="text-xl px-2" icon="fa-solid fa-crow"/>
          <span>no items found</span>
        </div>
      </div>
    </div>

    <div v-if="itemListLoading" class="flex absolute justify-center top-32 right-0 left-0">
      <span class="loading loading-spinner loading-xl opacity-80"></span>
    </div>

    <div class="fab sticky bottom-4 sm:hidden">
      <button class="btn btn-xl btn-circle btn-primary" @click="showNewItemModal = true">
        <FontAwesomeIcon icon="fa-solid fa-barcode"/>
      </button>
    </div>

    <Modal v-if="showNewItemModal" @close="showNewItemModal = false">
      <button class="btn btn-circle btn-ghost absolute right-2 top-2" @click="showNewItemModal = false">×</button>
      <h3 class="text-lg font-bold">new item</h3>

      <ItemForm :item-to-edit=null @submit="fetchItems"></ItemForm>
    </Modal>

    <Modal v-if="itemToEdit" @close="itemToEdit = null">
      <button class="btn btn-circle btn-ghost absolute right-2 top-2" @click="itemToEdit = null">×</button>
      <h3 class="text-lg font-bold text-nowrap overflow-hidden text-ellipsis">{{ itemToEdit.product.name }}</h3>

      <ItemForm :item-to-edit=itemToEdit @submit="fetchItems"></ItemForm>
    </Modal>
  </div>
</template>
