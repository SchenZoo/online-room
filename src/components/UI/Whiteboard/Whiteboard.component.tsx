import React, { useCallback, useEffect, useState } from 'react';
import SketchField from './components/SketchField';
import { Icon } from 'semantic-ui-react';
import './Whiteboard.styles.scss';
import useCallbackRef from '../../../hooks/useCallbackRef';
import { SketchFieldRef } from './components/SketchField/SketchField.component';
import { useHotkeys } from 'react-hotkeys-hook';
import { ToolName } from './enums/Tools';

type Props = {};

const Whiteboard: React.FC<Props> = () => {
  const [board, boardRef] = useCallbackRef<SketchFieldRef>();
  const [canUndo, setCanUndo] = useState<boolean>();
  const [canRedo, setCanRedo] = useState<boolean>();
  const [activeTool, setActiveTool] = useState<ToolName>('pencil');
  const [value, setValue] = useState<object>();

  useEffect(() => {
    if (!board) return;

    setCanUndo(board.canUndo());
    setCanRedo(board.canRedo());
  }, [board]);

  const undo = useCallback(() => {
    if (board && canUndo) board.undo();
  }, [board, canUndo]);

  const redo = useCallback(() => {
    if (board && canRedo) board.redo();
  }, [board, canRedo]);

  const clear = useCallback(() => {
    if (board) board.clear();
  }, [board]);

  useHotkeys('ctrl+z,command+z', undo, null, [undo]);
  useHotkeys('ctrl+shift+z,command+shift+z', redo, null, [redo]);

  const onSketchChange = useCallback(() => {
    const prevUndo = canUndo;
    const prevRedo = canRedo;

    if (prevUndo !== board.canUndo()) setCanUndo(board.canUndo());
    if (prevRedo !== board.canRedo()) setCanRedo(board.canRedo());

    setValue(board.toJSON());
  }, [canUndo, canRedo, board]);

  return (
    <div className="whiteboard">
      <div className="tools">
        <button
          className={`primary icon${activeTool === 'pencil' ? ' active' : ''}`}
          onClick={() => setActiveTool('pencil')}
        >
          <Icon name="pencil" />
        </button>

        <button
          className={`primary icon${activeTool === 'select' ? ' active' : ''}`}
          onClick={() => setActiveTool('select')}
        >
          <Icon name="location arrow" />
        </button>

        <button
          className="primary icon"
          disabled={!canUndo}
          onClick={board?.undo}
        >
          <Icon name="undo" />
        </button>

        <button
          className="primary icon"
          disabled={!canRedo}
          onClick={board?.redo}
        >
          <Icon name="redo" />
        </button>
        <button
          className="danger icon"
          onClick={() => {
            clear();
            setCanUndo(false);
            setCanRedo(false);
          }}
        >
          <Icon name="trash" />
        </button>
      </div>
      <div className="board">
        <SketchField
          ref={boardRef}
          height="100%"
          lineColor="white"
          lineWidth={3}
          onObjectAdded={(ev) => console.log('object added')}
          onObjectMoving={(ev) => console.log('object removed')}
          onChange={onSketchChange}
          defaultValue={value}
          tool={activeTool}
        />
      </div>
    </div>
  );
};

export default Whiteboard;
