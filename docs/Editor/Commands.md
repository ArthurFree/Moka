# Commands

## basic

| command name                 | desc         |
| ---------------------------- | ------------ |
| hideToolbar                  | 隐藏 toolbar |
| afterPreviewRender           |              |
| updatePreview                |              |
| changeMode                   |              |
| needChangeMode               |              |
| command                      |              |
| changePreviewStyle           |              |
| changePreviewTabPreview      |              |
| changePreviewTabWrite        |              |
| scroll                       |              |
| contextmenu                  |              |
| show                         |              |
| hide                         |              |
| changeLanguage               |              |
| changeToolbarState           |              |
| toggleScrollSync             |              |
| mixinTableOffsetMapPrototype |              |
| setFocusedNode               |              |
| removePopupWidget            |              |
| query                        |              |

## provide event for user

| command name                   | desc                           | parmas                           |
| ------------------------------ | ------------------------------ | -------------------------------- |
| openPopup                      |                                |                                  |
| closePopup                     |                                |                                  |
| addImageBlobHook               | 上传图片后转换的 Blob 格式文本 | imageFile; hookCallback; TYPE_UI |
| beforePreviewRender            |                                |                                  |
| beforeConvertWysiwygToMarkdown |                                |                                  |
| load                           |                                |                                  |
| loadUI                         |                                |                                  |
| change                         |                                |                                  |
| caretChange                    |                                |                                  |
| destroy                        |                                |                                  |
| focus                          |                                |                                  |
| blur                           |                                |                                  |
| keydown                        |                                |                                  |
| keyup                          |                                |                                  |

## command

command 的二级指令

| command name     | desc                         | payloads                              |
| ---------------- | ---------------------------- | ------------------------------------- |
| heading          | 设置标题 Level               | level:1-6                             |
| addLilnk         | 设置链接                     | linkUrl: 链接地址;linkText: 链接文本  |
| addImage         | 设置图片                     | imageUrl: 图片地址; altText: alt 信息 |
| addTable         | 设置表格                     | rowCount: 行数; columnCount: 列数     |
| colors           | 设置文本颜色                 | selectedColor: 文本颜色               |
| bold             | 设置文本加粗                 |                                       |
| italic           | 设置文本斜体                 |                                       |
| strike           | 设置文本删除线               |                                       |
| hr               | 设置分割线                   |                                       |
| blockQuote       | 设置 Quote                   |                                       |
| bulletList       | 设置无序列表                 |                                       |
| orderedList      | 设置有序列表                 |                                       |
| taskList         | 设置 TODO List               |                                       |
| code             | 设置文本 mark                |                                       |
| codeBlock        | 设置代码块                   |                                       |
| indent           | 设置文本缩进                 |                                       |
| outdent          | 设置文本减少缩进             |                                       |
| toggleScrollSync | 设置 md 模式下，是否同步滚动 | active: 是否同步                      |
|                  |                              |                                       |
|                  |                              |                                       |
