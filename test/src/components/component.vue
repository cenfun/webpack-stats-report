<template>
  <div class="component">
    component:
    <ComponentSub />
  </div>
</template>
<script>
import './style.scss';
import ComponentSub from './component-sub.vue';

export default {
    components: {
        ComponentSub
    }
};

</script>
