<script setup lang="ts">
import { type Item } from '@/api'
import { time_ago } from '@/utils'
import { computed } from 'vue';

const props = defineProps<{item: Item}>()

function getSoonestExpiry(): Date | null {
  let expiryDate = null
  let openedDate = null

  if (props.item.expires_at) {
    expiryDate = new Date(Date.parse(props.item.expires_at))
  }

  if (props.item.opened_at) {
    openedDate = new Date(Date.parse(props.item.opened_at))
  }

  if (openedDate && props.item.product.shelf_life_opened) {
    let openedExpiry = new Date(openedDate)
    openedExpiry.setDate(
      openedExpiry.getDate()
      + props.item.product.shelf_life_opened
    )

    if (expiryDate && openedExpiry < expiryDate) {
      return openedExpiry
    }
  }

  return expiryDate
}

const soonestExpiry = computed(getSoonestExpiry)
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
  <td class="text-nowrap max-w-0 overflow-hidden text-ellipsis">{{ item.product.name }}</td>
  <td class="text-nowrap">
    <span v-if="soonestExpiry && item.percent_remaining">
      {{ time_ago.format(soonestExpiry) }}
    </span>
  </td>
  <td class="text-nowrap">{{ time_ago.format(new Date(Date.parse(item.created_at))) }}</td>
</template>
