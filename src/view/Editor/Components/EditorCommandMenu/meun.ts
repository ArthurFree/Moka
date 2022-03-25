/**
 * command menu config
 */

import { Emitter } from '@editorType/event';
import h1Img from '@assets/commandMenu/header.png';

/**
 * 触发标题指令
 * @param level  h[level] - h1-h6
 * @param eventEmitter
 */
const dispatchHeading = (level: number, eventEmitter: Emitter): void => {
    eventEmitter.emit('command', 'heading', { level });
};
// p: http://www.notion.so/images/blocks/text.9fdb530b.png
// todo: http://www.notion.so/images/blocks/to-do.f8d20542.png
// table: http://www.notion.so/images/blocks/simple-table.e31a23bb.png
// list: http://www.notion.so/images/blocks/bulleted-list.0e87e917.png
// page: http://www.notion.so/images/blocks/page.83b0bf31.png
// order-list: http://www.notion.so/images/blocks/numbered-list.0406affe.png
// toggle: http://www.notion.so/images/blocks/toggle.5e462b2a.png
// quote: http://www.notion.so/images/blocks/quote.b048df62.png
// line: http://www.notion.so/images/blocks/divider.210d0faf.png
// link: http://www.notion.so/images/blocks/link.dd415f7c.png
// callout: http://www.notion.so/images/blocks/callout.7b4c39c4.png
const getCommandMenuList = (eventEmitter: Emitter) => {
    return [
        {
            title: 'BASIC BLOCKS',
            list: [
                {
                    img: h1Img,
                    name: 'Heading 1',
                    desc: 'Big section heading',
                    onSelect: () => {
                        dispatchHeading(1, eventEmitter);
                    }
                },
                {
                    img: 'http://www.notion.so/images/blocks/subheader.9aab4769.png',
                    name: 'Heading 2',
                    desc: 'Medium section heading',
                    onSelect: () => {
                        dispatchHeading(2, eventEmitter);
                    }
                },
                {
                    img: 'http://www.notion.so/images/blocks/subsubheader.d0ed0bb3.png',
                    name: 'Heading 3',
                    desc: 'Small section heading',
                    onSelect: () => {
                        dispatchHeading(3, eventEmitter);
                    }
                }
            ]
        },
        {
            title: 'INLINE',
            list: [
                {
                    img: 'http://www.notion.so/images/blocks/text.9fdb530b.png',
                    name: 'Heading 1',
                    desc: 'Big section heading'
                }
            ]
        }
    ];
};

export default getCommandMenuList;
