'use client'

import { useState, useCallback } from 'react'
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
} from 'reactflow'
import 'reactflow/dist/style.css'
import './mobile-styles.css'
import './mobile-flow-styles.css'
import DashboardNav from '@/components/DashboardNav'
import MobileFlowWrapper from '@/components/MobileFlowWrapper'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Save, Plus, Trash2, Download, Upload } from 'lucide-react'
import toast from 'react-hot-toast'
import { useLanguage } from '@/contexts/LanguageContext'
import { supabase } from '@/lib/supabase/client'

const flowEditorTranslations = {
  ja: {
    newFlow: '新しいフロー',
    flowName: 'フロー名',
    addNode: 'ノード追加',
    save: '保存',
    export: 'エクスポート',
    readOnly: '読み取り専用',
    viewSampleFlows: 'サンプルフローを見る',
    close: '閉じる',
    flowLibrary: 'フローライブラリ',
    noFlowsAvailable: 'フローがありません',
    controls: '操作方法',
    drag: 'ドラッグ: ノードを移動',
    dragFromNode: 'ノードをドラッグ: 接続を作成',
    doubleClick: 'ダブルクリック: ノードを編集',
    delete: 'Delete: 選択を削除',
    loginRequired: 'フローエディタを使用するにはログインが必要です',
    flowNameRequired: 'フロー名を入力してください',
    addNodesFirst: 'ノードを追加してください',
    loginRequiredSave: 'ログインが必要です',
    flowSaved: 'フローを保存しました',
    flowSavedLocally: 'フローをローカルに保存しました（データベース準備中）',
    saveError: '保存エラー',
    loadedFlow: 'を読み込みました',
    failedToLoad: 'フローの読み込みに失敗しました',
    newFlowStarted: '新規フローを開始',
    nodeAdded: 'ノード「{name}」を追加しました！',
    nodeUpdated: 'ノードを更新しました',
    technique: '技術',
    nodes: 'ノード',
    editNode: 'ノードを編集',
    nodeEditPlaceholder: 'ノード名を入力',
    translateFlow: 'フローを翻訳',
    translating: '翻訳中...',
    translationComplete: '翻訳完了',
    translationError: '翻訳エラー',
  },
  en: {
    newFlow: 'New Flow',
    flowName: 'Flow Name',
    addNode: 'Add Node',
    save: 'Save',
    export: 'Export',
    readOnly: 'Read-only',
    viewSampleFlows: 'View Sample Flows',
    close: 'Close',
    flowLibrary: 'Flow Library',
    noFlowsAvailable: 'No flows available',
    controls: 'Controls',
    drag: 'Drag: Move nodes',
    dragFromNode: 'Drag from node: Create connection',
    doubleClick: 'Double click: Edit node',
    delete: 'Delete: Remove selection',
    loginRequired: 'Login required to use the flow editor',
    flowNameRequired: 'Please enter a flow name',
    addNodesFirst: 'Please add nodes',
    loginRequiredSave: 'Login required',
    flowSaved: 'Flow saved successfully',
    flowSavedLocally: 'Flow saved locally (Database setup pending)',
    saveError: 'Save error',
    loadedFlow: 'Loaded',
    failedToLoad: 'Failed to load flow',
    newFlowStarted: 'Started new flow',
    nodeAdded: 'Added node "{name}"!',
    nodeUpdated: 'Node updated',
    technique: 'Technique',
    nodes: 'nodes',
    editNode: 'Edit node',
    nodeEditPlaceholder: 'Enter node name',
    translateFlow: 'Translate Flow',
    translating: 'Translating...',
    translationComplete: 'Translation Complete',
    translationError: 'Translation Error',
  },
  pt: {
    newFlow: 'Novo Fluxo',
    flowName: 'Nome do Fluxo',
    addNode: 'Adicionar Nó',
    save: 'Salvar',
    export: 'Exportar',
    readOnly: 'Somente leitura',
    viewSampleFlows: 'Ver Fluxos de Exemplo',
    close: 'Fechar',
    flowLibrary: 'Biblioteca de Fluxos',
    noFlowsAvailable: 'Nenhum fluxo disponível',
    controls: 'Controles',
    drag: 'Arrastar: Mover nós',
    dragFromNode: 'Arrastar do nó: Criar conexão',
    doubleClick: 'Duplo clique: Editar nó',
    delete: 'Delete: Remover seleção',
    loginRequired: 'Login necessário para usar o editor de fluxo',
    flowNameRequired: 'Por favor, insira um nome para o fluxo',
    addNodesFirst: 'Por favor, adicione nós',
    loginRequiredSave: 'Login necessário',
    flowSaved: 'Fluxo salvo com sucesso',
    flowSavedLocally: 'Fluxo salvo localmente (Banco de dados pendente)',
    saveError: 'Erro ao salvar',
    loadedFlow: 'Carregado',
    failedToLoad: 'Falha ao carregar fluxo',
    newFlowStarted: 'Novo fluxo iniciado',
    nodeAdded: 'Nó "{name}" adicionado!',
    nodeUpdated: 'Nó atualizado',
    technique: 'Técnica',
    nodes: 'nós',
    editNode: 'Editar nó',
    nodeEditPlaceholder: 'Digite o nome do nó',
    translateFlow: 'Traduzir Fluxo',
    translating: 'Traduzindo...',
    translationComplete: 'Tradução Concluída',
    translationError: 'Erro de Tradução',
  },
  es: {
    newFlow: 'Nuevo Flujo',
    flowName: 'Nombre del Flujo',
    addNode: 'Añadir Nodo',
    save: 'Guardar',
    export: 'Exportar',
    readOnly: 'Solo lectura',
    viewSampleFlows: 'Ver Flujos de Muestra',
    close: 'Cerrar',
    flowLibrary: 'Biblioteca de Flujos',
    noFlowsAvailable: 'No hay flujos disponibles',
    controls: 'Controles',
    drag: 'Arrastrar: Mover nodos',
    dragFromNode: 'Arrastrar desde nodo: Crear conexión',
    doubleClick: 'Doble clic: Editar nodo',
    delete: 'Delete: Eliminar selección',
    loginRequired: 'Se requiere iniciar sesión para usar el editor de flujo',
    flowNameRequired: 'Por favor, ingrese un nombre para el flujo',
    addNodesFirst: 'Por favor, añada nodos',
    loginRequiredSave: 'Se requiere iniciar sesión',
    flowSaved: 'Flujo guardado exitosamente',
    flowSavedLocally: 'Flujo guardado localmente (Base de datos pendiente)',
    saveError: 'Error al guardar',
    loadedFlow: 'Cargado',
    failedToLoad: 'Error al cargar flujo',
    newFlowStarted: 'Nuevo flujo iniciado',
    nodeAdded: '¡Nodo "{name}" añadido!',
    nodeUpdated: 'Nodo actualizado',
    technique: 'Técnica',
    nodes: 'nodos',
    editNode: 'Editar nodo',
    nodeEditPlaceholder: 'Ingrese nombre del nodo',
    translateFlow: 'Traducir Flujo',
    translating: 'Traduciendo...',
    translationComplete: 'Traducción Completa',
    translationError: 'Error de Traducción',
  },
  fr: {
    newFlow: 'Nouveau Flux',
    flowName: 'Nom du Flux',
    addNode: 'Ajouter Nœud',
    save: 'Enregistrer',
    export: 'Exporter',
    readOnly: 'Lecture seule',
    viewSampleFlows: 'Voir les Flux d\'Exemple',
    close: 'Fermer',
    flowLibrary: 'Bibliothèque de Flux',
    noFlowsAvailable: 'Aucun flux disponible',
    controls: 'Contrôles',
    drag: 'Glisser: Déplacer les nœuds',
    dragFromNode: 'Glisser depuis le nœud: Créer une connexion',
    doubleClick: 'Double clic: Modifier le nœud',
    delete: 'Delete: Supprimer la sélection',
    loginRequired: 'Connexion requise pour utiliser l\'éditeur de flux',
    flowNameRequired: 'Veuillez entrer un nom de flux',
    addNodesFirst: 'Veuillez ajouter des nœuds',
    loginRequiredSave: 'Connexion requise',
    flowSaved: 'Flux enregistré avec succès',
    flowSavedLocally: 'Flux enregistré localement (Base de données en attente)',
    saveError: 'Erreur de sauvegarde',
    loadedFlow: 'Chargé',
    failedToLoad: 'Échec du chargement du flux',
    newFlowStarted: 'Nouveau flux démarré',
    nodeAdded: 'Nœud "{name}" ajouté !',
    nodeUpdated: 'Nœud mis à jour',
    technique: 'Technique',
    nodes: 'nœuds',
    editNode: 'Modifier le nœud',
    nodeEditPlaceholder: 'Entrez le nom du nœud',
    translateFlow: 'Traduire le Flux',
    translating: 'Traduction...',
    translationComplete: 'Traduction Terminée',
    translationError: 'Erreur de Traduction',
  },
  ko: {
    newFlow: '새 플로우',
    flowName: '플로우 이름',
    addNode: '노드 추가',
    save: '저장',
    export: '내보내기',
    readOnly: '읽기 전용',
    viewSampleFlows: '샘플 플로우 보기',
    close: '닫기',
    flowLibrary: '플로우 라이브러리',
    noFlowsAvailable: '사용 가능한 플로우가 없습니다',
    controls: '컨트롤',
    drag: '드래그: 노드 이동',
    dragFromNode: '노드에서 드래그: 연결 생성',
    doubleClick: '더블 클릭: 노드 편집',
    delete: 'Delete: 선택 항목 삭제',
    loginRequired: '플로우 에디터를 사용하려면 로그인이 필요합니다',
    flowNameRequired: '플로우 이름을 입력하세요',
    addNodesFirst: '노드를 추가하세요',
    loginRequiredSave: '로그인이 필요합니다',
    flowSaved: '플로우가 성공적으로 저장되었습니다',
    flowSavedLocally: '플로우가 로컬에 저장되었습니다 (데이터베이스 설정 대기 중)',
    saveError: '저장 오류',
    loadedFlow: '로드됨',
    failedToLoad: '플로우 로드 실패',
    newFlowStarted: '새 플로우 시작',
    nodeAdded: '노드 "{name}"이(가) 추가되었습니다!',
    nodeUpdated: '노드가 업데이트되었습니다',
    technique: '기술',
    nodes: '노드',
    editNode: '노드 편집',
    nodeEditPlaceholder: '노드 이름 입력',
    translateFlow: '플로우 번역',
    translating: '번역 중...',
    translationComplete: '번역 완료',
    translationError: '번역 오류',
  },
  ru: {
    newFlow: 'Новый поток',
    flowName: 'Название потока',
    addNode: 'Добавить узел',
    save: 'Сохранить',
    export: 'Экспорт',
    readOnly: 'Только чтение',
    viewSampleFlows: 'Просмотр образцов потоков',
    close: 'Закрыть',
    flowLibrary: 'Библиотека потоков',
    noFlowsAvailable: 'Нет доступных потоков',
    controls: 'Управление',
    drag: 'Перетаскивание: Перемещение узлов',
    dragFromNode: 'Перетаскивание от узла: Создание соединения',
    doubleClick: 'Двойной щелчок: Редактировать узел',
    delete: 'Delete: Удалить выделение',
    loginRequired: 'Для использования редактора потоков требуется вход',
    flowNameRequired: 'Пожалуйста, введите название потока',
    addNodesFirst: 'Пожалуйста, добавьте узлы',
    loginRequiredSave: 'Требуется вход',
    flowSaved: 'Поток успешно сохранен',
    flowSavedLocally: 'Поток сохранен локально (Настройка базы данных ожидается)',
    saveError: 'Ошибка сохранения',
    loadedFlow: 'Загружено',
    failedToLoad: 'Не удалось загрузить поток',
    newFlowStarted: 'Начат новый поток',
    nodeAdded: 'Узел "{name}" добавлен!',
    nodeUpdated: 'Узел обновлен',
    technique: 'Техника',
    nodes: 'узлы',
    editNode: 'Редактировать узел',
    nodeEditPlaceholder: 'Введите название узла',
    translateFlow: 'Перевести Поток',
    translating: 'Перевод...',
    translationComplete: 'Перевод Завершен',
    translationError: 'Ошибка Перевода',
  },
  zh: {
    newFlow: '新流程',
    flowName: '流程名称',
    addNode: '添加节点',
    save: '保存',
    export: '导出',
    readOnly: '只读',
    viewSampleFlows: '查看示例流程',
    close: '关闭',
    flowLibrary: '流程库',
    noFlowsAvailable: '没有可用的流程',
    controls: '控制',
    drag: '拖动：移动节点',
    dragFromNode: '从节点拖动：创建连接',
    doubleClick: '双击：编辑节点',
    delete: 'Delete：删除选择',
    loginRequired: '使用流程编辑器需要登录',
    flowNameRequired: '请输入流程名称',
    addNodesFirst: '请添加节点',
    loginRequiredSave: '需要登录',
    flowSaved: '流程保存成功',
    flowSavedLocally: '流程已保存到本地（数据库设置待定）',
    saveError: '保存错误',
    loadedFlow: '已加载',
    failedToLoad: '加载流程失败',
    newFlowStarted: '开始新流程',
    nodeAdded: '节点 "{name}" 已添加！',
    nodeUpdated: '节点已更新',
    technique: '技术',
    nodes: '节点',
    editNode: '编辑节点',
    nodeEditPlaceholder: '输入节点名称',
    translateFlow: '翻译流程',
    translating: '翻译中...',
    translationComplete: '翻译完成',
    translationError: '翻译错误',
  },
  de: {
    newFlow: 'Neuer Fluss',
    flowName: 'Flussname',
    addNode: 'Knoten hinzufügen',
    save: 'Speichern',
    export: 'Exportieren',
    readOnly: 'Schreibgeschützt',
    viewSampleFlows: 'Beispielflüsse anzeigen',
    close: 'Schließen',
    flowLibrary: 'Flussbibliothek',
    noFlowsAvailable: 'Keine Flüsse verfügbar',
    controls: 'Steuerung',
    drag: 'Ziehen: Knoten verschieben',
    dragFromNode: 'Vom Knoten ziehen: Verbindung erstellen',
    doubleClick: 'Doppelklick: Knoten bearbeiten',
    delete: 'Delete: Auswahl entfernen',
    loginRequired: 'Anmeldung erforderlich, um den Flusseditor zu verwenden',
    flowNameRequired: 'Bitte geben Sie einen Flussnamen ein',
    addNodesFirst: 'Bitte fügen Sie Knoten hinzu',
    loginRequiredSave: 'Anmeldung erforderlich',
    flowSaved: 'Fluss erfolgreich gespeichert',
    flowSavedLocally: 'Fluss lokal gespeichert (Datenbankeinrichtung ausstehend)',
    saveError: 'Speicherfehler',
    loadedFlow: 'Geladen',
    failedToLoad: 'Fehler beim Laden des Flusses',
    newFlowStarted: 'Neuer Fluss gestartet',
    nodeAdded: 'Knoten "{name}" hinzugefügt!',
    nodeUpdated: 'Knoten aktualisiert',
    technique: 'Technik',
    nodes: 'Knoten',
    editNode: 'Knoten bearbeiten',
    nodeEditPlaceholder: 'Knotennamen eingeben',
    translateFlow: 'Fluss Übersetzen',
    translating: 'Übersetzung...',
    translationComplete: 'Übersetzung Abgeschlossen',
    translationError: 'Übersetzungsfehler',
  },
  it: {
    newFlow: 'Nuovo Flusso',
    flowName: 'Nome del Flusso',
    addNode: 'Aggiungi Nodo',
    save: 'Salva',
    export: 'Esporta',
    readOnly: 'Solo lettura',
    viewSampleFlows: 'Visualizza Flussi di Esempio',
    close: 'Chiudi',
    flowLibrary: 'Libreria di Flussi',
    noFlowsAvailable: 'Nessun flusso disponibile',
    controls: 'Controlli',
    drag: 'Trascina: Sposta i nodi',
    dragFromNode: 'Trascina dal nodo: Crea connessione',
    doubleClick: 'Doppio clic: Modifica nodo',
    delete: 'Delete: Rimuovi selezione',
    loginRequired: 'Accesso richiesto per utilizzare l\'editor di flussi',
    flowNameRequired: 'Inserisci un nome per il flusso',
    addNodesFirst: 'Aggiungi i nodi',
    loginRequiredSave: 'Accesso richiesto',
    flowSaved: 'Flusso salvato con successo',
    flowSavedLocally: 'Flusso salvato localmente (Configurazione database in sospeso)',
    saveError: 'Errore di salvataggio',
    loadedFlow: 'Caricato',
    failedToLoad: 'Impossibile caricare il flusso',
    newFlowStarted: 'Nuovo flusso avviato',
    nodeAdded: 'Nodo "{name}" aggiunto!',
    nodeUpdated: 'Nodo aggiornato',
    technique: 'Tecnica',
    nodes: 'nodi',
    editNode: 'Modifica nodo',
    nodeEditPlaceholder: 'Inserisci nome del nodo',
    translateFlow: 'Traduci Flusso',
    translating: 'Traduzione...',
    translationComplete: 'Traduzione Completata',
    translationError: 'Errore di Traduzione',
  },
}

