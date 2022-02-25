# Editor API

**Options:**

| 属性                   | 类型         | 说明                                                                                                           |
| ---------------------- | ------------ | -------------------------------------------------------------------------------------------------------------- |
| el                     | HTML Element | 编辑器元素                                                                                                     |
| height / minHeight     | string       | 编辑器样式高度，支持 % / px / auto                                                                             |
| initalValue            | string       | 编辑器初始值                                                                                                   |
| previewStyle           | srting       | 编辑器预览样式 tab / vertical                                                                                  |
| initialEditTyle        | string       | 初始化编辑器模式 markdown / wysiwyg                                                                            |
| events                 | Object       | 参见 events                                                                                                    |
| hooks                  | Obejct       | 参见 hooks                                                                                                     |
| language               | string       | i18n                                                                                                           |
| useCommandShortCut     | boolean      | 是否使用键盘快捷键                                                                                             |
| usageStatistics        | boolean      | 是否发送域名到 google analytics                                                                                |
| toolbarItems           | Array        | toolbar items                                                                                                  |
| hideModeSwitch         | boolean      | 隐藏模式切换 tab bar                                                                                           |
| plugins                | Array        | 插件                                                                                                           |
| extendedAutoLinks      | Object       | Using extended Autolinks specified in GFM spec                                                                 |
| placeholder            | string       | placeholder text                                                                                               |
| linkAttrbutes          | Object       | 设置链接属性，rel / target / type                                                                              |
| customHTMLRenderer     | Object       | Object containing custom renderer functions correspond to change markdown node to preview HTML or wysiwyg node |
| customMarkdownRenderer | Object       | Object containing custom renderer functions correspond to change wysiwyg node to markdown text                 |
| referenceDefinition    | boolean      | whether use the specification of link reference definition                                                     |
| customHTMLSanitizer    | Function     | custom HTML sanitizer                                                                                          |
| previewHighlight       | boolean      | 是否高亮预览区域                                                                                               |
| frontMatter            | boolean      | whether use the front matter                                                                                   |
| widgetRules            | Array        | The rules for replacing the text with widget node                                                              |
| theme                  | string       | 设置编辑器主题                                                                                                 |
| autofocus              | boolean      | 是否自动对焦编辑器                                                                                             |

**events:**

| 属性                           | 类型     | 说明                                                                       |
| ------------------------------ | -------- | -------------------------------------------------------------------------- |
| load                           | Function | 编辑器完整加载后触发                                                       |
| change                         | Function | 编辑器内容改变时触发                                                       |
| caretChange                    | Function | 光标位置改变格式时触发                                                     |
| focus                          | Function | 获得焦点时触发                                                             |
| blur                           | Function | 失去焦点时触发                                                             |
| keydown                        | Function | 按下按键触发                                                               |
| keyup                          | Function | 弹起按键触发                                                               |
| beforePreviewRender            | Function | It would be emitted before rendering the markdown preview with html string |
| beofreConvertWyslwygToMarkdown | Function | 所见即所得模式转换到 markdown 模式时触发                                   |

**hooks:**

| 属性             | 类型             | 说明           |
| ---------------- | ---------------- | -------------- |
| addImageBlobHook | addImageBlobHook | 图片上传时触发 |

**static function**

| 函数名      | 函数参数                                     | 函数说明       |
| ----------- | -------------------------------------------- | -------------- |
| setLanguage | <ol><li>code 语言标识</li><li>data</li></ol> | 设置 i18n 语言 |

**instance function**
| 函数名 | 函数参数 | 函数说明 |
| --- | ---- | ---- |
| addCommand | | |
| addHook | | |
| addWidget | | |
| blur | | |
| changeMode | | |
| changePreviewStyle | | |
| deleteSelection | | |
| destroy | | |
| exec | | |
| focus | | |
| getCurrentPreviewStyle | | |
| getEditorElements | | |
| getHeight | | |
| getHtml | | |
| getMarkdown | | |
| getMinHeight | | |
| getRangeInfoOfNode | | |
| getScrollTop | | |
| getSelectedText | | |
| getSelection | | |
| hide | | |
| isMarkdownMode | | |
| isViewer | | |
| isWysiwygMode | | |
| moveCursorToEnd | | |
| moveCursorToStart | | |
| off | | |
| on | | |
| removeHook | | |
| replaceSelection | | |
| replaceWithWidget | | |
| reset | | |
| setHeight | | |
| setHTML | | |
| setMarkdown | | |
| setMinHeight | | |
| setPlaceholder | | |
| setScrollTop | | |
| setSelection | | |
| show | | |
