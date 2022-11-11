<template>
  <div id="vritem" class="container">
    <model-viewer
      :style="{
        width: '100%',
        height: '100%',
        minHeight: stylee && stylee.width ? stylee.width + 'px' : '156px',
        minWidth: stylee && stylee.width ? stylee.width + 'px' : '156px',
        maxHeight: stylee && stylee.width ? stylee.width + 'px' : '156px',
      }"
      :src="detail.animation_url"
      auto-rotate
      rotation-per-second="40deg"
      :poster="detail.image"
      class="artwork-image"
      loading="eager"
      camera-controls
    />
  </div>
</template>
<script>
import '@google/model-viewer/dist/model-viewer'
export default {
  props: ['detail', 'stylee']
}
</script>
<style lang="less" scoped>
.artwork-image {
  width: 100%;
  height: 100%;
  min-height: 156px;
  min-width: 150px;
  max-height: 156px;
  border-radius: 12px;
  overflow: hidden;
  background: var(--border-color);
}
</style>
