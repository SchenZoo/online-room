const tools = {
    Circle: 'circle',
    Line: 'line',
    Arrow: 'arrow',
    Pencil: 'pencil',
    Rectangle: 'rectangle',
    RectangleLabel: 'rectangle-label',
    Select: 'select',
    Pan: 'pan',
    DefaultTool: 'default-tool',
  } as const;

export default tools

export type ToolName = typeof tools[keyof typeof tools]


