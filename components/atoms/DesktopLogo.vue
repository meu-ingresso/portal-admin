<template>
  <img 
    src="~/assets/images/logo_footer.png" 
    alt="Meu Ingresso"
    height="40"
    class="logoMenu" 
    @click="$emit('click')" 
  />
</template>

<style scoped>
.logoMenu {
  max-width: 100%;
  object-fit: contain;
  cursor: pointer;
}
</style>
