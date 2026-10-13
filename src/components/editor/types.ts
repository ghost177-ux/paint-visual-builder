// Core editor types. Prepared for future drag, resize, layers, comments and JSON I/O.
export type ToolId =
  | "select" | "section" | "container" | "text" | "rectangle" | "circle"
  | "line" | "polygon" | "image" | "icon" | "button" | "input" | "comment";

export type ElementType = Exclude<ToolId, "select" | "comment">;

export interface EditorElement {
  id: string;
  type: ElementType;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  radius: number;
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number;
  parentId?: string | null;
  visible: boolean;
  locked: boolean;
}

export interface EditorComment {
  id: string;
  elementId: string | null;
  author: string;
  body: string;
  createdAt: string;
}

export type DeviceMode = "desktop" | "mobile";

export interface EditorDocument {
  version: 1;
  name: string;
  elements: EditorElement[];
  comments: EditorComment[];
}
