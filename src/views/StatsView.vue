<script setup lang="ts">
import { api, type Stats } from '@/api'
import { basicErrorMessage } from '@/utils'
import { onMounted, type Ref } from 'vue'
import { ref } from 'vue'

const stats: Ref<Stats | null> = ref(null)
const statsErrorMessage: Ref<string | null> = ref(null)
const statsLoading = ref(false)

const DECIMAL_LOCALE_OPTIONS: Intl.NumberFormatOptions = {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1,
}

const PERCENT_LOCALE_OPTIONS: Intl.NumberFormatOptions = {
  style: "percent",
  ...DECIMAL_LOCALE_OPTIONS,
}

interface SummaryStat {
  title: string,
  calc: (s: Stats) => string,
}

const SUMMARY_STATS: SummaryStat[] = [
  {
    title: "current items",
    calc: (s) => s.current_items.toLocaleString(),
  },
  {
    title: "total items",
    calc: (s) => s.total_items.toLocaleString(),
  },
  {
    title: "products indexed",
    calc: (s) => s.products.toLocaleString(),
  },
  {
    title: "data completeness",
    calc: (s) => (
      ((s.products_with_cost + s.products_with_weight) / (2 * s.products))
        .toLocaleString(undefined, PERCENT_LOCALE_OPTIONS)
    )
  },
  {
    title: "items wasted",
    calc: (s) => s.wasted_items.toLocaleString(),
  },
  {
    title: "quantity wasted",
    calc: (s) => (s.wasted_quantity / s.total_items)
      .toLocaleString(undefined, PERCENT_LOCALE_OPTIONS)
  },
  {
    title: "items per product",
    calc: (s) => (s.total_items / s.products)
      .toLocaleString(undefined, DECIMAL_LOCALE_OPTIONS)
  },
  {
    title: "currently expired items",
    calc: (s) => s.expired_items.toLocaleString(),
  },
]

async function fetchStats() {
  statsErrorMessage.value = null
  statsLoading.value = true

  try {
    stats.value = (await api.get<Stats>("/stats")).data
  } catch (error) {
    statsErrorMessage.value = basicErrorMessage(error)
  }

  statsLoading.value = false
}

onMounted(fetchStats)
</script>

<template>
  <div v-if="stats">
    <div class="divider [font-variant:small-caps] opacity-60">
      summary stats
    </div>

    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <div v-for="stat in SUMMARY_STATS" class="grid p-4 place-items-center">
        <span class="stat-value">{{ stat.calc(stats) }}</span>
        <span class="stat-title whitespace-normal text-center">{{ stat.title }}</span>
      </div>
    </div>
  </div>
</template>
