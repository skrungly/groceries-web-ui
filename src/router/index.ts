import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      component: () => import("../views/LayoutView.vue"),
      children: [
        {
          path: "",
          name: "home",
          component: () => import("../views/ItemListView.vue"),
        },
        {
          path: "/stats",
          name: "stats",
          component: () => import("../views/StatsView.vue"),
        },
        {
          path: "/products",
          name: "products",
          component: () => import("../views/ProductListView.vue"),
        },
      ],
    },
  ],
})

export default router
