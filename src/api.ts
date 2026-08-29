import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 2000,
})

export interface Timestamped {
  updated_at: string
  created_at: string
}

// note that properties are nullable but not optional.
// these accurately reflect the api's json responses
export interface Product extends Timestamped {
  id: string
  user_id: string | null
  name: string
  barcode: string | null
  shelf_life_opened: number | null
  quantity: number
  cost: number
  net_weight: number
}

export interface Item extends Timestamped {
  id: string
  user_id: string | null
  product_id: string
  product: Product
  percent_remaining: number
  percent_wasted: number
  expires_at: string | null
  opened_at: string | null
}
