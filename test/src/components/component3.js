import Component from './component.vue';

//test nested
//depends 7.3.8
import flatdep from 'flatdep';
//hardcode 6.3.0
import semver from 'semver';

//test ignore
// "browser": {
//     "fs": false,
//     "os": false
// },
import 'fs';
import 'os';

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
