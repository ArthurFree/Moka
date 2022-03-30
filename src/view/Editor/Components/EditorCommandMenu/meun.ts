/**
 * command menu config
 */

import { Emitter } from '@editorType/event';
import h1Img from '@assets/commandMenu/h1.png';
import h2Img from '@assets/commandMenu/h2.png';
import h3Img from '@assets/commandMenu/h3.png';
import quoteImg from '@assets/commandMenu/quote.png';
import todoImg from '@assets/commandMenu/todo.png';
import bulletListImg from '@assets/commandMenu/bulleted-list.png';
import orderedListImg from '@assets/commandMenu/numbered-list.png';
import dividerImg from '@assets/commandMenu/divider.png';
import tableImg from '@assets/commandMenu/simple-table.png';

// 原图片地址
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

/**
 * 触发标题指令
 * @param level  h[level] - h1-h6
 * @param eventEmitter
 */
const dispatchHeading = (level: number, eventEmitter: Emitter): void => {
    eventEmitter.emit('command', 'heading', { level });
};

const dispatchQuote = (eventEmitter: Emitter): void => {
    eventEmitter.emit('command', 'blockQuote');
};

const dispatchTodo = (eventEmitter: Emitter): void => {
    eventEmitter.emit('command', 'taskList');
};

const dispatchBulletList = (eventEmitter: Emitter): void => {
    eventEmitter.emit('command', 'bulletList');
};

const dispatchOrderedList = (eventEmitter: Emitter): void => {
    eventEmitter.emit('command', 'orderedList');
};

const dispatchDivider = (eventEmitter: Emitter): void => {
    eventEmitter.emit('command', 'hr');
};

const dispatchTable = (rowCount, columnCount, eventEmitter: Emitter): void => {
    eventEmitter.emit('command', 'addTable', {
        rowCount,
        columnCount
    });
};

const getCommandMenuList = (eventEmitter: Emitter) => {
    return [
        {
            title: 'BASIC BLOCKS',
            list: [
                {
                    img: h1Img,
                    name: 'Heading 1',
                    desc: 'Big section heading.',
                    onSelect: () => {
                        dispatchHeading(1, eventEmitter);
                    }
                },
                {
                    img: h2Img,
                    name: 'Heading 2',
                    desc: 'Medium section heading.',
                    onSelect: () => {
                        dispatchHeading(2, eventEmitter);
                    }
                },
                {
                    img: h3Img,
                    name: 'Heading 3',
                    desc: 'Small section heading.',
                    onSelect: () => {
                        dispatchHeading(3, eventEmitter);
                    }
                },
                {
                    img: todoImg,
                    name: 'To-do list',
                    desc: 'Track tasks with a to-do list.',
                    onSelect: () => {
                        dispatchTodo(eventEmitter);
                    }
                },
                {
                    img: bulletListImg,
                    name: 'Bulleted list',
                    desc: 'Create a simple bulleted list.',
                    onSelect: () => {
                        dispatchBulletList(eventEmitter);
                    }
                },
                {
                    img: orderedListImg,
                    name: 'Numbered list',
                    desc: 'Create a list with numbering.',
                    onSelect: () => {
                        dispatchOrderedList(eventEmitter);
                    }
                },
                {
                    img: quoteImg,
                    name: 'Quote',
                    desc: 'Capture a quote.',
                    onSelect: () => {
                        dispatchQuote(eventEmitter);
                    }
                },
                {
                    img: dividerImg,
                    name: 'Divider',
                    desc: 'Visually divide blocks.',
                    onSelect: () => {
                        dispatchDivider(eventEmitter);
                    }
                },
                {
                    img: tableImg,
                    name: 'Table',
                    desc: 'Add a simple table to this page.',
                    onSelect: () => {
                        dispatchTable(3, 3, eventEmitter);
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
