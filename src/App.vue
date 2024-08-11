<template>
  <div class="blanket"></div>
  <div class="appBackground"></div>
  <div class="content mx-auto max-w-screen-lg text-center">
    <h1 class="text-4xl font-bold">The Last Spell Planner</h1>
    <perk-tree />
  </div>
</template>

<script setup lang="ts">
import PerkTree from "./components/PerkTree.vue";
</script>

<style>
body {
  color: white;
}

h1,
h2,
h3,
h4,
h5,
h6 {
  font-family: "Cinzel-Bold", sans-serif;
}
</style>

<style scoped>
/* Stole these from https://bbplanner.xyz */
.blanket {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 1060px;
  transform: translateX(-50%);
  background: rgba(6, 6, 6, 0.7);
  z-index: -1;
  box-shadow: 0 0 30px 35px rgba(6, 6, 6, 0.7);
}

.appBackground {
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  position: fixed;
  transform: translate3d(0, 0, 0);
  background-image: url("/assets/Site-background-dark.webp");
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  filter: grayscale(40%);
  z-index: -2;
}
</style>