const getInitialNodes = (language: string, isMobile: boolean = false): Node[] => {
  const labels = {
    ja: ['クローズドガード', 'アームドラッグ', 'スイープ'],
    en: ['Closed Guard', 'Arm Drag', 'Sweep'],
    pt: ['Guarda Fechada', 'Arm Drag', 'Raspagem'],
    es: ['Guardia Cerrada', 'Arm Drag', 'Barrida'],
    fr: ['Garde Fermée', 'Arm Drag', 'Balayage'],
    ko: ['클로즈드 가드', '암 드래그', '스윕'],
    ru: ['Закрытая гвардия', 'Арм драг', 'Свип'],
    zh: ['封闭式防守', '手臂拖拽', '扫倒'],
    de: ['Geschlossene Guard', 'Arm Drag', 'Sweep'],
    it: ['Guardia Chiusa', 'Arm Drag', 'Spazzata'],
  }
  
  const nodeLabels = labels[language as keyof typeof labels] || labels.en
  
  // モバイル用の配置調整
  const positions = isMobile ? [
    { x: 50, y: 50 },    // ノード1: 左上
    { x: 50, y: 200 },   // ノード2: 左下
    { x: 250, y: 200 },  // ノード3: 右下
  ] : [
    { x: 250, y: 100 },  // デスクトップ配置
    { x: 100, y: 250 },
    { x: 400, y: 250 },
  ]
  
  return [
    {
      id: '1',
      type: 'default',
      position: positions[0],
      data: { label: nodeLabels[0] },
      style: {
        background: '#13131a',
        color: '#e9e9ee',
        border: '2px solid #ea384c',
        borderRadius: '14px',
        padding: isMobile ? '8px 12px' : '10px 20px',
        width: isMobile ? 120 : 150,
        textAlign: 'center',
        fontSize: isMobile ? '13px' : '14px',
      },
    },
    {
      id: '2',
      type: 'default',
      position: positions[1],
      data: { label: nodeLabels[1] },
      style: {
        background: '#13131a',
        color: '#e9e9ee',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '14px',
        padding: isMobile ? '8px 12px' : '10px 20px',
        width: isMobile ? 120 : 150,
        textAlign: 'center',
        fontSize: isMobile ? '13px' : '14px',
      },
    },
    {
      id: '3',
      type: 'default',
      position: positions[2],
      data: { label: nodeLabels[2] },
      style: {
        background: '#13131a',
        color: '#e9e9ee',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '14px',
        padding: isMobile ? '8px 12px' : '10px 20px',
        width: isMobile ? 120 : 150,
        textAlign: 'center',
        fontSize: isMobile ? '13px' : '14px',
      },
    },
  ]
}

