import type { IStaticMethods } from 'preline/dist'
import type { DefineComponent } from 'vue'

declare module '*.vue' {
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare global {
  interface Window {
    HSStaticMethods: IStaticMethods
  }
}

export {}
