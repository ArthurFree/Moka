import { ResolvedPos } from 'prosemirror-model';
import { EditorView } from 'prosemirror-view';
import { PluginKey } from 'prosemirror-state';

import {
    findCell,
    findCellElement,
    findTableElement,
    findLastCellElement,
    findFirstCellElement
} from '@/wysiwyg/helper/table';

import CellSelection from './cellSelection';

type mouseDownPos = {
    x: number;
    y: number;
};

interface EventHandlers {
    mousedown: (ev: Event) => void;
    mousemove: (ev: Event) => void;
    mouseup: () => void;
}

export const pluginKey = new PluginKey('cellSelection');

const MOUSE_RIGHT_BUTTON = 2;

export default class TableSelection {
    private view: EditorView;

    private handlers: EventHandlers;

    private startCellPos: ResolvedPos | null;

    private startCompatibleCellPos: ResolvedPos | null;

    private mouseDownPos: mouseDownPos | null;

    constructor(view: EditorView) {
        this.view = view;

        this.handlers = {
            mousedown: this.handleMousedown.bind(this),
            mousemove: this.handleMousemove.bind(this),
            mouseup: this.handleMouseup.bind(this)
        };

        this.startCellPos = null;
        this.mouseDownPos = null;
        this.startCompatibleCellPos = null;

        this.init();
    }

    init() {
        this.view.dom.addEventListener('mousedown', this.handlers.mousedown);
    }

    getStartCellPos = (ev: Event) => {
        const foundCell = findCellElement(ev.target as HTMLElement, this.view.dom);

        if ((ev as MouseEvent).button === MOUSE_RIGHT_BUTTON) {
            ev.preventDefault();
            return;
        }

        if (foundCell) {
            const startCellPos = this.getCellPos(ev as MouseEvent);

            if (startCellPos) {
                this.startCellPos = startCellPos;
            }
        }
    };

    compatiblePos = (ev: MouseEvent) => {
        const foundCell = findCellElement(ev.target as HTMLElement, this.view.dom);

        console.log('--- this.startCompatibleCellPos ---', this.startCompatibleCellPos);

        if (!this.startCompatibleCellPos && foundCell) {
            const tableEl = findTableElement(ev.target as HTMLElement, this.view.dom);
            const tableElRect = tableEl.getBoundingClientRect();
            const firstCell = foundCell?.parentNode?.firstChild as HTMLElement;
            const firstCellRect = firstCell.getBoundingClientRect();

            if (this.mouseDownPos.y > tableElRect.bottom || this.mouseDownPos.y < tableElRect.top) {
                this.startCompatibleCellPos = this.getCellPos({
                    clientX: firstCellRect.right,
                    clientY: firstCellRect.bottom
                });
                this.startCellPos = this.startCompatibleCellPos;
            }
        }

        if (this.startCompatibleCellPos && foundCell) {
            const lastCell = foundCell?.parentNode?.lastChild as HTMLElement;
            const lastCellRect = lastCell.getBoundingClientRect();

            return this.getCellPos({
                clientX: lastCellRect.right,
                clientY: lastCellRect.bottom
            });
        }

        return null;
    };

    handleMousedown(ev: Event) {
        this.mouseDownPos = {
            x: (ev as MouseEvent).clientX,
            y: (ev as MouseEvent).clientY
        };
        this.getStartCellPos(ev);
        this.bindEvent();
    }

    handleMousemove(ev: Event) {
        const prevEndCellOffset = pluginKey.getState(this.view.state);
        const { startCellPos } = this;

        let endCellPos = this.getCellPos(ev as MouseEvent);
        let prevEndCellPos;

        endCellPos = this.compatiblePos(ev as MouseEvent) || endCellPos;

        if (prevEndCellOffset) {
            prevEndCellPos = this.view.state.doc.resolve(prevEndCellOffset);
        } else if (startCellPos !== endCellPos) {
            prevEndCellPos = startCellPos;
        }

        if (prevEndCellPos && startCellPos && endCellPos) {
            ev.preventDefault();
            console.log('---- handleMousemove preventDefault ---');
            this.setCellSelection(startCellPos, endCellPos);
        }
    }

    handleMouseup() {
        this.startCellPos = null;
        this.startCompatibleCellPos = null;

        this.unbindEvent();

        if (pluginKey.getState(this.view.state) !== null) {
            this.view.dispatch(this.view.state.tr.setMeta(pluginKey, -1));
        }
    }

    bindEvent() {
        const { dom } = this.view;

        dom.addEventListener('mousemove', this.handlers.mousemove);
        dom.addEventListener('mouseup', this.handlers.mouseup);
    }

    unbindEvent() {
        const { dom } = this.view;

        dom.removeEventListener('mousemove', this.handlers.mousemove);
        dom.removeEventListener('mouseup', this.handlers.mouseup);
    }

    getCellPos({ clientX, clientY }) {
        const mousePos = this.view.posAtCoords({ left: clientX, top: clientY });

        if (mousePos) {
            const { doc } = this.view.state;
            const currentPos = doc.resolve(mousePos.pos);
            const foundCell = findCell(currentPos);

            if (foundCell) {
                const cellOffset = currentPos.before(foundCell.depth);

                return doc.resolve(cellOffset);
            }
        }

        return null;
    }

    setCellSelection(startCellPos: ResolvedPos, endCellPos: ResolvedPos) {
        const { selection, tr } = this.view.state;
        const starting = pluginKey.getState(this.view.state) === null;
        const cellSelection = new CellSelection(startCellPos, endCellPos);

        if (starting || !selection.eq(cellSelection)) {
            const newTr = tr.setSelection(cellSelection);

            if (starting) {
                newTr.setMeta(pluginKey, endCellPos.pos);
            }

            this.view.dispatch!(newTr);
        }
    }

    destroy() {
        this.view.dom.removeEventListener('mousedown', this.handlers.mousedown);
    }
}