const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    animated: true,
    style: { stroke: '#ea384c', strokeWidth: 2 },
  },
  {
    id: 'e1-3',
    source: '1',
    target: '3',
    animated: true,
    style: { stroke: '#ea384c', strokeWidth: 2 },
  },
]

export default function FlowEditorPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { language } = useLanguage()
  const t = flowEditorTranslations[language as keyof typeof flowEditorTranslations] || flowEditorTranslations.en
  
  const [isMobileView, setIsMobileView] = useState(false)
  const [nodes, setNodes, onNodesChange] = useNodesState(getInitialNodes(language, isMobileView))
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [flowName, setFlowName] = useState('')
  const [showFlowList, setShowFlowList] = useState(false)
  const [publicFlows, setPublicFlows] = useState<any[]>([])
  const [currentFlowId, setCurrentFlowId] = useState<string | null>(null)
  const [isReadOnly, setIsReadOnly] = useState(false)
  const [editingNode, setEditingNode] = useState<string | null>(null)
  const [editingText, setEditingText] = useState('')
  
  const [hasInitialized, setHasInitialized] = useState(false)
  
  // 言語変更時にノードの翻訳を更新
  useEffect(() => {
    setNodes(currentNodes => 
      currentNodes.map(node => {
        if (node.data.multilingual && node.data.multilingual[language]) {
          return {
            ...node,
            data: {
              ...node.data,
              label: node.data.multilingual[language]
            }
          }
        }
        return node
      })
    )
  }, [language, setNodes])

  // URLパラメータからフローIDを取得して読み込む
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const flowId = urlParams.get('id')
    
    if (flowId && !hasInitialized) {
      loadFlowById(flowId)
      setHasInitialized(true)
    } else if (!hasInitialized && flowName === '') {
      // 初回のみフロー名を設定（言語変更時に上書きしない）
      setFlowName(t.newFlow)
      setHasInitialized(true)
    }
    
    // モバイルビューの検出
    const checkMobile = () => {
      const isMobile = window.innerWidth < 768
      setIsMobileView(isMobile)
      
      // モバイルの場合、ノードを再配置
      if (isMobile) {
        setNodes(getInitialNodes(language, true))
      }
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [language, hasInitialized, setNodes])
  
  // 公開フローを取得
  useEffect(() => {
    const fetchPublicFlows = async () => {
      const { data, error } = await supabase
        .from('flows')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
      
      if (!error && data && data.length > 0) {
        setPublicFlows(data)
        
        // 初回アクセス時は最初のサンプルフローを自動的に読み込む
        if (flowName === '' && nodes.length === 3 && data[0]) {
          setFlowName(data[0].name)
          if (data[0].nodes) setNodes(data[0].nodes)
          if (data[0].edges) setEdges(data[0].edges)
          setCurrentFlowId(data[0].id)
        }
      }
    }
    
    fetchPublicFlows()
  }, [flowName, nodes.length, setNodes, setEdges])

  useEffect(() => {
    if (!loading && !user) {
      toast.error(t.loginRequired)
      router.push('/')
    }
  }, [user, loading, router, t])

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = {
        ...params,
        animated: true,
        style: { stroke: '#ea384c', strokeWidth: 2 },
      }
      setEdges((eds) => addEdge(newEdge, eds))
    },
    [setEdges]
  )

  const loadFlow = useCallback((flow: any) => {
    setFlowName(flow.name)
    if (flow.nodes) setNodes(flow.nodes)
    if (flow.edges) setEdges(flow.edges)
    setCurrentFlowId(flow.id)
    setShowFlowList(false)
    
    // 自分のフローでない場合は読み取り専用に
    if (user && flow.user_id !== user.id) {
      setIsReadOnly(true)
    } else {
      setIsReadOnly(false)
    }
    
    toast.success(`${t.loadedFlow} "${flow.name}"`)
  }, [language, setNodes, setEdges, user])
  
  const loadFlowById = async (flowId: string) => {
    try {
      const { data, error } = await supabase
        .from('flows')
        .select('*')
        .eq('id', flowId)
        .single()
      
      if (error) {
        console.error('Error loading flow:', error)
        toast.error(t.failedToLoad)
        return
      }
      
      if (data) {
        loadFlow(data)
      }
    } catch (error) {
      console.error('Error loading flow:', error)
    }
  }

  const addNode = useCallback(() => {
    const nodeCount = nodes.length + 1
    const newNode: Node = {
      id: `node-${Date.now()}`, // ユニークIDで重複を防ぐ
      type: 'default',
      position: { 
        x: 100 + (nodeCount * 60) % 600, // より予測可能な配置
        y: 100 + Math.floor(nodeCount / 10) * 80 
      },
      data: { 
        label: `${t.technique} ${nodeCount}`,
        multilingual: {
          [language]: `${t.technique} ${nodeCount}`
        }
      },
      style: {
        background: '#13131a',
        color: '#e9e9ee',
        border: '2px solid #ea384c',
        borderRadius: '14px',
        padding: '10px 20px',
        width: 120,
        textAlign: 'center',
        fontSize: '13px',
        // アニメーション効果を追加
        animation: 'fadeIn 0.3s ease-in-out'
      },
    }
    
    setNodes((nds) => {
      const updatedNodes = [...nds, newNode]
      return updatedNodes
    })
    
    // より目立つ成功フィードバック
    toast.success(
      `✨ ${t.nodeAdded.replace('{name}', newNode.data.label)}`,
      { 
        duration: 2000,
        style: {
          background: 'linear-gradient(135deg, #1a1a23 0%, #2a2a33 100%)',
          color: '#fff',
          border: '1px solid #ea384c',
        },
        icon: '🎯'
      }
    )
  }, [nodes, language, setNodes])

  const onNodeDoubleClick = useCallback((event: any, node: any) => {
    if (isReadOnly) return
    setEditingNode(node.id)
    setEditingText(node.data.label)
  }, [isReadOnly])

  const saveNodeEdit = useCallback(() => {
    if (!editingNode) return
    
    setNodes(nodes => 
      nodes.map(node => 
        node.id === editingNode 
          ? { 
              ...node, 
              data: { 
                ...node.data, 
                label: editingText,
                multilingual: {
                  ...node.data.multilingual,
                  [language]: editingText
                }
              }
            }
          : node
      )
    )
    
    setEditingNode(null)
    setEditingText('')
    
    toast.success(
      `✨ ${t.nodeUpdated || 'Node updated'}!`,
      { 
        duration: 2000,
        style: {
          background: 'linear-gradient(135deg, #1a1a23 0%, #2a2a33 100%)',
          color: '#fff',
          border: '1px solid #4ade80',
        },
        icon: '✏️'
      }
    )
  }, [editingNode, editingText, setNodes, t])

  const cancelNodeEdit = useCallback(() => {
    setEditingNode(null)
    setEditingText('')
  }, [])

  // 包括的な翻訳辞書 - BJJ技術全領域をカバー
  const translateTechnique = (text: string, fromLang: string, toLang: string) => {
    const translations: Record<string, Record<string, string>> = {
      // 基本ポジション - Basic Positions
      'Guard': { ja: 'ガード', pt: 'Guarda', es: 'Guardia', fr: 'Garde', ko: '가드', ru: 'Гвардия', zh: '防守', de: 'Guard', it: 'Guardia' },
      'Closed Guard': { ja: 'クローズドガード', pt: 'Guarda Fechada', es: 'Guardia Cerrada', fr: 'Garde Fermée', ko: '클로즈드 가드', ru: 'Закрытая гвардия', zh: '封闭式防守', de: 'Geschlossene Guard', it: 'Guardia Chiusa' },
      'Open Guard': { ja: 'オープンガード', pt: 'Guarda Aberta', es: 'Guardia Abierta', fr: 'Garde Ouverte', ko: '오픈 가드', ru: 'Открытая гвардия', zh: '开放式防守', de: 'Offene Guard', it: 'Guardia Aperta' },
      'Half Guard': { ja: 'ハーフガード', pt: 'Meia Guarda', es: 'Media Guardia', fr: 'Demi-Garde', ko: '하프 가드', ru: 'Полугвардия', zh: '半防守', de: 'Halbe Guard', it: 'Mezza Guardia' },
      'Butterfly Guard': { ja: 'バタフライガード', pt: 'Guarda Borboleta', es: 'Guardia Mariposa', fr: 'Garde Papillon', ko: '버터플라이 가드', ru: 'Гвардия бабочка', zh: '蝴蝶防守', de: 'Schmetterling Guard', it: 'Guardia Farfalla' },
      'Spider Guard': { ja: 'スパイダーガード', pt: 'Guarda Aranha', es: 'Guardia Araña', fr: 'Garde Araignée', ko: '스파이더 가드', ru: 'Паучья гвардия', zh: '蜘蛛防守', de: 'Spinnen Guard', it: 'Guardia Ragno' },
      'De La Riva': { ja: 'デラヒーバ', pt: 'De La Riva', es: 'De La Riva', fr: 'De La Riva', ko: '델라히바', ru: 'Де ла Рива', zh: '德拉里瓦', de: 'De La Riva', it: 'De La Riva' },
      'Reverse De La Riva': { ja: 'リバースデラヒーバ', pt: 'De La Riva Invertida', es: 'De La Riva Invertida', fr: 'De La Riva Inversé', ko: '리버스 델라히바', ru: 'Обратная де ла Рива', zh: '反向德拉里瓦', de: 'Umgekehrte De La Riva', it: 'De La Riva Inversa' },
      'X-Guard': { ja: 'エックスガード', pt: 'Guarda X', es: 'Guardia X', fr: 'Garde X', ko: 'X가드', ru: 'X-гвардия', zh: 'X防守', de: 'X-Guard', it: 'Guardia X' },
      'Single-X Guard': { ja: 'シングルエックスガード', pt: 'Guarda X Simples', es: 'Guardia X Simple', fr: 'Garde X Simple', ko: '싱글 X가드', ru: 'Одинарная X-гвардия', zh: '单X防守', de: 'Einfache X-Guard', it: 'Guardia X Singola' },
      'Lasso Guard': { ja: 'ラッソガード', pt: 'Guarda Laço', es: 'Guardia Lazo', fr: 'Garde Lasso', ko: '라쏘 가드', ru: 'Гвардия лассо', zh: '套索防守', de: 'Lasso Guard', it: 'Guardia Lasso' },
      'Worm Guard': { ja: 'ワームガード', pt: 'Guarda Worm', es: 'Guardia Gusano', fr: 'Garde Ver', ko: '웜 가드', ru: 'Червячная гвардия', zh: '蠕虫防守', de: 'Wurm Guard', it: 'Guardia Verme' },
      'K-Guard': { ja: 'ケーガード', pt: 'Guarda K', es: 'Guardia K', fr: 'Garde K', ko: 'K가드', ru: 'K-гвардия', zh: 'K防守', de: 'K-Guard', it: 'Guardia K' },
      'Shin on Shin': { ja: 'シンオンシン', pt: 'Canela na Canela', es: 'Espinilla en Espinilla', fr: 'Tibia sur Tibia', ko: '정강이 대 정강이', ru: 'Голень на голень', zh: '胫骨对胫骨', de: 'Schienbein auf Schienbein', it: 'Tibia su Tibia' },
      'Collar Sleeve': { ja: 'カラースリーブ', pt: 'Gola Manga', es: 'Cuello Manga', fr: 'Col Manche', ko: '칼라 슬리브', ru: 'Воротник рукав', zh: '领袖控制', de: 'Kragen Ärmel', it: 'Collo Manica' },
      'Deep Half Guard': { ja: 'ディープハーフガード', pt: 'Meia Guarda Profunda', es: 'Media Guardia Profunda', fr: 'Demi-Garde Profonde', ko: '딥 하프 가드', ru: 'Глубокая полугвардия', zh: '深层半防守', de: 'Tiefe Halbe Guard', it: 'Mezza Guardia Profonda' },
      'Lockdown': { ja: 'ロックダウン', pt: 'Lockdown', es: 'Bloqueo', fr: 'Verrouillage', ko: '락다운', ru: 'Блокировка', zh: '锁定', de: 'Sperrung', it: 'Blocco' },
      '50/50 Guard': { ja: '50/50ガード', pt: 'Guarda 50/50', es: 'Guardia 50/50', fr: 'Garde 50/50', ko: '50/50 가드', ru: '50/50 гвардия', zh: '50/50防守', de: '50/50 Guard', it: 'Guardia 50/50' },
      'Rubber Guard': { ja: 'ラバーガード', pt: 'Guarda Borracha', es: 'Guardia Caucho', fr: 'Garde Caoutchouc', ko: '러버 가드', ru: 'Резиновая гвардия', zh: '橡胶防守', de: 'Gummi Guard', it: 'Guardia Gomma' },
      'Z-Guard': { ja: 'ゼットガード', pt: 'Guarda Z', es: 'Guardia Z', fr: 'Garde Z', ko: 'Z가드', ru: 'Z-гвардия', zh: 'Z防守', de: 'Z-Guard', it: 'Guardia Z' },
      'Knee Shield': { ja: 'ニーシールド', pt: 'Escudo de Joelho', es: 'Escudo de Rodilla', fr: 'Bouclier de Genou', ko: '무릎 방패', ru: 'Щит колена', zh: '膝盾', de: 'Knieschild', it: 'Scudo del Ginocchio' },

      // トップポジション - Top Positions
      'Mount': { ja: 'マウント', pt: 'Montada', es: 'Montada', fr: 'Montée', ko: '마운트', ru: 'Маунт', zh: '骑乘位', de: 'Mount', it: 'Montata' },
      'High Mount': { ja: 'ハイマウント', pt: 'Montada Alta', es: 'Montada Alta', fr: 'Montée Haute', ko: '하이 마운트', ru: 'Высокий маунт', zh: '高位骑乘', de: 'Hoher Mount', it: 'Montata Alta' },
      'Low Mount': { ja: 'ローマウント', pt: 'Montada Baixa', es: 'Montada Baja', fr: 'Montée Basse', ko: '로우 마운트', ru: 'Низкий маунт', zh: '低位骑乘', de: 'Niedriger Mount', it: 'Montata Bassa' },
      'Technical Mount': { ja: 'テクニカルマウント', pt: 'Montada Técnica', es: 'Montada Técnica', fr: 'Montée Technique', ko: '테크니컬 마운트', ru: 'Технический маунт', zh: '技术骑乘', de: 'Technischer Mount', it: 'Montata Tecnica' },
      'S-Mount': { ja: 'エスマウント', pt: 'Montada S', es: 'Montada S', fr: 'Montée S', ko: 'S마운트', ru: 'S-маунт', zh: 'S型骑乘', de: 'S-Mount', it: 'Montata S' },
      'Side Control': { ja: 'サイドコントロール', pt: 'Controle Lateral', es: 'Control Lateral', fr: 'Contrôle Latéral', ko: '사이드 컨트롤', ru: 'Боковой контроль', zh: '侧面控制', de: 'Seitenkontrolle', it: 'Controllo Laterale' },
      'Knee on Belly': { ja: 'ニーオンベリー', pt: 'Joelho no Peito', es: 'Rodilla en el Vientre', fr: 'Genou sur Ventre', ko: '무릎 압박', ru: 'Колено на живот', zh: '膝压腹部', de: 'Knie auf Bauch', it: 'Ginocchio sulla Pancia' },
      'North South': { ja: 'ノースサウス', pt: 'Norte-Sul', es: 'Norte-Sur', fr: 'Nord-Sud', ko: '노스 사우스', ru: 'Север-Юг', zh: '南北位', de: 'Nord-Süd', it: 'Nord-Sud' },
      'Back Control': { ja: 'バックコントロール', pt: 'Controle das Costas', es: 'Control de Espalda', fr: 'Contrôle du Dos', ko: '백 컨트롤', ru: 'Контроль спины', zh: '背部控制', de: 'Rückenkontrolle', it: 'Controllo della Schiena' },
      'Rear Mount': { ja: 'リアマウント', pt: 'Montada pelas Costas', es: 'Montada por Detrás', fr: 'Montée Arrière', ko: '리어 마운트', ru: 'Задний маунт', zh: '后背骑乘', de: 'Rückseitiger Mount', it: 'Montata Posteriore' },
      'Body Triangle': { ja: 'ボディトライアングル', pt: 'Triângulo de Corpo', es: 'Triángulo de Cuerpo', fr: 'Triangle de Corps', ko: '바디 트라이앵글', ru: 'Треугольник тела', zh: '身体三角', de: 'Körper-Dreieck', it: 'Triangolo del Corpo' },
      'Turtle': { ja: 'タートル', pt: 'Tartaruga', es: 'Tortuga', fr: 'Tortue', ko: '거북이', ru: 'Черепаха', zh: '乌龟位', de: 'Schildkröte', it: 'Tartaruga' },

      // サブミッション - Submissions
      'Submission': { ja: 'サブミッション', pt: 'Finalização', es: 'Finalización', fr: 'Soumission', ko: '서브미션', ru: 'Болевой прием', zh: '降服技', de: 'Aufgabe', it: 'Sottomissione' },
      'Choke': { ja: '絞め技', pt: 'Estrangulamento', es: 'Estrangulación', fr: 'Étranglement', ko: '초크', ru: 'Удушение', zh: '绞技', de: 'Würgegriff', it: 'Strangolamento' },
      'Joint Lock': { ja: '関節技', pt: 'Chave de Articulação', es: 'Luxación Articular', fr: 'Clé Articulaire', ko: '관절기', ru: 'Болевой на сустав', zh: '关节技', de: 'Gelenkhebel', it: 'Leva Articolare' },

      // チョーク - Chokes
      'Triangle': { ja: 'トライアングル', pt: 'Triângulo', es: 'Triángulo', fr: 'Triangle', ko: '트라이앵글', ru: 'Треугольник', zh: '三角锁', de: 'Dreieck', it: 'Triangolo' },
      'Rear Naked Choke': { ja: 'リアネイキッドチョーク', pt: 'Mata Leão', es: 'Estrangulación Desnuda Posterior', fr: 'Étranglement Nu Arrière', ko: '리어 네이키드 초크', ru: 'Удушение сзади', zh: '裸绞', de: 'Würgegriff von hinten', it: 'Strangolamento Nudo da Dietro' },
      'Guillotine': { ja: 'ギロチン', pt: 'Guilhotina', es: 'Guillotina', fr: 'Guillotine', ko: '기요틴', ru: 'Гильотина', zh: '断头台', de: 'Guillotine', it: 'Ghigliottina' },
      'D\'Arce': { ja: 'ダース', pt: 'D\'Arce', es: 'D\'Arce', fr: 'D\'Arce', ko: '다르스', ru: 'Д\'Арс', zh: '达西绞', de: 'D\'Arce', it: 'D\'Arce' },
      'Anaconda': { ja: 'アナコンダ', pt: 'Anaconda', es: 'Anaconda', fr: 'Anaconda', ko: '아나콘다', ru: 'Анаконда', zh: '蟒蛇绞', de: 'Anakonda', it: 'Anaconda' },
      'Bow and Arrow': { ja: 'ボウアンドアロー', pt: 'Arco e Flecha', es: 'Arco y Flecha', fr: 'Arc et Flèche', ko: '활과 화살', ru: 'Лук и стрела', zh: '弓箭绞', de: 'Bogen und Pfeil', it: 'Arco e Freccia' },
      'Cross Collar Choke': { ja: 'クロスカラーチョーク', pt: 'Ezequiel Cruzado', es: 'Estrangulación Cruzada', fr: 'Étranglement Croisé', ko: '크로스 칼라 초크', ru: 'Перекрестное удушение', zh: '十字领绞', de: 'Kreuz-Kragen-Würger', it: 'Strangolamento Incrociato' },
      'Baseball Choke': { ja: 'ベースボールチョーク', pt: 'Estrangulamento Baseball', es: 'Estrangulación Baseball', fr: 'Étranglement Baseball', ko: '야구 초크', ru: 'Бейсбольное удушение', zh: '棒球绞', de: 'Baseball-Würger', it: 'Strangolamento Baseball' },
      'Ezekiel': { ja: 'エゼキエル', pt: 'Ezequiel', es: 'Ezequiel', fr: 'Ézéchiel', ko: '에제키엘', ru: 'Иезекииль', zh: '以西结绞', de: 'Ezechiel', it: 'Ezechiele' },
      'Paper Cutter': { ja: 'ペーパーカッター', pt: 'Cortador de Papel', es: 'Cortador de Papel', fr: 'Coupe-Papier', ko: '페이퍼 커터', ru: 'Резак для бумаги', zh: '纸刀绞', de: 'Papierschneider', it: 'Tagliacarte' },
      'Loop Choke': { ja: 'ループチョーク', pt: 'Estrangulamento Loop', es: 'Estrangulación Loop', fr: 'Étranglement Boucle', ko: '루프 초크', ru: 'Петлевое удушение', zh: '环形绞', de: 'Schleifen-Würger', it: 'Strangolamento ad Anello' },

      // アームロック - Arm Locks
      'Armbar': { ja: 'アームバー', pt: 'Chave de Braço', es: 'Palanca de Brazo', fr: 'Clé de Bras', ko: '팔꺾기', ru: 'Рычаг локтя', zh: '手臂锁', de: 'Armhebel', it: 'Leva al Braccio' },
      'Kimura': { ja: 'キムラ', pt: 'Kimura', es: 'Kimura', fr: 'Kimura', ko: '키무라', ru: 'Кимура', zh: '木村锁', de: 'Kimura', it: 'Kimura' },
      'Americana': { ja: 'アメリカーナ', pt: 'Americana', es: 'Americana', fr: 'Americana', ko: '아메리카나', ru: 'Американа', zh: '美式锁', de: 'Americana', it: 'Americana' },
      'Omoplata': { ja: 'オモプラタ', pt: 'Omoplata', es: 'Omóplata', fr: 'Omoplata', ko: '오모플라타', ru: 'Омоплата', zh: '肩胛锁', de: 'Omoplata', it: 'Omoplata' },
      'Arm Drag': { ja: 'アームドラッグ', pt: 'Arm Drag', es: 'Arm Drag', fr: 'Arm Drag', ko: '암 드래그', ru: 'Арм драг', zh: '手臂拖拽', de: 'Arm Drag', it: 'Arm Drag' },
      'Straight Armbar': { ja: 'ストレートアームバー', pt: 'Chave de Braço Reta', es: 'Palanca Recta', fr: 'Clé Droite', ko: '스트레이트 팔꺾기', ru: 'Прямой рычаг', zh: '直臂锁', de: 'Gerader Armhebel', it: 'Leva Dritta' },

      // レッグロック - Leg Locks
      'Heel Hook': { ja: 'ヒールフック', pt: 'Heel Hook', es: 'Heel Hook', fr: 'Crochet de Talon', ko: '힐 훅', ru: 'Зацеп пятки', zh: '脚跟钩', de: 'Fersenhaken', it: 'Gancio del Tallone' },
      'Toe Hold': { ja: 'トーホールド', pt: 'Pé de Vaca', es: 'Toma de Dedo', fr: 'Prise d\'Orteil', ko: '토홀드', ru: 'Захват пальцев', zh: '脚趾锁', de: 'Zehengriff', it: 'Presa delle Dita' },
      'Ankle Lock': { ja: 'アンクルロック', pt: 'Chave de Tornozelo', es: 'Luxación de Tobillo', fr: 'Clé de Cheville', ko: '발목 꺾기', ru: 'Рычаг голеностопа', zh: '脚踝锁', de: 'Knöchelhebel', it: 'Leva alla Caviglia' },
      'Calf Slicer': { ja: 'カーフスライサー', pt: 'Cortador de Panturrilha', es: 'Cortador de Pantorrilla', fr: 'Trancheur de Mollet', ko: '종아리 절단기', ru: 'Резак икры', zh: '小腿切割', de: 'Wadenschneider', it: 'Affettatore di Polpaccio' },
      'Knee Bar': { ja: 'ニーバー', pt: 'Chave de Joelho', es: 'Palanca de Rodilla', fr: 'Clé de Genou', ko: '무릎 꺾기', ru: 'Рычаг колена', zh: '膝关节锁', de: 'Kniehebel', it: 'Leva al Ginocchio' },

      // スイープ - Sweeps
      'Sweep': { ja: 'スイープ', pt: 'Raspagem', es: 'Barrida', fr: 'Balayage', ko: '스윕', ru: 'Свип', zh: '扫倒', de: 'Sweep', it: 'Spazzata' },
      'Scissor Sweep': { ja: 'シザースイープ', pt: 'Raspagem de Tesoura', es: 'Barrida de Tijera', fr: 'Balayage Ciseaux', ko: '가위 스윕', ru: 'Ножницы', zh: '剪刀扫', de: 'Scheren-Sweep', it: 'Spazzata a Forbice' },
      'Hip Toss': { ja: 'ヒップトス', pt: 'Hip Toss', es: 'Proyección de Cadera', fr: 'Projection de Hanche', ko: '힙 토스', ru: 'Бросок через бедро', zh: '髋部摔', de: 'Hüftwurf', it: 'Proiezione dell\'Anca' },
      'Butterfly Sweep': { ja: 'バタフライスイープ', pt: 'Raspagem Borboleta', es: 'Barrida Mariposa', fr: 'Balayage Papillon', ko: '버터플라이 스윕', ru: 'Бабочка', zh: '蝴蝶扫', de: 'Schmetterling-Sweep', it: 'Spazzata Farfalla' },
      'X-Guard Sweep': { ja: 'エックスガードスイープ', pt: 'Raspagem da Guarda X', es: 'Barrida de Guardia X', fr: 'Balayage Garde X', ko: 'X가드 스윕', ru: 'X-свип', zh: 'X防守扫', de: 'X-Guard-Sweep', it: 'Spazzata Guardia X' },
      'Berimbolo': { ja: 'ベリンボロ', pt: 'Berimbolo', es: 'Berimbolo', fr: 'Berimbolo', ko: '베림볼로', ru: 'Беримболо', zh: '贝林博洛', de: 'Berimbolo', it: 'Berimbolo' },
      'Single Leg X': { ja: 'シングルレッグX', pt: 'Perna X Simples', es: 'Pierna X Simple', fr: 'Jambe X Simple', ko: '싱글 레그 X', ru: 'Одиночная нога X', zh: '单腿X', de: 'Einbeiniges X', it: 'Gamba X Singola' },

      // エスケープ - Escapes
      'Escape': { ja: 'エスケープ', pt: 'Escapar', es: 'Escape', fr: 'Échapper', ko: '탈출', ru: 'Побег', zh: '逃脱', de: 'Entkommen', it: 'Fuga' },
      'Bridge': { ja: 'ブリッジ', pt: 'Ponte', es: 'Puente', fr: 'Pont', ko: '브릿지', ru: 'Мостик', zh: '桥式', de: 'Brücke', it: 'Ponte' },
      'Hip Escape': { ja: 'ヒップエスケープ', pt: 'Escape de Quadril', es: 'Escape de Cadera', fr: 'Échappement de Hanche', ko: '힙 이스케이프', ru: 'Побег бедрами', zh: '髋部逃脱', de: 'Hüft-Flucht', it: 'Fuga dell\'Anca' },
      'Shrimp': { ja: 'シュリンプ', pt: 'Camarão', es: 'Camarón', fr: 'Crevette', ko: '새우', ru: 'Креветка', zh: '虾式逃脱', de: 'Garnele', it: 'Gamberetto' },
      'Technical Stand Up': { ja: 'テクニカルスタンドアップ', pt: 'Levantada Técnica', es: 'Parada Técnica', fr: 'Relevé Technique', ko: '테크니컬 스탠드업', ru: 'Технический подъем', zh: '技术起身', de: 'Technisches Aufstehen', it: 'Alzata Tecnica' },
      'Granby Roll': { ja: 'グランビーロール', pt: 'Rolamento Granby', es: 'Rodamiento Granby', fr: 'Roulement Granby', ko: '그랜비 롤', ru: 'Гранби ролл', zh: '格兰比翻滚', de: 'Granby-Rolle', it: 'Rotolamento Granby' },

      // パッシング - Passing
      'Pass': { ja: 'パス', pt: 'Passagem', es: 'Pase', fr: 'Passer', ko: '패스', ru: 'Проход', zh: '过人', de: 'Pass', it: 'Passaggio' },
      'Guard Pass': { ja: 'ガードパス', pt: 'Passagem de Guarda', es: 'Pase de Guardia', fr: 'Passer la Garde', ko: '가드 패스', ru: 'Проход гвардии', zh: '过防守', de: 'Guard Pass', it: 'Passaggio di Guardia' },
      'Knee Cut': { ja: 'ニーカット', pt: 'Corte de Joelho', es: 'Corte de Rodilla', fr: 'Coupe de Genou', ko: '무릎 컷', ru: 'Разрез коленом', zh: '膝切', de: 'Knie-Schnitt', it: 'Taglio del Ginocchio' },
      'Toreando': { ja: 'トレアンド', pt: 'Toreando', es: 'Toreando', fr: 'Toréador', ko: '토레안도', ru: 'Тореандо', zh: '斗牛士', de: 'Toreando', it: 'Toreando' },
      'Pressure Pass': { ja: 'プレッシャーパス', pt: 'Passagem de Pressão', es: 'Pase de Presión', fr: 'Passe de Pression', ko: '프레셔 패스', ru: 'Давящий проход', zh: '压力过人', de: 'Druck-Pass', it: 'Passaggio di Pressione' },
      'Stack Pass': { ja: 'スタックパス', pt: 'Passagem Empilhada', es: 'Pase Apilado', fr: 'Passe Empilée', ko: '스택 패스', ru: 'Стековый проход', zh: '堆叠过人', de: 'Stapel-Pass', it: 'Passaggio Impilato' },
      'Long Step': { ja: 'ロングステップ', pt: 'Passo Longo', es: 'Paso Largo', fr: 'Grand Pas', ko: '롱 스텝', ru: 'Длинный шаг', zh: '长步', de: 'Langer Schritt', it: 'Passo Lungo' },
      'Over Under': { ja: 'オーバーアンダー', pt: 'Sobre e Sob', es: 'Sobre y Bajo', fr: 'Dessus Dessous', ko: '오버 언더', ru: 'Сверху снизу', zh: '上下交替', de: 'Über Unter', it: 'Sopra Sotto' },
      'Leg Drag': { ja: 'レッグドラッグ', pt: 'Arrasto de Perna', es: 'Arrastre de Pierna', fr: 'Traînée de Jambe', ko: '레그 드래그', ru: 'Протяжка ноги', zh: '腿拖', de: 'Bein-Zug', it: 'Trascinamento della Gamba' },

      // 投げ技 - Throws
      'Throw': { ja: '投げ技', pt: 'Projeção', es: 'Proyección', fr: 'Projection', ko: '던지기', ru: 'Бросок', zh: '摔技', de: 'Wurf', it: 'Proiezione' },
      'Takedown': { ja: 'テイクダウン', pt: 'Derrubada', es: 'Derribo', fr: 'Renversement', ko: '테이크다운', ru: 'Свалка', zh: '摔倒', de: 'Niederringen', it: 'Abbattimento' },
      'Double Leg': { ja: 'ダブルレッグ', pt: 'Dupla de Pernas', es: 'Doble Pierna', fr: 'Double Jambe', ko: '더블 레그', ru: 'Двойной подхват', zh: '双腿抱', de: 'Doppelbein', it: 'Doppia Gamba' },
      'Single Leg': { ja: 'シングルレッグ', pt: 'Perna Simples', es: 'Pierna Simple', fr: 'Jambe Simple', ko: '싱글 레그', ru: 'Одиночный подхват', zh: '单腿抱', de: 'Einzelbein', it: 'Gamba Singola' },
      'High Crotch': { ja: 'ハイクロッチ', pt: 'Virilha Alta', es: 'Ingle Alta', fr: 'Entrejambe Haut', ko: '하이 크로치', ru: 'Высокий захват', zh: '高位胯下', de: 'Hoher Schritt', it: 'Cavallo Alto' },
      'Ankle Pick': { ja: 'アンクルピック', pt: 'Pegada no Tornozelo', es: 'Agarre del Tobillo', fr: 'Prise de Cheville', ko: '발목 픽', ru: 'Захват лодыжки', zh: '脚踝摘', de: 'Knöchel-Pick', it: 'Presa della Caviglia' },
      'Blast Double': { ja: 'ブラストダブル', pt: 'Dupla Explosiva', es: 'Doble Explosivo', fr: 'Double Explosif', ko: '블라스트 더블', ru: 'Взрывной двойной', zh: '爆炸双腿', de: 'Explosives Doppel', it: 'Doppio Esplosivo' },

      // セットアップ - Setups
      'Setup': { ja: 'セットアップ', pt: 'Preparação', es: 'Preparación', fr: 'Préparation', ko: '세팅', ru: 'Настройка', zh: '设置', de: 'Vorbereitung', it: 'Preparazione' },
      'Grip': { ja: 'グリップ', pt: 'Pegada', es: 'Agarre', fr: 'Prise', ko: '그립', ru: 'Захват', zh: '握法', de: 'Griff', it: 'Presa' },
      'Collar Grip': { ja: 'カラーグリップ', pt: 'Pegada na Gola', es: 'Agarre del Cuello', fr: 'Prise au Col', ko: '칼라 그립', ru: 'Захват воротника', zh: '领抓', de: 'Kragengriff', it: 'Presa al Colletto' },
      'Sleeve Grip': { ja: 'スリーブグリップ', pt: 'Pegada na Manga', es: 'Agarre de la Manga', fr: 'Prise à la Manche', ko: '슬리브 그립', ru: 'Захват рукава', zh: '袖抓', de: 'Ärmelgriff', it: 'Presa alla Manica' },
      'Cross Grip': { ja: 'クロスグリップ', pt: 'Pegada Cruzada', es: 'Agarre Cruzado', fr: 'Prise Croisée', ko: '크로스 그립', ru: 'Перекрестный захват', zh: '交叉抓握', de: 'Kreuzgriff', it: 'Presa Incrociata' },
      'Same Side Grip': { ja: '同サイドグリップ', pt: 'Pegada do Mesmo Lado', es: 'Agarre del Mismo Lado', fr: 'Prise du Même Côté', ko: '같은쪽 그립', ru: 'Односторонний захват', zh: '同侧抓握', de: 'Gleichseitiger Griff', it: 'Presa dello Stesso Lato' },
      'Underhook': { ja: 'アンダーフック', pt: 'Gancho por Baixo', es: 'Gancho por Debajo', fr: 'Crochet Dessous', ko: '언더훅', ru: 'Подхват снизу', zh: '下勾', de: 'Unterhaken', it: 'Gancio Sotto' },
      'Overhook': { ja: 'オーバーフック', pt: 'Gancho por Cima', es: 'Gancho por Encima', fr: 'Crochet Dessus', ko: '오버훅', ru: 'Подхват сверху', zh: '上勾', de: 'Überhaken', it: 'Gancio Sopra' },

      // 基本動作 - Basic Movements
      'Roll': { ja: 'ロール', pt: 'Rolamento', es: 'Rodamiento', fr: 'Roulement', ko: '롤', ru: 'Перекат', zh: '翻滚', de: 'Rolle', it: 'Rotolamento' },
      'Forward Roll': { ja: 'フォワードロール', pt: 'Rolamento para Frente', es: 'Rodamiento Adelante', fr: 'Roulement Avant', ko: '앞굴리기', ru: 'Кувырок вперед', zh: '前滚', de: 'Vorwärtsrolle', it: 'Rotolamento in Avanti' },
      'Backward Roll': { ja: 'バックワードロール', pt: 'Rolamento para Trás', es: 'Rodamiento Atrás', fr: 'Roulement Arrière', ko: '뒤굴리기', ru: 'Кувырок назад', zh: '后滚', de: 'Rückwärtsrolle', it: 'Rotolamento all\'Indietro' },
      'Cartwheel': { ja: 'カートホイール', pt: 'Estrela', es: 'Rueda de Carro', fr: 'Roue', ko: '측전', ru: 'Колесо', zh: '侧手翻', de: 'Rad', it: 'Ruota' },
      'Breakfall': { ja: '受身', pt: 'Ukemi', es: 'Caída Segura', fr: 'Chute Sécurisée', ko: '낙법', ru: 'Страховка', zh: '受身', de: 'Fallschule', it: 'Caduta Sicura' },

      // 練習方法 - Training Methods
      'Drill': { ja: 'ドリル', pt: 'Exercício', es: 'Ejercicio', fr: 'Exercice', ko: '드릴', ru: 'Упражнение', zh: '训练', de: 'Übung', it: 'Esercizio' },
      'Sparring': { ja: 'スパーリング', pt: 'Luta Livre', es: 'Combate Libre', fr: 'Combat Libre', ko: '스파링', ru: 'Вольный бой', zh: '对练', de: 'Sparring', it: 'Sparring' },
      'Flow Rolling': { ja: 'フローローリング', pt: 'Rolamento Fluido', es: 'Rodamiento Fluido', fr: 'Roulement Fluide', ko: '플로우 롤링', ru: 'Текучий бой', zh: '流动训练', de: 'Fließendes Rollen', it: 'Rotolamento Fluido' },
      'Positional': { ja: 'ポジショナル', pt: 'Posicional', es: 'Posicional', fr: 'Positionnel', ko: '포지셔널', ru: 'Позиционный', zh: '位置训练', de: 'Positionell', it: 'Posizionale' },

      // その他の技術用語 - Other Technical Terms
      'Transition': { ja: 'トランジション', pt: 'Transição', es: 'Transición', fr: 'Transition', ko: '전환', ru: 'Переход', zh: '转换', de: 'Übergang', it: 'Transizione' },
      'Control': { ja: 'コントロール', pt: 'Controle', es: 'Control', fr: 'Contrôle', ko: '컨트롤', ru: 'Контроль', zh: '控制', de: 'Kontrolle', it: 'Controllo' },
      'Pressure': { ja: 'プレッシャー', pt: 'Pressão', es: 'Presión', fr: 'Pression', ko: '압박', ru: 'Давление', zh: '压力', de: 'Druck', it: 'Pressione' },
      'Base': { ja: 'ベース', pt: 'Base', es: 'Base', fr: 'Base', ko: '베이스', ru: 'База', zh: '基础', de: 'Basis', it: 'Base' },
      'Frame': { ja: 'フレーム', pt: 'Estrutura', es: 'Estructura', fr: 'Cadre', ko: '프레임', ru: 'Рама', zh: '框架', de: 'Rahmen', it: 'Telaio' },
      'Sprawl': { ja: 'スプロール', pt: 'Sprawl', es: 'Sprawl', fr: 'Sprawl', ko: '스프롤', ru: 'Спрол', zh: '躺身防守', de: 'Sprawl', it: 'Sprawl' },
      'Scramble': { ja: 'スクランブル', pt: 'Disputa', es: 'Disputa', fr: 'Mêlée', ko: '스크램블', ru: 'Схватка', zh: '争夺', de: 'Gerangel', it: 'Mischia' },
      'Counter': { ja: 'カウンター', pt: 'Contra-ataque', es: 'Contraataque', fr: 'Contre-attaque', ko: '카운터', ru: 'Контратака', zh: '反击', de: 'Konter', it: 'Contrattacco' },
      'Defense': { ja: 'ディフェンス', pt: 'Defesa', es: 'Defensa', fr: 'Défense', ko: '디펜스', ru: 'Защита', zh: '防御', de: 'Verteidigung', it: 'Difesa' },
      'Attack': { ja: 'アタック', pt: 'Ataque', es: 'Ataque', fr: 'Attaque', ko: '공격', ru: 'Атака', zh: '攻击', de: 'Angriff', it: 'Attacco' },

      // ポジション修飾語 - Position Modifiers
      'Top': { ja: 'トップ', pt: 'Em Cima', es: 'Arriba', fr: 'Dessus', ko: '탑', ru: 'Сверху', zh: '上位', de: 'Oben', it: 'Sopra' },
      'Bottom': { ja: 'ボトム', pt: 'Em Baixo', es: 'Abajo', fr: 'Dessous', ko: '바텀', ru: 'Снизу', zh: '下位', de: 'Unten', it: 'Sotto' },
      'Standing': { ja: 'スタンディング', pt: 'Em Pé', es: 'De Pie', fr: 'Debout', ko: '서있는', ru: 'Стоя', zh: '站立', de: 'Stehend', it: 'In Piedi' },
      'Sitting': { ja: 'シッティング', pt: 'Sentado', es: 'Sentado', fr: 'Assis', ko: '앉은', ru: 'Сидя', zh: '坐位', de: 'Sitzend', it: 'Seduto' },
    }

    // 完全一致を探す
    for (const [key, trans] of Object.entries(translations)) {
      if (text.toLowerCase().includes(key.toLowerCase()) && trans[toLang]) {
        return text.replace(new RegExp(key, 'gi'), trans[toLang])
      }
    }

    return text // 翻訳が見つからない場合は元のテキストを返す
  }

  const translateAllNodes = useCallback(async () => {
    if (isReadOnly) return
    
    const loadingToast = toast.loading(t.translating)
    
    try {
      setNodes(nodes => 
        nodes.map(node => {
          const currentLabel = node.data.label
          const translatedLabel = translateTechnique(currentLabel, 'en', language)
          
          return {
            ...node,
            data: {
              ...node.data,
              label: translatedLabel,
              multilingual: {
                ...node.data.multilingual,
                [language]: translatedLabel
              }
            }
          }
        })
      )
      
      toast.success(t.translationComplete, { id: loadingToast })
    } catch (error) {
      toast.error(t.translationError, { id: loadingToast })
    }
  }, [nodes, language, isReadOnly, setNodes, t])

  const saveFlow = async () => {
    if (!flowName.trim()) {
      toast.error(t.flowNameRequired)
      return
    }

    if (nodes.length === 0) {
      toast.error(t.addNodesFirst)
      return
    }

    if (!user) {
      toast.error(t.loginRequiredSave)
      return
    }

    try {
      // Supabaseに保存を試みる
      const { data, error } = await supabase
        .from('flows')
        .insert({
          user_id: user.id,
          name: flowName,
          nodes,
          edges,
          is_public: false,
        })
        .select()
        .single()

      if (error) {
        
        // 認証エラーの場合の処理
        if (error.message?.includes('authorization') || error.message?.includes('JWT') || error.message?.includes('auth')) {
          toast.error(t.loginRequiredSave)
          return
        }
        
        // テーブルが存在しない場合はLocalStorageに保存
        if (error.code === '42P01' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
          const flowData = {
            name: flowName,
            nodes,
            edges,
            createdAt: new Date().toISOString(),
          }
          
          const savedFlows = JSON.parse(localStorage.getItem('bjj-flows') || '[]')
          savedFlows.push(flowData)
          localStorage.setItem('bjj-flows', JSON.stringify(savedFlows))
          
          toast.success(
            t.flowSavedLocally,
            {
              icon: '💾',
              duration: 4000,
            }
          )
          return
        }
        
        throw error
      }

      toast.success(
        t.flowSaved,
        {
          icon: '✓',
          style: {
            background: 'linear-gradient(135deg, #1a1a23 0%, #2a2a33 100%)',
            color: '#fff',
            border: '1px solid #4ade80',
          },
          duration: 3000,
        }
      )
    } catch (error: any) {
      toast.error(
        `${t.saveError}: ${error.message}`
      )
    }
  }

  const exportFlow = () => {
    const flowData = {
      name: flowName,
      nodes,
      edges,
    }
    
    const dataStr = JSON.stringify(flowData, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `${flowName.replace(/\s+/g, '_')}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-bjj-accent"></div>
      </div>
    )
  }

  return (
    <MobileFlowWrapper>
      <main className="min-h-screen bg-bjj-bg">
        <DashboardNav />
      
      
      <div className={`${isMobileView ? 'flow-editor-mobile-container' : 'h-[calc(100vh-120px)]'} relative`} style={{ zIndex: 1 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDoubleClick={onNodeDoubleClick}
          nodesDraggable={true}
          nodesConnectable={true}
          elementsSelectable={true}
          fitView
          attributionPosition="bottom-left"
        >
          <Background color="#2a2a33" gap={16} />
          <Controls className="bg-bjj-bg2 border-white/10" />
          <MiniMap
            nodeColor="#ea384c"
            maskColor="#0f0f12ee"
            className="bg-bjj-bg2 border-white/10"
          />
          
          <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-bjj-bg2/90 backdrop-blur-sm border border-white/10 rounded-lg sm:rounded-bjj p-2 sm:p-4 max-w-[90%] sm:max-w-none z-10">
            <div className="mb-2 sm:mb-4">
              <div className="flex items-center gap-2 sm:gap-4">
                <input
                  type="text"
                  value={flowName}
                  onChange={(e) => {
                    setFlowName(e.target.value)
                    setCurrentFlowId(null) // 名前を変更したらカスタムフローとして扱う
                  }}
                  autoComplete="off"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck="false"
                  className="px-2 py-1 sm:px-3 sm:py-2 bg-bjj-bg border border-white/10 rounded-lg text-sm sm:text-base text-bjj-text focus:border-bjj-accent focus:outline-none w-full max-w-[150px] sm:max-w-none"
                  placeholder={t.flowName}
                />
                {currentFlowId && (
                  <button
                    onClick={() => {
                      setFlowName('')
                      setNodes(getInitialNodes(language, isMobileView))
                      setEdges(initialEdges)
                      setCurrentFlowId(null)
                      toast.success(t.newFlowStarted)
                    }}
                    className="text-xs text-bjj-muted hover:text-bjj-accent"
                    title={language === 'ja' ? '新規作成' : 'New'}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex gap-1 sm:gap-2 flex-wrap">
              {!isReadOnly && (
                <>
                  <button
                    onClick={() => {
                      console.log('Add node button clicked')
                      addNode()
                    }}
                    className="btn-ghost text-xs sm:text-sm flex items-center gap-1 sm:gap-2 px-2 py-1 sm:px-3 sm:py-2"
                    type="button"
                    style={{ position: 'relative', zIndex: 100 }}
                  >
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">{t.addNode}</span>
                    <span className="sm:hidden">+</span>
                  </button>
                  
                  <button
                    onClick={saveFlow}
                    className="btn-ghost text-xs sm:text-sm flex items-center gap-1 sm:gap-2 px-2 py-1 sm:px-3 sm:py-2"
                  >
                    <Save className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">{t.save}</span>
                  </button>
                  
                  <button
                    onClick={translateAllNodes}
                    className="btn-ghost text-xs sm:text-sm flex items-center gap-1 sm:gap-2 px-2 py-1 sm:px-3 sm:py-2"
                    title={t.translateFlow}
                  >
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                    </svg>
                    <span className="hidden sm:inline">{t.translateFlow}</span>
                  </button>
                </>
              )}
              
              {isReadOnly && (
                <div className="text-xs sm:text-sm text-bjj-muted px-2 py-1 sm:px-3 sm:py-2">
                  {t.readOnly}
                </div>
              )}
              
              <button
                onClick={exportFlow}
                className="btn-ghost text-xs sm:text-sm flex items-center gap-1 sm:gap-2 px-2 py-1 sm:px-3 sm:py-2"
              >
                <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{t.export}</span>
              </button>
            </div>
            
            {/* サンプルフローを表示（PC・モバイル共通） */}
            {publicFlows.length > 0 && (
              <div className="mt-2">
                <button
                  onClick={() => setShowFlowList(!showFlowList)}
                  className="text-xs sm:text-sm text-bjj-accent hover:text-bjj-accent/80 transition-colors"
                >
                  {showFlowList ? t.close : t.viewSampleFlows}
                </button>
                {showFlowList && (
                  <div className="mt-2 space-y-1 max-h-48 overflow-y-auto bg-bjj-bg/50 rounded-lg p-2">
                    {publicFlows.map((flow) => (
                      <button
                        key={flow.id}
                        onClick={() => loadFlow(flow)}
                        className={`block w-full text-left text-xs sm:text-sm p-2 rounded transition-colors ${
                          currentFlowId === flow.id 
                            ? 'bg-bjj-accent/20 border-l-2 border-bjj-accent' 
                            : 'hover:bg-bjj-bg2'
                        }`}
                        style={{ position: 'relative', zIndex: 100 }}
                      >
                        {flow.name}
                        {currentFlowId === flow.id && (
                          <span className="ml-2 text-bjj-accent">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* フローリストパネル（デスクトップ） */}
          <div className="hidden lg:block absolute top-4 right-4 w-64 max-h-[calc(100vh-200px)] bg-bjj-bg2/90 backdrop-blur-sm border border-white/10 rounded-bjj overflow-hidden z-10">
            <div className="p-4">
              <h3 className="text-sm font-bold text-bjj-text mb-3">
                {t.flowLibrary}
              </h3>
              {publicFlows.length > 0 ? (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {publicFlows.map((flow) => (
                    <button
                      key={flow.id}
                      onClick={() => loadFlow(flow)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        currentFlowId === flow.id
                          ? 'bg-bjj-accent/10 border-bjj-accent/50 ring-1 ring-bjj-accent/30'
                          : 'bg-bjj-bg hover:bg-bjj-bg/80 border-white/5 hover:border-bjj-accent/30'
                      }`}
                      style={{ position: 'relative', zIndex: 100 }}
                    >
                      <div className="flex items-start justify-between">
                        <h4 className="text-sm font-semibold text-bjj-text">{flow.name}</h4>
                        {currentFlowId === flow.id && (
                          <span className="text-bjj-accent text-xs">●</span>
                        )}
                      </div>
                      {flow.description && (
                        <p className="text-xs text-bjj-muted mt-1 line-clamp-2">{flow.description}</p>
                      )}
                      <div className="text-xs text-bjj-muted mt-2">
                        {flow.nodes?.length || 0} {t.nodes}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-bjj-muted">
                  {t.noFlowsAvailable}
                </p>
              )}
            </div>
            
            <div className="border-t border-white/10 p-4 mt-4">
              <h4 className="text-xs font-bold text-bjj-muted mb-2">
                {t.controls}
              </h4>
              <ul className="space-y-1 text-xs text-bjj-muted">
                <li>• {t.drag}</li>
                <li>• {t.dragFromNode}</li>
                <li>• {t.doubleClick}</li>
                <li>• {t.delete}</li>
              </ul>
            </div>
          </div>
        </ReactFlow>
        
        {/* ノード編集モーダル */}
        {editingNode && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={cancelNodeEdit}>
            <div className="bg-bjj-bg2 rounded-lg p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-bold mb-4">{t.editNode}</h3>
              <input
                type="text"
                value={editingText}
                onChange={(e) => setEditingText(e.target.value)}
                placeholder={t.nodeEditPlaceholder}
                className="w-full px-3 py-2 bg-bjj-bg border border-white/10 rounded-lg text-bjj-text focus:border-bjj-accent focus:outline-none mb-4"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    saveNodeEdit()
                  } else if (e.key === 'Escape') {
                    cancelNodeEdit()
                  }
                }}
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={cancelNodeEdit}
                  className="px-4 py-2 text-bjj-muted hover:text-bjj-text transition-colors"
                >
                  {t.close}
                </button>
                <button
                  onClick={saveNodeEdit}
                  className="btn-primary"
                >
                  {t.save}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
    </MobileFlowWrapper>
  )
}