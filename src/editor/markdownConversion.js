import MarkdownIt from 'markdown-it';
import Prism from 'prismjs';
import extension from './extension';
import utils from './utils';

function createFlagMap(arr) {
    return arr.reduce((map, type) => ({ ...map, [type]: true }), {});
}

// => { paragraph_open: true, // ... }
const startSectionBlockTypeMap = createFlagMap([
    'paragraph_open',
    'blockquote_open',
    'heading_open',
    'code',
    'fence',
    'table_open',
    'html_block',
    'bullet_list_open',
    'ordered_list_open',
    'hr',
    'dl_open',
]);

// Create aliases for syntax highlighting
const languageAliases = ({
    js: 'javascript',
    json: 'javascript',
    html: 'markup',
    svg: 'markup',
    xml: 'markup',
    py: 'python',
    rb: 'ruby',
    yml: 'yaml',
    ps1: 'powershell',
    psm1: 'powershell',
});
Object.entries(languageAliases).forEach(([alias, language]) => {
    Prism.languages[alias] = Prism.languages[language];
});

// Add programming language parsing capability to markdown fences
const insideFences = {};
Object.entries(Prism.languages).forEach(([name, language]) => {
  if (Prism.util.type(language) === 'Object') {
    insideFences[`language-${name}`] = {
      pattern: new RegExp(`(\`\`\`|~~~)${name}\\W[\\s\\S]*`),
      inside: {
        'cl cl-pre': /(```|~~~).*/,
        rest: language,
      },
    };
  }
});

export default {
    defaultOptions: null,
    defaultConverter: null,
    defaultPrismGrammars: null,

    init() {
        const defaultProperties = { extensions: utils.computedPresets.default };

        // Default options for the markdown converter and the grammar
        this.defaultOptions = {
          ...extension.getOptions(defaultProperties),
          insideFences,
        };

        this.defaultConverter = this.createConverter(this.defaultOptions);
        // this.defaultPrismGrammars = markdownGrammarSvc.makeGrammars(this.defaultOptions);
    },

    createConverter(options) {
        const converter = new MarkdownIt('zero');
        converter.core.ruler.enable([], true);
        converter.block.ruler.enable([], true);
        converter.inline.ruler.enable([], true);
        extension.initConverter(converter, options);

        Object.keys(startSectionBlockTypeMap).forEach((type) => {
            const rule = converter.renderer.rules[type] || converter.renderer.renderToken;
            converter.renderer.rules[type] = (tokens, idx, opts, env, self) => {
              if (tokens[idx].sectionDelimiter) {
                // Add section delimiter
                return htmlSectionMarker + rule.call(converter.renderer, tokens, idx, opts, env, self);
              }
              return rule.call(converter.renderer, tokens, idx, opts, env, self);
            };
        });

        return converter;
    },

    parseSections(converter, text) {
        const markdownState = new converter.core.State(text, converter, {});
        const markdownCoreRules = converter.core.ruler.getRules('');

        markdownCoreRules[0](markdownState);
        markdownCoreRules[1](markdownState);

        const lines = text.split('\n');

        if (!lines[lines.length - 1]) {
            // 移除最后一位的 \n
            lines.pop();
        }

        const parsingCtx = {
            text,
            sections: [],
            converter,
            markdownState,
            markdownCoreRules,
        };

        let data = 'main';
        let i = 0;

        function addSection(maxLine) {
            const section = {
                text: '',
                data,
            };

            for (; i < maxLine; i += 1) {
                section.text += `${lines[i]}\n`;
            }

            if (section) {
                parsingCtx.sections.push(section);
            }
        }

        markdownState.tokes.forEach((token, index) => {
            if (token.level === 0 && startSectionBlockTypeMap[token.type] === true) {
                if (index > 0) {
                    token.sectionDelimiter = true;
                    addSection(token.map[0]);
                }

                if (listBlockTypeMap[token.type] === true) {
                    data = 'list';
				} else if (blockquoteBlockTypeMap[token.type] === true) {
					data = 'blockquote';
				} else if (tableBlockTypeMap[token.type] === true) {
					data = 'table';
				} else if (deflistBlockTypeMap[token.type] === true) {
					data = 'deflist';
				} else {
					data = 'main';
				}
            }
        });

		addSection(lines.length);

		return parsingCtx;
    }
}
