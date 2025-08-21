// キーボードショートカットのカスタムフック
import { useEffect, useCallback } from 'react'
import { useReactFlow, useKeyPress } from 'reactflow'
import { FlowNode } from '@/types/flow'

type ShortcutHandler = () => void

interface KeyboardShortcutsConfig {
  onAddNode?: (type: string) => void
  onDeleteNode?: (nodeIds: string[]) => void
  onCopy?: () => void
  onPaste?: () => void
  onUndo?: () => void
  onRedo?: () => void
  onSave?: () => void
  onToggleFullscreen?: () => void
  onSearch?: () => void
  onAddEdge?: () => void
  selectedNodes?: FlowNode[]
}

export function useKeyboardShortcuts({
  onAddNode,
  onDeleteNode,
  onCopy,
  onPaste,
  onUndo,
  onRedo,
  onSave,
  onToggleFullscreen,
  onSearch,
  onAddEdge,
  selectedNodes = [],
}: KeyboardShortcutsConfig) {
  const { fitView, zoomIn, zoomOut, setCenter } = useReactFlow()

  // キーボードイベントハンドラー
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // テキスト入力中は無効
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      const { key, ctrlKey, metaKey, shiftKey, altKey } = event
      const isCmd = ctrlKey || metaKey

      // ズーム操作
      if (isCmd) {
        switch (key) {
          case '+':
          case '=':
            event.preventDefault()
            zoomIn()
            break
          case '-':
          case '_':
            event.preventDefault()
            zoomOut()
            break
          case '0':
            event.preventDefault()
            fitView({ padding: 0.1 })
            break
        }
      }

      // ノード追加（N キー）
      if (key === 'n' && !isCmd && !shiftKey && !altKey) {
        event.preventDefault()
        onAddNode?.('position')
      }

      // エッジ追加モード（E キー）
      if (key === 'e' && !isCmd && !shiftKey && !altKey) {
        event.preventDefault()
        onAddEdge?.()
      }

      // 削除（Delete または Backspace）
      if (
        (key === 'Delete' || key === 'Backspace') &&
        selectedNodes.length > 0
      ) {
        event.preventDefault()
        onDeleteNode?.(selectedNodes.map(n => n.id))
      }

      // コピー＆ペースト
      if (isCmd) {
        switch (key) {
          case 'c':
            if (selectedNodes.length > 0) {
              event.preventDefault()
              onCopy?.()
            }
            break
          case 'v':
            event.preventDefault()
            onPaste?.()
            break
          case 'd':
            if (selectedNodes.length > 0) {
              event.preventDefault()
              onCopy?.()
              onPaste?.()
            }
            break
        }
      }

      // Undo/Redo
      if (isCmd) {
        if (key === 'z' && !shiftKey) {
          event.preventDefault()
          onUndo?.()
        } else if ((key === 'z' && shiftKey) || key === 'y') {
          event.preventDefault()
          onRedo?.()
        }
      }

      // 保存（Cmd/Ctrl + S）
      if (isCmd && key === 's') {
        event.preventDefault()
        onSave?.()
      }

      // 検索（Cmd/Ctrl + F）
      if (isCmd && key === 'f') {
        event.preventDefault()
        onSearch?.()
      }

      // グループ化（Cmd/Ctrl + G）
      if (isCmd && key === 'g' && selectedNodes.length > 1) {
        event.preventDefault()
        // TODO: グループ化機能の実装
        console.log('Group nodes:', selectedNodes.map(n => n.id))
      }

      // フルスクリーン切替（F キー）
      if (key === 'f' && !isCmd && !shiftKey && !altKey) {
        event.preventDefault()
        onToggleFullscreen?.()
      }

      // 整列（矢印キー + Shift）
      if (shiftKey && selectedNodes.length > 0) {
        const moveDistance = altKey ? 1 : 10
        let deltaX = 0
        let deltaY = 0

        switch (key) {
          case 'ArrowUp':
            deltaY = -moveDistance
            break
          case 'ArrowDown':
            deltaY = moveDistance
            break
          case 'ArrowLeft':
            deltaX = -moveDistance
            break
          case 'ArrowRight':
            deltaX = moveDistance
            break
        }

        if (deltaX !== 0 || deltaY !== 0) {
          event.preventDefault()
          // TODO: ノードの移動処理
          console.log(`Move nodes by (${deltaX}, ${deltaY})`)
        }
      }

      // 選択解除（Escape）
      if (key === 'Escape') {
        event.preventDefault()
        // TODO: 選択解除処理
        console.log('Deselect all')
      }

      // ビデオプレビュー（V キー）
      if (key === 'v' && !isCmd && !shiftKey && !altKey) {
        event.preventDefault()
        if (selectedNodes.length === 1 && selectedNodes[0].data.video) {
          // TODO: ビデオプレビューの表示
          console.log('Show video preview for node:', selectedNodes[0].id)
        }
      }

      // クイックアクセス（数字キー）
      if (!isCmd && !shiftKey && !altKey) {
        switch (key) {
          case '1':
            event.preventDefault()
            onAddNode?.('position')
            break
          case '2':
            event.preventDefault()
            onAddNode?.('technique')
            break
          case '3':
            event.preventDefault()
            onAddNode?.('checkpoint')
            break
          case '4':
            event.preventDefault()
            onAddNode?.('video')
            break
        }
      }
    },
    [
      selectedNodes,
      onAddNode,
      onDeleteNode,
      onCopy,
      onPaste,
      onUndo,
      onRedo,
      onSave,
      onToggleFullscreen,
      onSearch,
      onAddEdge,
      fitView,
      zoomIn,
      zoomOut,
    ]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

  // ショートカット一覧を返す（ヘルプ表示用）
  const shortcuts = [
    { key: 'N', description: 'ノードを追加' },
    { key: 'E', description: 'エッジ作成モード' },
    { key: 'Delete', description: '選択を削除' },
    { key: 'Cmd/Ctrl + C', description: 'コピー' },
    { key: 'Cmd/Ctrl + V', description: 'ペースト' },
    { key: 'Cmd/Ctrl + D', description: '複製' },
    { key: 'Cmd/Ctrl + Z', description: '元に戻す' },
    { key: 'Cmd/Ctrl + Shift + Z', description: 'やり直す' },
    { key: 'Cmd/Ctrl + S', description: '保存' },
    { key: 'Cmd/Ctrl + F', description: '検索' },
    { key: 'Cmd/Ctrl + G', description: 'グループ化' },
    { key: 'Cmd/Ctrl + +', description: 'ズームイン' },
    { key: 'Cmd/Ctrl + -', description: 'ズームアウト' },
    { key: 'Cmd/Ctrl + 0', description: 'フィット' },
    { key: 'F', description: 'フルスクリーン' },
    { key: 'V', description: '動画プレビュー' },
    { key: 'Escape', description: '選択解除' },
    { key: '1-4', description: 'ノードタイプ選択' },
    { key: 'Shift + 矢印', description: 'ノード移動' },
  ]

  return { shortcuts }
}