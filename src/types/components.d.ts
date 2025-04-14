declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// // gridstack Node 类型
// declare module 'gridstack' {
//   export interface GridStackNode {
//     id?: string
//     x?: number
//     y?: number
//     w: number
//     h: number
//     content?: any
//     el?: HTMLElement
//   }

//   export interface GridStackEngine {
//     nodes: GridStackNode[]
//   }

//   export class GridStack {
//     static init(options?: any, element?: HTMLElement): GridStack
//     load(items: any[]): void
//     on(event: string, callback: Function): void
//     removeAll(): void
//     destroy(): void
//     engine?: GridStackEngine
//   }
// } 