import { Plugin } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';
import throttle from 'tui-code-snippet/tricks/throttle';

type ElementWithEvent = HTMLElement & { hasScrollEvent?: boolean | null };
/* interface ElementWithEvent extends HTMLElement {
    hasScrollEvent?: boolean | null;
} */

function handleTableScroll(element) {
    const shadowRight = !!(
        element &&
        element.scrollWidth > element.clientWidth &&
        element.scrollLeft + element.clientWidth !== element.scrollWidth
    );
    const shadowLeft = !!(
        element &&
        element.scrollWidth > element.clientWidth &&
        element.scrollLeft !== 0
    );
    const shadowElem = element.querySelectorAll('.scrollable-shadow');

    if (shadowElem && shadowElem.length > 0) {
        if (shadowRight) {
            shadowElem[0].className = 'scrollable-shadow right active';
        } else {
            shadowElem[0].className = 'scrollable-shadow right';
        }

        if (shadowLeft) {
            shadowElem[1].className = 'scrollable-shadow left active';
        } else {
            shadowElem[1].className = 'scrollable-shadow left';
        }
    }
}

export function tablePlugin() {
    return new Plugin({
        props: {
            decorations: (state) => {
                const { doc } = state;
                const decorations: Decoration[] = [];
                let index = 0;

                doc.descendants((node, pos) => {
                    if (node.type.name !== 'table') {
                        return;
                    }

                    const elements = document.getElementsByClassName('rme-table');
                    const table = elements[index];
                    const shadowEl = table && table.getElementsByClassName('scrollable-shadow');
                    if (!table /*  || shadowEl.length */) {
                        return;
                    }

                    const element: ElementWithEvent = table.parentElement;

                    if (element && !(element as ElementWithEvent).hasScrollEvent) {
                        element.addEventListener(
                            'scroll',
                            throttle(() => handleTableScroll(element), 60),
                            false
                        );
                        element.hasScrollEvent = true;
                    }
                    const shadowRight = !!(element && element.scrollWidth > element.clientWidth);

                    if (shadowRight) {
                        decorations.push(
                            Decoration.widget(pos + 1, () => {
                                const shadow = document.createElement('div');
                                shadow.className = 'scrollable-shadow left';
                                return shadow;
                            })
                        );

                        decorations.push(
                            Decoration.widget(pos + 1, () => {
                                const shadow = document.createElement('div');
                                shadow.className = 'scrollable-shadow right active';
                                return shadow;
                            })
                        );
                    }

                    index++;
                });

                return DecorationSet.create(doc, decorations);
            }
        }
    });
}
