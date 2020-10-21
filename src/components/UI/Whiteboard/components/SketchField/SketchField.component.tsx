import React, { forwardRef } from 'react';
import { ToolName } from '../../enums/Tools';
const { SketchField: SField } = require('react-sketch');

type Props = Partial<{
  lineColor: string;
  // The width of the line
  lineWidth: number;
  // the fill color of the shape when applicable
  fillColor: string;
  // the background color of the sketch
  backgroundColor: string;
  // the opacity of the object
  opacity: number;
  // number of undo/redo steps to maintain
  undoSteps: number;
  // The tool to use, can be pencil, rectangle, circle, brush;
  tool: ToolName;
  // image format when calling toDataURL
  imageFormat: string;
  // Sketch data for controlling sketch from
  // outside the component
  value: object;
  // Set to true if you wish to force load the given value, even if it is  the same
  forceValue: boolean;
  // Specify some width correction which will be applied on auto resize
  widthCorrection: number;
  // Specify some height correction which will be applied on auto resize
  heightCorrection: number;
  // Default initial value
  defaultValue: object;
  // Sketch width
  width: number;
  // Sketch height
  height: string | number;
  // Class name to pass to container div of canvas
  className: string;
  // Style options to pass to container div of canvas
  style: React.CSSProperties;
  // Specify action on change
  onChange: (event: Event) => void;
  // event object added
  onObjectAdded: (event: Event) => void;
  // event object modified
  onObjectModified: (event: Event) => void;
  // event object removed
  onObjectRemoved: (event: Event) => void;
  // event mouse down
  onMouseDown: (event: Event) => void;
  // event mouse move
  onMouseMove: (event: Event) => void;
  // event mouse up
  onMouseUp: (event: Event) => void;
  // event mouse out
  onMouseOut: (event: Event) => void;
  // event object move
  onObjectMoving: (event: Event) => void;
  // event object scale
  onObjectScaling: (event: Event) => void;
  // event object rotating
  onObjectRotating: (event: Event) => void;
}>;

export type SketchFieldRef = {
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  copy: () => void;
  paste: () => void;
  clear: () => void;
  toJSON: () => object;
};

const SketchField: React.ForwardRefRenderFunction<SketchFieldRef, Props> = (
  props,
  ref,
) => <SField ref={ref} {...props} />;

export default forwardRef(SketchField);
