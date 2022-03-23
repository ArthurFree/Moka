import { Mapable } from './map';

export interface Handler {
  (...args: any[]): any;
  namespace?: string;
}

export interface Emitter {
  listen(type: string, handler: Handler): void;
  emit(type: string, ...args: any[]): any[];
  emitReduce(type: string, source: any, ...args: any[]): any;
  addEventType(type: string): void;
  removeEventHandler(type: string, handler?: Handler): void;
  getEvents(): Mapable<string, Handler[] | undefined>;
  // eslint-disable-next-line @typescript-eslint/ban-types
  holdEventInvoke(fn: Function): void;
}

export interface EmitterConstructor {
  new (): Emitter;
}

export type EventTypes =
  | 'hideToolbar'
  | 'afterPreviewRender'
  | 'updatePreview'
  | 'changeMode'
  | 'needChangeMode'
  | 'command'
  | 'changePreviewStyle'
  | 'changePreviewTabPreview'
  | 'changePreviewTabWrite'
  | 'scroll'
  | 'contextmenu'
  | 'show'
  | 'hide'
  | 'changeLanguage'
  | 'changeToolbarState'
  | 'toggleScrollSync'
  | 'mixinTableOffsetMapPrototype'
  | 'setFocusedNode'
  | 'removePopupWidget'
  | 'query'
  // provide event for user
  // 打开 Command 菜单
  | 'openCommandMenu'
  // 关闭 Command 菜单
  | 'closeCommandMenu'
  // 打开 toolbar 弹窗
  | 'openPopup'
  // 关闭 toolbar 弹窗
  | 'closePopup'
  | 'addImageBlobHook'
  | 'beforePreviewRender'
  | 'beforeConvertWysiwygToMarkdown'
  | 'load'
  | 'loadUI'
  | 'change'
  | 'caretChange'
  | 'destroy'
  | 'focus'
  | 'blur'
  | 'keydown'
  | 'keyup';
