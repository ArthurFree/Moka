import { MdNodeType } from '@toastmarkType/node';
import { Process, BlockHandler } from '../blockHandlers';

export const table: BlockHandler = {
  continue() {
    return Process.Go;
  },
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  finalize() {},
  canContain(t: MdNodeType) {
    return t === 'tableHead' || t === 'tableBody';
  },
  acceptsLines: false,
};

export const tableBody: BlockHandler = {
  continue() {
    return Process.Go;
  },
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  finalize() {},
  canContain(t: MdNodeType) {
    return t === 'tableRow';
  },
  acceptsLines: false,
};

export const tableHead: BlockHandler = {
  continue() {
    return Process.Stop;
  },
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  finalize() {},
  canContain(t: MdNodeType) {
    return t === 'tableRow' || t === 'tableDelimRow';
  },
  acceptsLines: false,
};

export const tableDelimRow: BlockHandler = {
  continue() {
    return Process.Stop;
  },
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  finalize() {},
  canContain(t: MdNodeType) {
    return t === 'tableDelimCell';
  },
  acceptsLines: false,
};

export const tableDelimCell: BlockHandler = {
  continue() {
    return Process.Stop;
  },
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  finalize() {},
  canContain() {
    return false;
  },
  acceptsLines: false,
};

export const tableRow: BlockHandler = {
  continue() {
    return Process.Stop;
  },
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  finalize() {},
  canContain(t: MdNodeType) {
    return t === 'tableCell';
  },
  acceptsLines: false,
};

export const tableCell: BlockHandler = {
  continue() {
    return Process.Stop;
  },
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  finalize() {},
  canContain() {
    return false;
  },
  acceptsLines: false,
};
