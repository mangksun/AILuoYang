<template>
  <slot />
</template>

<script setup lang="ts">
</script>

<style lang="scss">
@import './styles/theme.scss';

page {
  min-height: 100%;
  background: linear-gradient(180deg, #faf8f5 0%, #ece7e1 58%, #ffffff 100%);
  color: #2f2523;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif;
}

view,
text,
button,
input,
textarea,
scroll-view {
  box-sizing: border-box;
}

button {
  padding: 0;
  margin: 0;
  border: 0;
  background: transparent;
  line-height: 1;
}

button::after {
  border: 0;
}
</style>
