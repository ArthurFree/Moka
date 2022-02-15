标题 Headers
---------------------------

# 标题 1

## 标题 2

### 标题 3


样式 Styling
---------------------------

斜体：*Emphasize* _emphasize_

加粗：**Strong** __strong__

标注：==Marked text.==

删除线：~~Mistaken text.~~

引用：> Quoted text.

下角标：H~2~O is a liquid.

上角标：2^10^ is 1024.


列表 Lists
---------------------------

无序列表
- Item
  * Item
    + Item

有序列表
1. Item 1
2. Item 2
3. Item 3

TODO：
- [ ] Incomplete item
- [x] Complete item


链接 Links
---------------------------

文字链接
A [link](http://example.com).

图片链接
An image: ![Alt](img.jpg)

限制图片尺寸链接
A sized image: ![Alt](img.jpg =60x50)


代码块 Code
---------------------------

Some `inline code`.

```
// A code block
var foo = 'bar';
```

```javascript
// An highlighted block
var foo = 'bar';
```


表格 Tables
---------------------------

Item     | Value
-------- | -----
Computer | $1600
Phone    | $12
Pipe     | $1


| Column 1 | Column 2      |
|:--------:| -------------:|
| centered | right-aligned |


定义列表 Definition lists
---------------------------

Markdown
:  Text-to-HTML conversion tool

Authors
:  John
:  Luke



注解：Footnotes
---------------------------

Some text with a footnote.[^1]

[^1]: The footnote.



缩写：Abbreviations
---------------------------

Markdown converts text to HTML.

*[HTML]: HyperText Markup Language



公式：LaTeX math
---------------------------

The Gamma function satisfying $\Gamma(n) = (n-1)!\quad\forall
n\in\mathbb N$ is via the Euler integral

$$
\Gamma(z) = \int_0^\infty t^{z-1}e^{-t}dt\,.
$$
