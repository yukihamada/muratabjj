// ノードコンポーネントのエクスポート
export { PositionNode } from './PositionNode'
export { TechniqueNode } from './TechniqueNode'
export { CheckpointNode } from './CheckpointNode'
export { VideoNode } from './VideoNode'

// React Flow用のnodeTypes定義
import { PositionNode } from './PositionNode'
import { TechniqueNode } from './TechniqueNode'
import { CheckpointNode } from './CheckpointNode'
import { VideoNode } from './VideoNode'

export const nodeTypes = {
  position: PositionNode,
  technique: TechniqueNode,
  checkpoint: CheckpointNode,
  video: VideoNode,
} as const