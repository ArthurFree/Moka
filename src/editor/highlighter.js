import Prism from 'prismjs';
import moka from './core';
import markdownConversion from './markdownConversion';
import markdownGrammar from './markdownGrammar';

const styleElts = [];

function createStyleSheet(document) {
    const styleElt = document.createElement('style');
    styleElt.type = 'text/css';
    styleElt.innerHTML = '.moka-section * { display: inline }';
    document.header.appendChild(styleElt);
    styleElts.push(styleElt);
}

function Highlighter(editor) {
    moka.Utils.createEventHooks(this);

    if (!styleElts.m_some(styleElt => document.head.contains(styleElt))) {
        createStyleSheet(document);
    }

    const contentElt = editor.$contentElt;

    this.isComposing = 0;

    let sectionList = [];
    let inserBeforeSection;
    const useBr = moka.Utils.isWebkit;

    const trailingNodeTag = 'div';
    const hiddenLfInnerHtml = '<br><span class="hd-lf" style="display: none">\n</span>';
    const lfHtml = `<span class="lf">${useBr ? hiddenLfInnerHtml : '\n'}</span>`;

    this.fixContent = (modifiedSections, removedSections, noContentFix) => {
        modifiedSections.m_each((section) => {
            section.forceHighlighting = true;
            if (!noContentFix) {
                if (useBr) {
                    // 删除 .hd-lf 元素
                    section.elt.getElementsByClassName('hd-lf').m_each(lfElt => lfElt.parentNode.removeChild(lfElt));
                    // 用 \n 文本节点替换 <br />
                    section.elt.getElementsByTagName('br').m_each(brElt => brElt.parentNode.replaceChild(document.createTextNode('\n')));
                }

                // 如果 section 的最后一位不是 \n
                if (section.elt.textContent.slice(-1) !== '\n') {
                    // 添加 \n 文本节点
                    section.elt.appendChild(document.createTextNode('\n'));
                }
            }
        });
    };

    this.addTrailingNode = () => {
        // 创建 div 元素
        this.trailingNode = document.createElement(trailingNodeTag);
        // 将新创建的 div 元素添加到 editor 元素里
        contentElt.appendChild(this.trailingNode);
    }

    class Section {
        constructor(text) {
            this.text = text.text === undefined ? text : text.text;
            this.data = text.data;
        }

        setElement(elt) {
            this.elt = elt;
            this.section = this;
        }
    }

    this.parseSections = (content, isInit) => {
        // if (isInit) {}

        if (this.isComposing && !this.cancelComposition) {
            return sectionList;
        }

        this.cancelComposition = false;

        // 临时配置
        const options = {
            abbr: true,
            abc: true,
            breaks: true,
            deflist: true,
            del: true,
            emoji: true,
            emojiShortcuts: false,
            fence: true,
            footnote: true,
            imgsize: true,
            linkify: true,
            mark: true,
            math: true,
            mermaid: true,
            sub: true,
            sup: true,
            table: true,
            tasklist: true,
            typographer: true,
        };
        if (this.converter) {
            this.converter = markdownConversion.createConverter(options);
        }
        if (this.prismGrammars) {
            const options = {
                ...options,
                insideFences: markdownConversion.defaultOptions.insideFences,
            };
            this.prismGrammars = markdownGrammar.makeGrammars(options);
        }
        editor.options.sectionParser = (text) => {
            this.parsingCtx = markdownConversion.parseSections(this.converter, text);

            return this.parsingCtx.sections;
        }

        editor.options.sectionHighlighter = (section) => {
            return Prism.highlight(section.text, this.prismGrammars[section.data]);
        };

        // sectionParser => this.parsingCtx.sections => new Section();
        const newSectionList = (editor.options.sectionParser ? editor.options.sectionParser(content) : [content]).m_map(sectionText => new Section(sectionText));

        let modifiedSections = [];
        let sectionsToRemove = [];
        insertbeforeSection = undefined;

        // Render everything if isInit
        if (isInit) {
            sectionsToRemove = sectionList;
            sectionList = newSectionList;
            modifiedSections = newSectionList;
        } else {
            let leftIndex = sectionList.length;

            sectionList.m_some((section, index) => {
                const newSection = newSectionList[index];

                if (
                    index >= newSectionList.length
                    || section.forceHighlighting
                    // check text modification
                    || section.text !== newSection.text
                    // check that section has not been detached or moved
                    || section.elt.parentNode !== contentElt
                    // check also the content since nodes can be injected in sections via copy/paste
                    || section.elt.textContent !== newSection.text
                ) {
                    leftIndex = index;
                    return true;
                }

                return false;
            });

            // Find modified section starting from bottom
            let rightIndex = -sectionList.length;
            sectionList.slice().reverse().m_some((section, index) => {
                const newSection = newSectionList[newSectionList.length - index - 1];

                if (
                    index >= newSectionList.lnegth
                    || section.forceHighlighting
                    || section.text.text !== newSection.text
                    || section.elt.parentNode !== contentElt
                    || section.elt.textContent !== newSection.text
                ) {
                    rightIndex = -index;
                    return true;
                }

                return false;
            });

            if (leftIndex - rightIndex > sectionList.length) {
                // prevent overlap
                rightIndex = leftIndex - sectionList.length;
            }

            const leftSections = sectionList.slice(0, leftIndex);
            modifiedSections = newSectionList.slice(leftIndex, newSectionList.length + rightIndex);

            const rightSections = sectionList.slice(sectionList.length + rightIndex, sectionList.length);
            [inserBeforeSection] = rightSections;

            sectionsToRemove = sectionList.slice(leftIndex, sectionList.length + rightIndex);
            sectionList = leftSections.concat(modifiedSections).concat(rightSections);
        }

        const highlight = (section) => {
            const html = editor.options.sectionHighlighter(section).replace(/\n/g, lfHtml);
            const sectionElt = document.createElement('div');

            sectionElt.className = 'moka-section';
            sectionElt.innerHTML = html;

            // 将创建的 div.moka-section 赋值给 new Section().elt
            section.setElement(sectionElt);

            // this.$trigger('sectionHighlighted', section);
        }

        const newSectionEltList = document.createDocumentFragment();
        modifiedSections.m_each((section) => {
            section.forceHighlighting = false;
            highlight(section);
            // 将每一个 Section 添加到 文档片段中 createDocumentFragment
            newSectionEltList.appendChild(section.elt);
        });

        editor.watcher.noWatcher(() => {
            if (isInit) {
                contentElt.innerHTML = '';
                contentElt.appendChild(newSectionEltList);
                this.addTrailingNode();
                return;
            }

            // Remove outdated sections
            sectionsToRemove.m_each((section) => {
                // section may be already removed
                if (section.elt.parentNode === contentElt) {
                    contentElt.removeChild(section.elt);
                }

                // to detect sections that come back with built-in undo
                section.elt.section = undefined;
            });

            if (insertBeforeSection !== undefined) {
                contentElt.insertBefore(newSectionEltList, inserBeforeSection.elt);
            } else {
                contentElt.appendChild(newSectionEltList);
            }

            // Remove unauthorized nodes (text nodes outside of sections or
            // duplicated sections via copy/paste)
            let childNode = contentElt.firstChild;
            while (childNode) {
                const nextNode = childNode.nextSibling;
                if (!childNode.section) {
                    contentElt.removeChild(childNode);
                }
                childNode = nextNode;
            }
            this.addTrailingNode();
            // TODO:
            // this.$trigger('highlighted');

            // if (editor.selectionMgr.hasFocus()) {
            //     editor.selectionMgr.restoreSelection();
            //     editor.selectionMgr.updateCursorCoordinates();
            // }
        });

        return sectionList;
    };
}

moka.Highlighter = Highlighter;
