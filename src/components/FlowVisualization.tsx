'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'

interface Technique {
  id: number
  name: { [key: string]: string }
  x: number
  y: number
  slug: string
}

interface Connection {
  from: number
  to: number
  label: { [key: string]: string }
}

const techniques: Technique[] = [
  { 
    id: 1, 
    name: { ja: 'クローズドガード', en: 'Closed Guard', pt: 'Guarda Fechada' }, 
    x: 150, y: 200, slug: 'closed-guard' 
  },
  { 
    id: 2, 
    name: { ja: 'アームドラッグ', en: 'Arm Drag', pt: 'Arm Drag' }, 
    x: 350, y: 150, slug: 'arm-drag' 
  },
  { 
    id: 3, 
    name: { ja: 'バックテイク', en: 'Back Take', pt: 'Pegada das Costas' }, 
    x: 550, y: 180, slug: 'back-take' 
  },
  { 
    id: 4, 
    name: { ja: 'チョーク', en: 'Choke', pt: 'Estrangulamento' }, 
    x: 750, y: 200, slug: 'choke' 
  },
  { 
    id: 5, 
    name: { ja: 'スイープ', en: 'Sweep', pt: 'Raspagem' }, 
    x: 350, y: 250, slug: 'sweep' 
  },
  { 
    id: 6, 
    name: { ja: 'マウント', en: 'Mount', pt: 'Montada' }, 
    x: 550, y: 280, slug: 'mount' 
  },
]

const connections: Connection[] = [
  { 
    from: 1, to: 2, 
    label: { ja: '腕を引く', en: 'Pull arm', pt: 'Puxar braço' } 
  },
  { 
    from: 2, to: 3, 
    label: { ja: '背後へ', en: 'To back', pt: 'Para as costas' } 
  },
  { 
    from: 3, to: 4, 
    label: { ja: '首を攻める', en: 'Attack neck', pt: 'Atacar pescoço' } 
  },
  { 
    from: 1, to: 5, 
    label: { ja: '体重移動', en: 'Weight shift', pt: 'Transferência de peso' } 
  },
  { 
    from: 5, to: 6, 
    label: { ja: 'トップへ', en: 'To top', pt: 'Para cima' } 
  },
]

export default function FlowVisualization() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const progressRef = useRef(0)
  const router = useRouter()
  const [hoveredNode, setHoveredNode] = useState<number | null>(null)
  const { language } = useLanguage()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const updateCanvasSize = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }

    updateCanvasSize()
    window.addEventListener('resize', updateCanvasSize)

    // Handle mouse events
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      let foundNode = false
      techniques.forEach((tech) => {
        const distance = Math.sqrt((x - tech.x) ** 2 + (y - tech.y) ** 2)
        if (distance < 25) {
          setHoveredNode(tech.id)
          canvas.style.cursor = 'pointer'
          foundNode = true
        }
      })
      
      if (!foundNode) {
        setHoveredNode(null)
        canvas.style.cursor = 'default'
      }
    }

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      techniques.forEach((tech) => {
        const distance = Math.sqrt((x - tech.x) ** 2 + (y - tech.y) ** 2)
        if (distance < 25) {
          router.push(`/videos/${tech.slug}`)
        }
      })
    }

    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('click', handleClick)

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      progressRef.current += 0.005
      if (progressRef.current > 1) progressRef.current = 0

      // Draw connections
      ctx.strokeStyle = '#ffffff30'
      ctx.lineWidth = 2
      connections.forEach((conn) => {
        const from = techniques.find(t => t.id === conn.from)!
        const to = techniques.find(t => t.id === conn.to)!
        
        ctx.beginPath()
        ctx.moveTo(from.x, from.y)
        
        // Add curve
        const midX = (from.x + to.x) / 2
        const midY = (from.y + to.y) / 2 - 30
        ctx.quadraticCurveTo(midX, midY, to.x, to.y)
        ctx.stroke()

        // Draw arrow
        const angle = Math.atan2(to.y - midY, to.x - midX)
        const arrowSize = 8
        ctx.beginPath()
        ctx.moveTo(to.x, to.y)
        ctx.lineTo(
          to.x - arrowSize * Math.cos(angle - Math.PI / 6),
          to.y - arrowSize * Math.sin(angle - Math.PI / 6)
        )
        ctx.moveTo(to.x, to.y)
        ctx.lineTo(
          to.x - arrowSize * Math.cos(angle + Math.PI / 6),
          to.y - arrowSize * Math.sin(angle + Math.PI / 6)
        )
        ctx.stroke()

        // Draw label
        ctx.fillStyle = '#b7b7c2'
        ctx.font = '12px sans-serif'
        ctx.fillText(conn.label[language], midX - 20, midY - 10)
      })

      // Draw nodes
      techniques.forEach((tech, index) => {
        const delay = index * 0.15
        const nodeProgress = Math.max(0, Math.min(1, (progressRef.current - delay) * 2))
        const isHovered = hoveredNode === tech.id
        
        // Outer circle
        ctx.strokeStyle = isHovered ? '#ea384c' : '#ffffff30'
        ctx.fillStyle = isHovered ? '#ea384c20' : '#ffffff10'
        ctx.lineWidth = isHovered ? 3 : 2
        ctx.beginPath()
        ctx.arc(tech.x, tech.y, 25 * nodeProgress * (isHovered ? 1.1 : 1), 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
        ctx.lineWidth = 2

        // Inner circle
        ctx.fillStyle = '#ea384c'
        ctx.beginPath()
        ctx.arc(tech.x, tech.y, 8 * nodeProgress * (isHovered ? 1.2 : 1), 0, Math.PI * 2)
        ctx.fill()

        // Text
        if (nodeProgress > 0.5) {
          ctx.fillStyle = isHovered ? '#ea384c' : '#e9e9ee'
          ctx.font = isHovered ? 'bold 14px sans-serif' : '14px sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText(tech.name[language], tech.x, tech.y + 45)
        }
      })

      // Draw flow indicator
      const flowProgress = progressRef.current
      connections.forEach((conn, index) => {
        if (index !== Math.floor(flowProgress * connections.length)) return
        
        const from = techniques.find(t => t.id === conn.from)!
        const to = techniques.find(t => t.id === conn.to)!
        const localProgress = (flowProgress * connections.length) % 1

        const x = from.x + (to.x - from.x) * localProgress
        const y = from.y + (to.y - from.y) * localProgress

        ctx.fillStyle = '#ea384c'
        ctx.beginPath()
        ctx.arc(x, y, 6, 0, Math.PI * 2)
        ctx.fill()

        // Glow effect
        ctx.shadowBlur = 20
        ctx.shadowColor = '#ea384c'
        ctx.fill()
        ctx.shadowBlur = 0
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', updateCanvasSize)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('click', handleClick)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [hoveredNode, router, language])

  return (
    <div className="relative w-full h-full min-h-[400px] bg-gradient-to-br from-bjj-bg2 to-bjj-bg rounded-bjj overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ width: '100%', height: '100%' }}
      />
      <div className="absolute top-4 left-4 text-sm text-bjj-muted">
        <span className="text-bjj-accent">●</span> 
        {language === 'ja' && '技術の連携フロー'}
        {language === 'en' && 'Technique Flow'}
        {language === 'pt' && 'Fluxo de Técnicas'}
      </div>
    </div>
  )
}