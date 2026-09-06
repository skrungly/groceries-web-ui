<script setup lang="ts">
import { type Item } from '@/api'
import { time_ago } from '@/utils'

const props = defineProps<{item: Item}>()
</script>

<template>
  <td>
    <progress
      class="progress w-full"
      :class="item.percent_wasted ? 'progress-error' : 'progress-neutral'"
      :value="item.percent_remaining || item.percent_wasted"
      :max="100 * item.product.quantity"
    ></progress>
  </td>
  <td class="text-nowrap max-w-0 overflow-hidden text-ellipsis">
    {{ item.product.name }}
    <span class="text-base-content/60 text-xs">
      <span v-if="item.product.quantity > 1">({{ item.product.quantity }}pc)</span>
      <span v-else-if="item.product.net_weight">({{ item.product.net_weight }}g)</span>
    </span>
  </td>
  <td class="text-nowrap">
    <span v-if="item.soonest_expiry && item.percent_remaining">
      {{ time_ago.format(new Date(Date.parse(item.soonest_expiry))) }}
    </span>
  </td>
  <td class="text-nowrap">{{ time_ago.format(new Date(Date.parse(item.created_at))) }}</td>
</template>
