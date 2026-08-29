<script setup lang="ts">
import { type Item } from '@/api'
import { time_ago } from '@/utils'

const props = defineProps<{
  item: Item
}>()

function getSoonestExpiry(): Date | null {
  let expiryDate = null;
  let openedDate = null;

  if (props.item.expires_at) {
    expiryDate = new Date(Date.parse(props.item.expires_at))
  }

  if (props.item.opened_at) {
    openedDate = new Date(Date.parse(props.item.opened_at))
  }

  console.log(props.item.expires_at)

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

let soonestExpiry = getSoonestExpiry()
</script>

<template>
  <td><progress class="progress w-full" :value="item.percent_remaining" max="100"></progress></td>
  <td class="text-nowrap max-w-0 overflow-hidden text-ellipsis">{{ item.product.name }}</td>
  <td class="text-nowrap">{{ soonestExpiry ? time_ago.format(soonestExpiry) : null }}</td>
  <td class="text-nowrap">{{ time_ago.format(new Date(Date.parse(item.created_at))) }}</td>
</template>
