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

  // 基本的な翻訳辞書
  const translateTechnique = (text: string, fromLang: string, toLang: string) => {
    const translations: Record<string, Record<string, string>> = {
      'Guard': { ja: 'ガード', pt: 'Guarda', es: 'Guardia', fr: 'Garde', ko: '가드', ru: 'Гвардия', zh: '防守', de: 'Guard', it: 'Guardia' },
      'Closed Guard': { ja: 'クローズドガード', pt: 'Guarda Fechada', es: 'Guardia Cerrada', fr: 'Garde Fermée', ko: '클로즈드 가드', ru: 'Закрытая гвардия', zh: '封闭式防守', de: 'Geschlossene Guard', it: 'Guardia Chiusa' },
      'Open Guard': { ja: 'オープンガード', pt: 'Guarda Aberta', es: 'Guardia Abierta', fr: 'Garde Ouverte', ko: '오픈 가드', ru: 'Открытая гвардия', zh: '开放式防守', de: 'Offene Guard', it: 'Guardia Aperta' },
      'Sweep': { ja: 'スイープ', pt: 'Raspagem', es: 'Barrida', fr: 'Balayage', ko: '스윕', ru: 'Свип', zh: '扫倒', de: 'Sweep', it: 'Spazzata' },
      'Arm Drag': { ja: 'アームドラッグ', pt: 'Arm Drag', es: 'Arm Drag', fr: 'Arm Drag', ko: '암 드래그', ru: 'Арм драг', zh: '手臂拖拽', de: 'Arm Drag', it: 'Arm Drag' },
      'Kimura': { ja: 'キムラ', pt: 'Kimura', es: 'Kimura', fr: 'Kimura', ko: '키무라', ru: 'Кимура', zh: '木村锁', de: 'Kimura', it: 'Kimura' },
      'Armbar': { ja: 'アームバー', pt: 'Chave de Braço', es: 'Palanca de Brazo', fr: 'Clé de Bras', ko: '팔꺾기', ru: 'Рычаг локтя', zh: '手臂锁', de: 'Armhebel', it: 'Leva al Braccio' },
      'Triangle': { ja: 'トライアングル', pt: 'Triângulo', es: 'Triángulo', fr: 'Triangle', ko: '트라이앵글', ru: 'Треугольник', zh: '三角锁', de: 'Dreieck', it: 'Triangolo' },
      'Mount': { ja: 'マウント', pt: 'Montada', es: 'Montada', fr: 'Montée', ko: '마운트', ru: 'Маунт', zh: '骑乘位', de: 'Mount', it: 'Montata' },
      'Back Control': { ja: 'バックコントロール', pt: 'Controle das Costas', es: 'Control de Espalda', fr: 'Contrôle du Dos', ko: '백 컨트롤', ru: 'Контроль спины', zh: '背部控制', de: 'Rückenkontrolle', it: 'Controllo della Schiena' },
      'Side Control': { ja: 'サイドコントロール', pt: 'Controle Lateral', es: 'Control Lateral', fr: 'Contrôle Latéral', ko: '사이드 컨트롤', ru: 'Боковой контроль', zh: '侧面控制', de: 'Seitenkontrolle', it: 'Controllo Laterale' },
      'Half Guard': { ja: 'ハーフガード', pt: 'Meia Guarda', es: 'Media Guardia', fr: 'Demi-Garde', ko: '하프 가드', ru: 'Полугвардия', zh: '半防守', de: 'Halbe Guard', it: 'Mezza Guardia' },
      'Butterfly Guard': { ja: 'バタフライガード', pt: 'Guarda Borboleta', es: 'Guardia Mariposa', fr: 'Garde Papillon', ko: '버터플라이 가드', ru: 'Гвардия бабочка', zh: '蝴蝶防守', de: 'Schmetterling Guard', it: 'Guardia Farfalla' },
      'Spider Guard': { ja: 'スパイダーガード', pt: 'Guarda Aranha', es: 'Guardia Araña', fr: 'Garde Araignée', ko: '스파이더 가드', ru: 'Паучья гвардия', zh: '蜘蛛防守', de: 'Spinnen Guard', it: 'Guardia Ragno' },
      'De La Riva': { ja: 'デラヒーバ', pt: 'De La Riva', es: 'De La Riva', fr: 'De La Riva', ko: '델라히바', ru: 'Де ла Рива', zh: '德拉里瓦', de: 'De La Riva', it: 'De La Riva' },
      'Berimbolo': { ja: 'ベリンボロ', pt: 'Berimbolo', es: 'Berimbolo', fr: 'Berimbolo', ko: '베림볼로', ru: 'Беримболо', zh: '贝林博洛', de: 'Berimbolo', it: 'Berimbolo' },
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