<script lang="ts"></script>

<template>
  <dialog id="modal" class="modal modal-open">
    <div class="modal-box max-w-md">
      <slot>
        &nbsp;
      </slot>
    </div>

    <div class="modal-backdrop">
      <button @click="() => $emit('close')"></button>
    </div>
  </dialog>
</template>
