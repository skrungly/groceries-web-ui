<script setup lang="ts">
import { time_ago } from '@/utils'

// test data, good enough for a mock-up!
let products = {
  1: {
    gtin: 4088600006956,
    name: "filtered milk",
    shelf_life_opened: 86400 * 1000 * 7,
    quantity: 1,
    weight: 2000,
  },

  2: {
    gtin: 4061463723178,
    name: "tomato ketchup",
    shelf_life_opened: 86400 * 1000 * 6 * 7,
    quantity: 1,
    weight: 550,
  },

  3: {
    gtin: 4088600119410,
    name: "sausage rolls",
    shelf_life_opened: 86400 * 1000 * 2,
    quantity: 8,
    weight: 480,
  }
}

let items = [
  {
    id: 1,
    product: products[1],
    expires_at: new Date(2026, 8, 3),
    percent_remaining: 30,
    percent_wasted: 0,
    created_at: new Date(2026, 7, 18, 16, 0, 0),
    updated_at: new Date(2026, 7, 18, 16, 20, 0),
    opened_at: new Date(2026, 7, 18, 16, 20, 0),
  },

  {
    id: 2,
    product: products[1],
    expires_at: new Date(2026, 8, 10),
    percent_remaining: 100,
    percent_wasted: 0,
    created_at: new Date(2026, 7, 23, 14, 10, 0),
    updated_at: new Date(2026, 7, 23, 14, 10, 0),
    opened_at: null,
  },

  {
    id: 3,
    product: products[2],
    expires_at: new Date(2027, 7, 5),
    percent_remaining: 50,
    percent_wasted: 0,
    created_at: new Date(2026, 7, 17, 10, 0, 0),
    updated_at: new Date(2026, 7, 22, 21, 20, 0),
    opened_at: new Date(2026, 7, 18, 12, 40, 0),
  },

  {
    id: 4,
    product: products[3],
    expires_at: new Date(2026, 7, 12),
    percent_remaining: 0,
    percent_wasted: 50,
    created_at: new Date(2026, 7, 10, 12, 45, 0),
    updated_at: new Date(2026, 7, 13, 16, 20, 0),
    opened_at: new Date(2026, 7, 10, 14, 40, 0),
  },

  {
    id: 5,
    product: products[3],
    expires_at: new Date(2026, 7, 24),
    percent_remaining: 100,
    percent_wasted: 0,
    created_at: new Date(2026, 7, 10, 12, 45, 0),
    updated_at: new Date(2026, 7, 13, 13, 20, 0),
    opened_at: null,
  },
]

// TODO: this would be better as a method on an Item class
function actualExpiry(item: any) {
  if (item.opened_at === null) {
    return item.expires_at
  }

  let opened_expiry = new Date(item.opened_at.getTime() + item.product.shelf_life_opened)

  return opened_expiry < item.expires_at ? opened_expiry : item.expires_at
}

function showItem(item: any) {
  return alert(item.product.name)
}

// this might be how we want to show items by default
let shownItems = items.filter((i) => i.percent_remaining)
shownItems.sort((a, b) => actualExpiry(a) > actualExpiry(b) ? 1 : -1)
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
          <tr v-for="item in shownItems" class="hover:bg-base-200 duration-100 cursor-pointer" @click="showItem(item)">
            <td><progress class="progress w-full" :value="item.percent_remaining" max="100"/></td>
            <td class="text-nowrap max-w-0 overflow-hidden text-ellipsis">{{ item.product.name }}</td>
            <td class="text-nowrap" :class="actualExpiry(item) < Date.now() ? 'text-error' : 'text-base-content'">{{ time_ago.format(actualExpiry(item)) }}</td>
            <td class="text-nowrap">{{ time_ago.format(item.created_at) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="fab sticky bottom-4">
      <button class="btn btn-xl btn-circle btn-primary">+</button>
    </div>
  </div>
</template>
