<script setup lang="ts">
import { type Item } from '@/api'
import { time_ago } from '@/utils'
import { ref } from 'vue';

const props = defineProps<{item: Item}>()

const MS_PER_DAY = 24 * 60 * 60 * 1000

const soonestExpiry = ref(
  (props.item.soonest_expiry)
    ? new Date(Date.parse(props.item.soonest_expiry))
    : null
)

function expiryColour(expiry: Date) {
  let now = new Date(Date.now())
  let daysLeft = (expiry.getTime() - now.getTime()) / MS_PER_DAY

  if (daysLeft <= 0) {
    return "text-red-800 font-medium"
  }
}
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
    <span v-if="soonestExpiry && item.percent_remaining" :class="expiryColour(soonestExpiry)">
      {{ time_ago.format(soonestExpiry) }}
    </span>
  </td>
  <td class="text-nowrap">{{ time_ago.format(new Date(Date.parse(item.created_at))) }}</td>
</template>
