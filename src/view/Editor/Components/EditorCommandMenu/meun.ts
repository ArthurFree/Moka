/**
 * command menu config
 */

import { Emitter } from '@editorType/event';

/**
 * 触发标题指令
 * @param level  h[level] - h1-h6
 * @param eventEmitter
 */
const dispatchHeading = (level: number, eventEmitter: Emitter): void => {
    eventEmitter.emit('command', 'heading', { level });
};

const getCommandMenuList = (eventEmitter: Emitter) => {
    return [
        {
            title: 'BASIC BLOCKS',
            list: [
                {
                    img: 'http://www.notion.so/images/blocks/text.9fdb530b.png',
                    name: 'Heading 1',
                    desc: 'Big section heading',
                    onSelect: () => {
                        dispatchHeading(1, eventEmitter);
                    }
                },
                {
                    img: 'http://www.notion.so/images/blocks/text.9fdb530b.png',
                    name: 'Heading 2',
                    desc: 'Medium section heading',
                    onSelect: () => {
                        dispatchHeading(2, eventEmitter);
                    }
                },
                {
                    img: 'http://www.notion.so/images/blocks/text.9fdb530b.png',
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
