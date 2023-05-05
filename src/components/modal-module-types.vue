<template>
  <div class="vui-module-types">
    <table class="vui-modal-table">
      <tr>
        <th>P.</th>
        <th>Type</th>
        <th>Color</th>
        <th>
          Patterns (<a
            href="https://github.com/micromatch/micromatch"
            target="_blank"
          >micromatch</a>)
        </th>
        <th>Description</th>
      </tr>
      <tr
        v-for="(item, i) in state.moduleTypes"
        :key="i"
      >
        <td>
          {{ item.priority }}
        </td>
        <td>
          {{ item.type }}
        </td>
        <td :style="{color:item.color}">
          {{ item.color }}
        </td>
        <td>
          <div
            v-for="(p, j) in item.patterns"
            :key="j"
            class="vui-modal-nowrap"
          >
            {{ p }}
          </div>
        </td>
        <td>
          <div style="max-height: 50px; overflow: hidden;">
            {{ item.description }}
          </div>
        </td>
      </tr>
    </table>
  </div>
</template>
<script setup>
import { inject } from 'vue';

const state = inject('state');

</script>
<style lang="scss">
.vui-module-types {
    width: 100%;
    height: 100%;
    overflow: auto;
}
</style>
