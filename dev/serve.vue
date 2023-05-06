<script>
import Vue from 'vue';
// Uncomment import and local "components" registration if library is not registered globally.
// import { ComExcelImportExportSample } from '@/entry.esm';

export default Vue.extend({
  name: 'ServeDev',
  // components: {
  //  ComExcelImportExportSample,
  // }
});
</script>

<template>
  <div id="app">
    <com-excel-import-export-sample />
  </div>
</template>
