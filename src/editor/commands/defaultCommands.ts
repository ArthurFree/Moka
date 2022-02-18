import { deleteSelection, selectAll } from 'prosemirror-commands';
import { undo, redo } from 'prosemirror-history';

import { EditorCommand } from '@editorType/spec';

export function getDefaultCommands(): Record<string, EditorCommand> {
  return {
    deleteSelection: () => deleteSelection,
    selectAll: () => selectAll,
    undo: () => undo,
    redo: () => redo,
  };
}
