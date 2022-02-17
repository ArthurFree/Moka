import isFunction from 'tui-code-snippet/type/isFunction';

import { getHTMLRenderers } from './renderers/toHTMLRenderers';
import { codeSyntaxHighlighting } from './plugins/codeSyntaxHighlighting';
import { createCodeSyntaxHighlightView } from './nodeViews/codeSyntaxHighlightView';

import type { PluginContext, PluginInfo } from '@t/index';
import { PluginOptions } from '@codeType/index';

export function codeSyntaxHighlightPlugin(
  context: PluginContext,
  options?: PluginOptions
): PluginInfo {
  if (options) {
    const { eventEmitter } = context;
    const { highlighter: prism } = options;

    eventEmitter.addEventType('showCodeBlockLanguages');
    eventEmitter.addEventType('selectLanguage');
    eventEmitter.addEventType('finishLanguageEditing');

    const { languages } = prism!;
    const registerdlanguages = Object.keys(languages).filter(
      (language) => !isFunction(languages[language])
    );

    return {
      toHTMLRenderers: getHTMLRenderers(prism!),
      wysiwygPlugins: [() => codeSyntaxHighlighting(context, prism!)],
      wysiwygNodeViews: {
        codeBlock: createCodeSyntaxHighlightView(registerdlanguages),
      },
    };
  }
  return {};
}