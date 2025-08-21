// エッジコンポーネントのエクスポート
export { CustomEdge } from './CustomEdge'

// React Flow用のedgeTypes定義
import { CustomEdge } from './CustomEdge'

export const edgeTypes = {
  custom: CustomEdge,
} as const