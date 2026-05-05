<script setup lang="ts">
import { ref } from 'vue'

import AdminHeader from './partials/Header.vue'
import AdminBreadcrumb from './partials/Breadcrumb.vue'
import AdminSidebar from './partials/Sidebar.vue'

const isSidebarOpen = ref(false)

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value
}

function closeSidebar() {
  isSidebarOpen.value = false
}
</script>

<template>
  <div class="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(31,157,85,0.14),_transparent_26%),linear-gradient(180deg,_rgba(248,251,246,0.98),_rgba(236,244,237,0.95))]">
    <AdminSidebar :is-open="isSidebarOpen" @close="closeSidebar" />

    <div class="lg:pl-72">
      <AdminHeader :is-sidebar-open="isSidebarOpen" @toggle-sidebar="toggleSidebar" />

      <main class="px-4 py-6 sm:px-6 lg:px-8">
        <div class="mx-auto max-w-7xl space-y-6">
          <AdminBreadcrumb />
          <RouterView />
        </div>
      </main>
    </div>
  </div>
</template>

<style>
</style>
