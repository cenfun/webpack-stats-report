<template>
<div class="gui-main">
    <div class="gui-header gui-flex-row">
        <div class="gui-title gui-flex-auto">{{ info.title }}</div>
        <div class="gui-logo"></div>
    </div>
    <div class="gui-filter gui-flex-row">
         <label>
            <input type="checkbox" v-model="treeMode" />
            Tree Mode
        </label>
        <div class="gui-separator"></div>
        <label>
            <input type="checkbox" v-model="groups.assets" class="gui-group gui-assets" checked />
            Assets
        </label>
        <label>
            <input type="checkbox" v-model="groups.chunks" class="gui-group gui-chunks" checked />
            Chunks
        </label>
        <label>
            <input type="checkbox" v-model="groups.modules" class="gui-group gui-modules" checked />
            Modules
        </label>

        <label v-show="treeMode">
            <select v-model="modulesGroupBy">
                <option value="">No Group</option>
                <option value="type">Group By Type</option>
                <option value="chunk">Group By Chunk</option>
            </select>
        </label>

    </div>
    <div class="gui-filter gui-flex-row">
        Filter:
        <input v-model="keywords.chunk" @focus="$event.target.select()" class="gui-keywords" name="chunk" placeholder="Chunk" title="Chunk" />
        <input v-model="keywords.type" @focus="$event.target.select()" class="gui-keywords" name="type" placeholder="Type" title="Type" />
        <input v-model="keywords.name" @focus="$event.target.select()" class="gui-keywords" name="name" placeholder="Name" title="Chunk" />
        <span class="gui-filter-info"></span>
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