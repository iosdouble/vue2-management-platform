<template>

  <div>
    <span>这个是一个标签</span>
    <span>{{ routerData.applyOrderDetailId }}</span>
  </div>
</template>

<script>
    export default {
        name: "ShowFlowHistory",
        props:['routerData'],
    }
</script>

<style scoped>

</style>
