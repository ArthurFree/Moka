# CHANGE LOG

### 2022-02-17

* 更换内置编辑器：vditor -> tui.editor, 更换原因：
    * 再使用 vditor 开发的时候，经常遇到一些问题，比如，内容为空的时候，回车换行，会自动跳回第一行，导致编写状态会抖一下
    * 及时预览状态下，代码没有高亮，只有在生成真正的文章之后才会带上代码高亮
    * 代码块的编写逻辑，输入内容，会创建一个输入编写的模块，编写模块下方有个预览模块，编写体验不好
    * markdown 的解析主要采用的是 go 编写，对于后续学习修改有一定成本
    * 编辑器文档不够健全，阅读不舒服
* 为 tui.editor 引入 code-syntax-highlight 插件
* 使用 esbuild-loader 替换 babel-loader / ts-loader, 速度略有提升
* 尝试了使用 thread-loader 优化 esbuild-loader ，构建时间略有增加
* 增加了构建速度检测插件(speed-measure-webpack-plugin)

### 2022-02-16

* 增加: dll webpack config, 抽离了 react 相关依赖

### 2022-02-15

* 增加: CHANGELOG
* 增加: Git Commit 提交格式(doc/Git_Commit_Style.md)
* 增加: 未来需要实现的功能 TODO List(doc/Feature.md)
* 增加: 对 vditor.option.height 增加 % / vw / vh 支持
* 修复: vditor 引入后带来的 ts error
* 更新: 重命名 ./doc => ./docs
* 更新: tsconfig.json 文件
* 更新: 编辑区样式 coding...
