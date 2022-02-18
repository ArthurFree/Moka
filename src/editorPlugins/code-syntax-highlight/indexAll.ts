import Prism from 'prismjs';
import type { PluginContext, PluginInfo } from '@editorType/index';
import { codeSyntaxHighlightPlugin } from './plugin';
import { PrismJs } from '@pluginHighlightType/index';

import './prismjs-langs';
import './css/plugin.css';

// Prevent to highlight all code elements automatically.
// @link https://prismjs.com/docs/Prism.html#.manual
// eslint-disable-next-line no-undefined
if (typeof window !== undefined) {
    // before:
    // window.Prism = window.Prism || {};
    // after:
    // window.Prism = window.Prism;
    // window.Prism.manual = true;
}

export default function plugin(context: PluginContext): PluginInfo {
    return codeSyntaxHighlightPlugin(context, { highlighter: Prism as PrismJs });
}
