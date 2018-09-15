import biu from '@lvchengbin/biu';
import Config from  './core/config';
import J from './core/j';
import * as Utils from './core/utils';
import Package from './core/package';
import extend from './core/extend';
import Rule from './core/rule';
import Style from './core/style';
import Script from './core/script';
import Value from './core/value';
import * as UI from './extensions/ui';
import View from './extensions/view/index';
import Model from './extensions/model';
import Validate from './extensions/validate';

Object.assign( J, {
    Config,
    Utils,
    Package,
    extend,
    biu,
    Rule,
    Style,
    Script,
    Value,
    View,
    UI,
    Model,
    Validate
} );
window.J = J;
