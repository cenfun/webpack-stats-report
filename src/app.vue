<template>
<div class="gui-main">
    <div class="gui-header gui-flex-row">
        <div class="gui-title gui-flex-auto">{{ info.title }}</div>
        <div class="gui-logo"></div>
    </div>
    <div class="gui-filter gui-flex-row">
        
        <div class="gui-checkbox">
            <input class="gui-control-input" id="cb-assets" type="checkbox" v-model="group.assets" />
            <label class="gui-control-label" for="cb-assets" tooltip=""><b>Assets</b></label>
        </div>

        <div class="gui-separator"></div>

        <div class="gui-checkbox">
            <input class="gui-control-input" id="cb-modules" type="checkbox" v-model="group.modules" />
            <label class="gui-control-label" for="cb-modules" tooltip=""><b>Modules</b></label>
        </div>

        <div class="gui-hs-10"></div>
        <div>Group by:</div>

        <div class="gui-arrow-next"></div>

        <div class="gui-checkbox">
            <input class="gui-control-input" id="cb-chunk" type="checkbox" v-model="group.chunk" />
            <label class="gui-control-label" for="cb-chunk" tooltip="">Chunk</label>
        </div>

        <div class="gui-arrow-next"></div>

        <div class="gui-checkbox">
            <input class="gui-control-input" id="cb-type" type="checkbox" v-model="group.type" />
            <label class="gui-control-label" for="cb-type" tooltip="">Type</label>
        </div>

         <div class="gui-arrow-next"></div>

         <div class="gui-checkbox">
            <input class="gui-control-input" id="cb-folder" type="checkbox" v-model="group.folder" />
            <label class="gui-control-label" for="cb-folder" tooltip="">Folder</label>
        </div>

    </div>
    <div class="gui-filter gui-flex-row">
        <b>Filter:</b>
        <input v-model="keywords.chunk" @focus="$event.target.select()" class="gui-input" name="chunk" placeholder="Chunk" title="Chunk" />
        <input v-model="keywords.type" @focus="$event.target.select()" class="gui-input" name="type" placeholder="Type" title="Type" />
        <input v-model="keywords.name" @focus="$event.target.select()" class="gui-input" name="name" placeholder="Name" title="Chunk" />
        <span v-if="group.modules">Found <b>{{filterModules}}</b> sub modules (Size: {{filterSize}})</span>
    </div>
    <div class="gui-grid gui-flex-auto"></div>
    <div class="gui-footer gui-flex-row">
        <div class="gui-flex-auto">
            <b class="gui-link gui-module-types" @click="showModuleTypes">Module Types</b>
            <b :class="info.warningsClass" @click="showInfo('Warnings', info.warnings, 'orange')">Warnings {{info.warnings.length}}</b>
            <b :class="info.errorsClass" @click="showInfo('Errors', info.errors, 'red')">Errors {{info.errors.length}}</b>
        </div>
        <div class="gui-flex-row">
            <div class="gui-time">Generated {{info.timeH}}</div>
            <div class="gui-hs-10"></div>
            <a href="https://webpack.js.org/" target="_blank">webpack</a>
            <div class="gui-hs-5"></div>
            <div>v{{info.version}}</div>
        </div>
    </div>
</div>
</template>
<script src="./app.js"></script>
<style src="./app.scss"></style>