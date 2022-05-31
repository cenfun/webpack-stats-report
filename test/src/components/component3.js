
import Component from './component.vue';

//test nested
import flatdep from 'flatdep';
import semver from 'semver';

//test ignore
//seems is for webpack4

//test other
import options from '../../../lib/options.js';

//test module
import EC from 'eight-colors';

/* eslint-disable chain/dependencies */
import json5 from 'json5';

//error modules
//import errorModule from 'error-module';

const component = {
    flatdep,
    semver,
    options,
    EC,
    json5,
    //errorModule,
    Component
};

export default component;
