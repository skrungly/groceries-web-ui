<script setup lang="ts">
import { api, type Product } from '@/api'
import DataTable from '@/components/DataTable.vue'
import ItemForm from '@/components/ItemForm.vue'
import Modal from '@/components/Modal.vue'
import { basicErrorMessage, time_ago } from '@/utils'
import { onMounted, ref, type Ref } from 'vue'

const products: Ref<Product[] | null> = ref(null)
const loading = ref(false)
const errorMsg: Ref<string | null> = ref(null)

const searchInput: Ref<string> = ref("")

const productToEdit: Ref<Product | null> = ref(null)

async function updateSearch(search: string) {
  searchInput.value = search.trim()
  fetchProducts()
}

async function fetchProducts() {
  productToEdit.value = null
  errorMsg.value = null

  loading.value = true

  try {
    // the api currently only supports filtering products by
    // exact barcodes. it'll have to do for now
    let response = await api.get<Product[]>(
      "/products", {
        params: { barcode: searchInput.value }
      }
    )

    products.value = response.data

  } catch (error) {
    products.value = null
    errorMsg.value = basicErrorMessage(error)
  }

  loading.value = false
}

onMounted(fetchProducts)
</script>

<template>
  <DataTable
    :loading="loading"
    :errorMsg="errorMsg"
    @search="updateSearch"
  >
    <template v-slot:header>
      <thead>
        <tr class="select-none">
          <th class="w-full min-w-48">product</th>
          <th class="min-w-32">updated</th>
          <th class="min-w-32">added</th>
        </tr>
      </thead>
    </template>

    <template v-slot:body>
      <tbody v-if="products && products.length">
        <tr
          v-for="product in products"
          class="hover:bg-base-200 cursor-pointer"
          @click="productToEdit = product"
        >
          <td class="text-nowrap max-w-0 overflow-hidden text-ellipsis">{{ product.name }}</td>
          <td class="text-nowrap">{{ time_ago.format(new Date(Date.parse(product.updated_at))) }}</td>
          <td class="text-nowrap">{{ time_ago.format(new Date(Date.parse(product.created_at))) }}</td>
        </tr>
      </tbody>
    </template>
  </DataTable>

  <!-- TODO: tidy up this repeated code from ItemListView -->
  <Modal v-if="productToEdit" @close="productToEdit = null">
    <button class="btn btn-circle btn-ghost absolute right-2 top-2" @click="productToEdit = null">×</button>
    <h3 class="text-lg font-bold text-nowrap overflow-hidden text-ellipsis">{{ productToEdit.name }}</h3>

    <ItemForm :item-to-edit=null :product-to-edit=productToEdit @submit="fetchProducts"></ItemForm>
  </Modal>
</template>
