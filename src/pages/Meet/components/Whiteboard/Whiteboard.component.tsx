import React, { useCallback, useContext, useEffect, useState } from 'react';
import SketchField from './components/SketchField';
import { Icon, Loader } from 'semantic-ui-react';
import './Whiteboard.styles.scss';
import useCallbackRef from '../../../../hooks/useCallbackRef';
import { SketchFieldRef } from './components/SketchField/SketchField.component';
import { useHotkeys } from 'react-hotkeys-hook';
import { ToolName } from './enums/Tools';
import api from '../../../../api';
import { ClassRoomContext } from '../../../../providers/context';
import roomSocketService from '../../../../services/socket/roomSocketService';
import SocketEventNames from '../../../../enums/SocketEventNames';
import { User } from '../../../../models/user';
import CredentialsService from '../../../../services/CredentialsService';

export type WhiteboardState = {
  version: string;
  background: string;
  objects: Array<object>;
};

type Props = {};

const Whiteboard: React.FC<Props> = () => {
  const { roomId } = useContext(ClassRoomContext);
  const [board, boardRef] = useCallbackRef<SketchFieldRef>();
  const [canUndo, setCanUndo] = useState<boolean>();
  const [canRedo, setCanRedo] = useState<boolean>();
  const [activeTool, setActiveTool] = useState<ToolName>('pencil');
  const [value, setValue] = useState<WhiteboardState>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const updateValue = (data: { whiteboard: WhiteboardState; user: User }) => {
      const { user, whiteboard } = data;
      if (user._id !== CredentialsService.userid) {
        setValue(whiteboard);
      }
    };

    roomSocketService.addListener(
      SocketEventNames.WHITEBOARD_CHANGED,
      updateValue,
    );
    return () => {
      roomSocketService.removeListener(
        SocketEventNames.WHITEBOARD_CHANGED,
        updateValue,
      );
    };
  }, []);

  useEffect(() => {
    setLoading(true);
    const initBoard = async () => {
      try {
        const initValue = await api.whiteboard.getWhiteboard(roomId);
        setValue(initValue);
      } catch (er) {
        console.log('Whiteboard not found. New one is created.');
      } finally {
        setLoading(false);
      }
    };
    initBoard();
  }, [roomId]);

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

  const emitWhiteboardChanges = useCallback(
    (patch: WhiteboardState) => {
      api.whiteboard.patchWhiteboard(roomId, patch);
    },
    [roomId],
  );

  const onSketchChange = useCallback(() => {
    const prevUndo = canUndo;
    const prevRedo = canRedo;

    if (prevUndo !== board.canUndo()) setCanUndo(board.canUndo());
    if (prevRedo !== board.canRedo()) setCanRedo(board.canRedo());
    emitWhiteboardChanges(board.toJSON());
  }, [canUndo, canRedo, board, emitWhiteboardChanges]);

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
        {loading ? (
          <Loader active />
        ) : (
          <SketchField
            ref={boardRef}
            height="100%"
            fillColor="transparent"
            lineColor="white"
            lineWidth={3}
            onChange={onSketchChange}
            value={value}
            tool={activeTool}
          />
        )}
      </div>
    </div>
  );
};

export default Whiteboard;
