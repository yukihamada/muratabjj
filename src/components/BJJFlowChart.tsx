'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'

interface FlowNode {
  id: string
  label: { [key: string]: string }
  children?: FlowNode[]
  description?: { [key: string]: string }
}

const bjjFlowData: FlowNode = {
  id: 'start',
  label: { ja: 'スタート', en: 'Start', pt: 'Início' },
  children: [
    {
      id: 'standing',
      label: { ja: '立技', en: 'Standing', pt: 'Em Pé' },
      children: [
        {
          id: 'takedown',
          label: { ja: 'テイクダウン', en: 'Takedown', pt: 'Queda' },
          children: [
            {
              id: 'single-leg',
              label: { ja: 'シングルレッグ', en: 'Single Leg', pt: 'Single Leg' },
              description: { ja: '片足タックル', en: 'Single leg takedown', pt: 'Queda de uma perna' }
            },
            {
              id: 'double-leg',
              label: { ja: 'ダブルレッグ', en: 'Double Leg', pt: 'Double Leg' },
              description: { ja: '両足タックル', en: 'Double leg takedown', pt: 'Queda de duas pernas' }
            },
            {
              id: 'uchimata',
              label: { ja: '内股', en: 'Uchi Mata', pt: 'Uchi Mata' },
              description: { ja: '柔道技の応用', en: 'Judo technique application', pt: 'Aplicação de técnica de judô' }
            },
            {
              id: 'seoi-nage',
              label: { ja: '背負投', en: 'Seoi Nage', pt: 'Seoi Nage' },
              description: { ja: '柔道技の応用', en: 'Judo technique application', pt: 'Aplicação de técnica de judô' }
            },
            {
              id: 'ankle-pick',
              label: { ja: 'アンクルピック', en: 'Ankle Pick', pt: 'Ankle Pick' },
              description: { ja: '足首を取るテイクダウン', en: 'Ankle grab takedown', pt: 'Queda pegando o tornozelo' }
            },
            {
              id: 'arm-drag-takedown',
              label: { ja: 'アームドラッグ', en: 'Arm Drag', pt: 'Arm Drag' },
              description: { ja: '腕を引いて背後へ', en: 'Pull arm to back', pt: 'Puxar braço para as costas' }
            },
            {
              id: 'snap-down',
              label: { ja: 'スナップダウン', en: 'Snap Down', pt: 'Snap Down' },
              description: { ja: '頭を押さえて崩す', en: 'Head control takedown', pt: 'Queda controlando a cabeça' }
            },
            {
              id: 'low-single',
              label: { ja: 'ローシングル', en: 'Low Single', pt: 'Low Single' },
              description: { ja: '低い片足タックル', en: 'Low single leg', pt: 'Single leg baixo' }
            }
          ]
        },
        {
          id: 'guard-pull',
          label: { ja: 'ガードプル', en: 'Guard Pull', pt: 'Puxar Guarda' },
          children: [
            {
              id: 'closed-guard-pull',
              label: { ja: 'クローズドガード', en: 'Closed Guard', pt: 'Guarda Fechada' },
              description: { ja: '基本的なガード', en: 'Basic guard', pt: 'Guarda básica' }
            },
            {
              id: 'open-guard-pull',
              label: { ja: 'オープンガード系', en: 'Open Guard Systems', pt: 'Sistemas de Guarda Aberta' },
              children: [
                {
                  id: 'de-la-riva',
                  label: { ja: 'デラヒーバ', en: 'De La Riva', pt: 'De La Riva' },
                  description: { ja: '足を絡めるガード', en: 'Leg entanglement guard', pt: 'Guarda com enrosco de perna' }
                },
                {
                  id: 'spider-guard',
                  label: { ja: 'スパイダーガード', en: 'Spider Guard', pt: 'Guarda Aranha' },
                  description: { ja: '袖を使ったガード', en: 'Sleeve-based guard', pt: 'Guarda usando mangas' }
                },
                {
                  id: 'butterfly-guard',
                  label: { ja: 'バタフライガード', en: 'Butterfly Guard', pt: 'Guarda Borboleta' },
                  description: { ja: '両足フックのガード', en: 'Double hook guard', pt: 'Guarda com ganchos duplos' }
                },
                {
                  id: 'x-guard',
                  label: { ja: 'Xガード', en: 'X-Guard', pt: 'Guarda X' },
                  description: { ja: '足でXを作るガード', en: 'X-shaped leg guard', pt: 'Guarda com pernas em X' }
                },
                {
                  id: 'lasso-guard',
                  label: { ja: 'ラッソーガード', en: 'Lasso Guard', pt: 'Guarda Laço' },
                  description: { ja: '足と袖で輪を作るガード', en: 'Loop with leg and sleeve', pt: 'Laço com perna e manga' }
                },
                {
                  id: 'worm-guard',
                  label: { ja: 'ワームガード', en: 'Worm Guard', pt: 'Guarda Minhoca' },
                  description: { ja: 'ラペルを使ったガード', en: 'Lapel-based guard', pt: 'Guarda usando lapela' }
                },
                {
                  id: 'reverse-de-la-riva',
                  label: { ja: 'リバースデラヒーバ', en: 'Reverse De La Riva', pt: 'De La Riva Invertida' },
                  description: { ja: '逆側の足を絡めるガード', en: 'Opposite leg entanglement', pt: 'Enrosco de perna oposta' }
                },
                {
                  id: 'single-leg-x',
                  label: { ja: 'シングルレッグX', en: 'Single Leg X', pt: 'X de Uma Perna' },
                  description: { ja: '片足のXガード', en: 'One leg X-guard', pt: 'Guarda X com uma perna' }
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'ground',
      label: { ja: '寝技', en: 'Ground Game', pt: 'Jogo de Solo' },
      children: [
        {
          id: 'top-position',
          label: { ja: 'トップポジション', en: 'Top Position', pt: 'Posição Superior' },
          children: [
            {
              id: 'side-control',
              label: { ja: 'サイドコントロール', en: 'Side Control', pt: 'Controle Lateral' },
              children: [
                {
                  id: 'knee-on-belly',
                  label: { ja: 'ニーオンベリー', en: 'Knee on Belly', pt: 'Joelho na Barriga' },
                  description: { ja: '膝で圧力をかける', en: 'Applying pressure with knee', pt: 'Aplicando pressão com o joelho' }
                },
                {
                  id: 'north-south',
                  label: { ja: 'ノースサウス', en: 'North-South', pt: 'Norte-Sul' },
                  description: { ja: '頭側のコントロール', en: 'Head-side control', pt: 'Controle pelo lado da cabeça' }
                }
              ]
            },
            {
              id: 'mount',
              label: { ja: 'マウント', en: 'Mount', pt: 'Montada' },
              children: [
                {
                  id: 'high-mount',
                  label: { ja: 'ハイマウント', en: 'High Mount', pt: 'Montada Alta' },
                  description: { ja: '脇下でのマウント', en: 'Mount under armpits', pt: 'Montada sob as axilas' }
                },
                {
                  id: 'technical-mount',
                  label: { ja: 'テクニカルマウント', en: 'Technical Mount', pt: 'Montada Técnica' },
                  description: { ja: 'S字マウント', en: 'S-mount', pt: 'Montada em S' }
                }
              ]
            },
            {
              id: 'back-control',
              label: { ja: 'バックコントロール', en: 'Back Control', pt: 'Controle das Costas' },
              description: { ja: '最も有利なポジション', en: 'Most dominant position', pt: 'Posição mais dominante' }
            }
          ]
        },
        {
          id: 'bottom-position',
          label: { ja: 'ボトムポジション', en: 'Bottom Position', pt: 'Posição Inferior' },
          children: [
            {
              id: 'closed-guard',
              label: { ja: 'クローズドガード', en: 'Closed Guard', pt: 'Guarda Fechada' },
              children: [
                {
                  id: 'armbar-from-guard',
                  label: { ja: 'アームバー', en: 'Armbar', pt: 'Armlock' },
                  description: { ja: '腕十字', en: 'Arm lock', pt: 'Chave de braço' }
                },
                {
                  id: 'triangle-from-guard',
                  label: { ja: 'トライアングル', en: 'Triangle', pt: 'Triângulo' },
                  description: { ja: '三角絞め', en: 'Triangle choke', pt: 'Estrangulamento triângulo' }
                },
                {
                  id: 'sweep-from-guard',
                  label: { ja: 'スイープ', en: 'Sweep', pt: 'Raspagem' },
                  description: { ja: '返し技', en: 'Reversal technique', pt: 'Técnica de reversão' }
                }
              ]
            },
            {
              id: 'half-guard',
              label: { ja: 'ハーフガード', en: 'Half Guard', pt: 'Meia-Guarda' },
              children: [
                {
                  id: 'deep-half',
                  label: { ja: 'ディープハーフ', en: 'Deep Half', pt: 'Meia-Guarda Profunda' },
                  description: { ja: '深いハーフガード', en: 'Deep half guard', pt: 'Meia-guarda profunda' }
                },
                {
                  id: 'lockdown',
                  label: { ja: 'ロックダウン', en: 'Lockdown', pt: 'Lockdown' },
                  description: { ja: '足を絡めるハーフ', en: 'Leg-entangled half guard', pt: 'Meia-guarda com pernas enroscadas' }
                },
                {
                  id: 'knee-shield',
                  label: { ja: 'ニーシールド', en: 'Knee Shield', pt: 'Escudo de Joelho' },
                  description: { ja: '膝で防御するハーフ', en: 'Knee blocking half guard', pt: 'Meia-guarda com bloqueio de joelho' }
                },
                {
                  id: 'z-guard',
                  label: { ja: 'Zガード', en: 'Z-Guard', pt: 'Guarda Z' },
                  description: { ja: '足でZ字を作るハーフ', en: 'Z-shaped half guard', pt: 'Meia-guarda em forma de Z' }
                }
              ]
            },
            {
              id: 'turtle',
              label: { ja: 'タートル', en: 'Turtle', pt: 'Tartaruga' },
              description: { ja: '亀の防御姿勢', en: 'Defensive turtle position', pt: 'Posição defensiva de tartaruga' }
            },
            {
              id: 'inverted-guard',
              label: { ja: 'インバーテッドガード', en: 'Inverted Guard', pt: 'Guarda Invertida' },
              description: { ja: '逆さまのガード', en: 'Upside-down guard', pt: 'Guarda de cabeça para baixo' }
            },
            {
              id: '50-50',
              label: { ja: '50/50', en: '50/50', pt: '50/50' },
              description: { ja: '両者の足が絡む', en: 'Mutual leg entanglement', pt: 'Enrosco mútuo de pernas' }
            }
          ]
        }
      ]
    },
    {
      id: 'submissions',
      label: { ja: 'サブミッション', en: 'Submissions', pt: 'Finalizações' },
      children: [
        {
          id: 'chokes',
          label: { ja: 'チョーク・絞め技', en: 'Chokes', pt: 'Estrangulamentos' },
          children: [
            {
              id: 'rear-naked-choke',
              label: { ja: 'リアネイキッドチョーク', en: 'Rear Naked Choke', pt: 'Mata-Leão' },
              description: { ja: '裸絞め', en: 'Blood choke from back', pt: 'Estrangulamento pelas costas' }
            },
            {
              id: 'guillotine',
              label: { ja: 'ギロチン', en: 'Guillotine', pt: 'Guilhotina' },
              description: { ja: '前方からの絞め', en: 'Front choke', pt: 'Estrangulamento frontal' }
            },
            {
              id: 'triangle-choke',
              label: { ja: 'トライアングル', en: 'Triangle', pt: 'Triângulo' },
              description: { ja: '三角絞め', en: 'Triangle choke', pt: 'Estrangulamento triângulo' }
            },
            {
              id: 'ezekiel',
              label: { ja: 'エゼキエル', en: 'Ezekiel', pt: 'Ezequiel' },
              description: { ja: '袖車絞め', en: 'Sleeve choke', pt: 'Estrangulamento com manga' }
            },
            {
              id: 'bow-and-arrow',
              label: { ja: 'ボウアンドアロー', en: 'Bow and Arrow', pt: 'Arco e Flecha' },
              description: { ja: '弓矢絞め', en: 'Lapel choke from back', pt: 'Estrangulamento com lapela' }
            },
            {
              id: 'darce',
              label: { ja: 'ダース', en: "D'Arce", pt: "D'Arce" },
              description: { ja: '腕を巻き込む絞め', en: 'Arm-in choke', pt: 'Estrangulamento com braço' }
            },
            {
              id: 'anaconda',
              label: { ja: 'アナコンダ', en: 'Anaconda', pt: 'Anaconda' },
              description: { ja: '前方から巻く絞め', en: 'Front headlock choke', pt: 'Estrangulamento frontal enrolado' }
            }
          ]
        },
        {
          id: 'joint-locks',
          label: { ja: '関節技', en: 'Joint Locks', pt: 'Chaves de Articulação' },
          children: [
            {
              id: 'armbar',
              label: { ja: 'アームバー', en: 'Armbar', pt: 'Armlock' },
              description: { ja: '腕十字', en: 'Arm lock', pt: 'Chave de braço' }
            },
            {
              id: 'kimura',
              label: { ja: 'キムラ', en: 'Kimura', pt: 'Kimura' },
              description: { ja: '肩固め', en: 'Shoulder lock', pt: 'Chave de ombro' }
            },
            {
              id: 'americana',
              label: { ja: 'アメリカーナ', en: 'Americana', pt: 'Americana' },
              description: { ja: 'V字固め', en: 'Keylock', pt: 'Chave americana' }
            },
            {
              id: 'omoplata',
              label: { ja: 'オモプラータ', en: 'Omoplata', pt: 'Omoplata' },
              description: { ja: '肩固め（足）', en: 'Shoulder lock with legs', pt: 'Chave de ombro com pernas' }
            },
            {
              id: 'wrist-lock',
              label: { ja: 'リストロック', en: 'Wrist Lock', pt: 'Chave de Pulso' },
              description: { ja: '手首固め', en: 'Wrist joint lock', pt: 'Chave de articulação do pulso' }
            }
          ]
        },
        {
          id: 'leg-locks',
          label: { ja: 'レッグロック', en: 'Leg Locks', pt: 'Chaves de Perna' },
          children: [
            {
              id: 'straight-ankle',
              label: { ja: 'アンクルロック', en: 'Straight Ankle Lock', pt: 'Chave de Tornozelo' },
              description: { ja: '足首固め', en: 'Ankle lock', pt: 'Chave de tornozelo reta' }
            },
            {
              id: 'knee-bar',
              label: { ja: 'ニーバー', en: 'Knee Bar', pt: 'Chave de Joelho' },
              description: { ja: '膝十字', en: 'Knee lock', pt: 'Chave de joelho' }
            },
            {
              id: 'heel-hook',
              label: { ja: 'ヒールフック', en: 'Heel Hook', pt: 'Heel Hook' },
              description: { ja: 'かかと固め', en: 'Heel rotation lock', pt: 'Torção de calcanhar' }
            },
            {
              id: 'toe-hold',
              label: { ja: 'トーホールド', en: 'Toe Hold', pt: 'Toe Hold' },
              description: { ja: '足指固め', en: 'Foot twist lock', pt: 'Torção do pé' }
            },
            {
              id: 'calf-slicer',
              label: { ja: 'カーフスライサー', en: 'Calf Slicer', pt: 'Calf Slicer' },
              description: { ja: 'ふくらはぎ圧迫', en: 'Calf compression', pt: 'Compressão da panturrilha' }
            }
          ]
        }
      ]
    },
    {
      id: 'escapes',
      label: { ja: 'エスケープ', en: 'Escapes', pt: 'Escapadas' },
      children: [
        {
          id: 'mount-escapes',
          label: { ja: 'マウントエスケープ', en: 'Mount Escapes', pt: 'Escapadas da Montada' },
          children: [
            {
              id: 'upa',
              label: { ja: 'ウパ', en: 'Upa', pt: 'Upa' },
              description: { ja: 'ブリッジ返し', en: 'Bridge escape', pt: 'Escape com ponte' }
            },
            {
              id: 'elbow-escape',
              label: { ja: 'エルボーエスケープ', en: 'Elbow Escape', pt: 'Escape de Cotovelo' },
              description: { ja: '肘を使った脱出', en: 'Shrimp escape', pt: 'Escape camarão' }
            }
          ]
        },
        {
          id: 'side-control-escapes',
          label: { ja: 'サイドエスケープ', en: 'Side Control Escapes', pt: 'Escapadas do Controle Lateral' },
          children: [
            {
              id: 'frame-escape',
              label: { ja: 'フレームエスケープ', en: 'Frame Escape', pt: 'Escape com Frame' },
              description: { ja: 'フレームを作って脱出', en: 'Create frames to escape', pt: 'Criar frames para escapar' }
            },
            {
              id: 'underhook-escape',
              label: { ja: 'アンダーフック', en: 'Underhook Escape', pt: 'Escape com Underhook' },
              description: { ja: '下から腕を差す', en: 'Get underhook to escape', pt: 'Conseguir underhook para escapar' }
            }
          ]
        },
        {
          id: 'back-escapes',
          label: { ja: 'バックエスケープ', en: 'Back Escapes', pt: 'Escapadas das Costas' },
          children: [
            {
              id: 'hand-fight',
              label: { ja: 'ハンドファイト', en: 'Hand Fighting', pt: 'Luta de Mãos' },
              description: { ja: '手の防御', en: 'Defend hands', pt: 'Defender as mãos' }
            },
            {
              id: 'slide-out',
              label: { ja: 'スライドアウト', en: 'Slide Out', pt: 'Deslizar' },
              description: { ja: '滑り落ちる脱出', en: 'Slide to escape', pt: 'Deslizar para escapar' }
            }
          ]
        }
      ]
    }
  ]
}

export default function BJJFlowChart() {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['start']))
  const [selectedNode, setSelectedNode] = useState<FlowNode | null>(null)
  const { language } = useLanguage()
  const router = useRouter()

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId)
    } else {
      newExpanded.add(nodeId)
    }
    setExpandedNodes(newExpanded)
  }

  const renderNode = (node: FlowNode, level: number = 0) => {
    const isExpanded = expandedNodes.has(node.id)
    const hasChildren = node.children && node.children.length > 0
    const isSelected = selectedNode?.id === node.id

    return (
      <div key={node.id} className={`${level > 0 ? 'ml-6' : ''}`}>
        <div
          className={`
            flex items-center gap-2 p-3 rounded-lg cursor-pointer
            transition-all duration-200 transform hover:scale-[1.02]
            ${isSelected ? 'bg-bjj-accent text-white' : 'bg-bjj-bg2 hover:bg-bjj-bg2/80'}
            ${level === 0 ? 'text-lg font-bold' : level === 1 ? 'font-semibold' : ''}
          `}
          onClick={() => {
            if (hasChildren) {
              toggleNode(node.id)
            }
            setSelectedNode(node)
          }}
        >
          {hasChildren && (
            <svg
              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
          <span>{node.label[language]}</span>
          {node.description && (
            <span className="text-sm text-bjj-muted ml-2">({node.description[language]})</span>
          )}
        </div>
        
        {hasChildren && isExpanded && (
          <div className="mt-2 border-l-2 border-bjj-accent/30 ml-2">
            {node.children!.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <section className="py-16 md:py-24 bg-bjj-bg">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
          {language === 'ja' && 'BJJ技術フローチャート'}
          {language === 'en' && 'BJJ Technique Flowchart'}
          {language === 'pt' && 'Fluxograma de Técnicas de BJJ'}
        </h2>
      
        <div className="max-w-5xl mx-auto">
          <div className="bg-bjj-bg2 rounded-bjj p-6 border border-white/10">
            <div className="mb-6">
              <p className="text-bjj-muted text-sm text-center">
                {language === 'ja' && 'クリックして展開・選択できます。矢印アイコンがある項目は、さらに詳細な技術に分岐します。'}
                {language === 'en' && 'Click to expand and select. Items with arrow icons branch into more detailed techniques.'}
                {language === 'pt' && 'Clique para expandir e selecionar. Itens com ícones de seta se ramificam em técnicas mais detalhadas.'}
              </p>
            </div>
            
            <div className="animate-fade-in">
              {renderNode(bjjFlowData)}
            </div>
          </div>

          {selectedNode && selectedNode.id !== 'start' && (
            <div className="mt-6 p-6 bg-gradient-to-r from-bjj-accent/10 to-bjj-accent/5 rounded-bjj border border-bjj-accent/30 animate-scale-in">
              <h3 className="font-bold text-xl mb-3">{selectedNode.label[language]}</h3>
              {selectedNode.description && (
                <p className="text-bjj-muted mb-4">{selectedNode.description[language]}</p>
              )}
              <button 
                onClick={() => {
                  // Navigate to videos page with search query for the selected technique
                  const searchQuery = selectedNode.label[language]
                  router.push(`/dashboard/videos?search=${encodeURIComponent(searchQuery)}`)
                }}
                className="px-6 py-3 bg-bjj-accent text-white rounded-bjj hover:bg-bjj-accent/90 transition-all duration-200 transform hover:scale-105"
              >
                {language === 'ja' && 'この技術の動画を見る →'}
                {language === 'en' && 'Watch videos for this technique →'}
                {language === 'pt' && 'Assistir vídeos desta técnica →'}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}