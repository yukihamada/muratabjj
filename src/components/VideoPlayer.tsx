'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import AuthDialog from './AuthDialog'

interface Chapter {
  time: string
  title: string
}

interface VideoData {
  id: number
  title: string
  description: string
  instructor: string
  duration: string
  level: string
  chapters?: Chapter[]
  keyPoints?: string[]
  transcript?: string
  videoUrl: string
}

export default function VideoPlayer({ video }: { video: VideoData }) {
  const [activeTab, setActiveTab] = useState<'chapters' | 'keypoints' | 'transcript'>('chapters')
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const { user } = useAuth()

  useEffect(() => {
    const videoElement = videoRef.current
    if (!videoElement) return

    const updateTime = () => setCurrentTime(videoElement.currentTime)
    const updateDuration = () => setDuration(videoElement.duration)

    videoElement.addEventListener('timeupdate', updateTime)
    videoElement.addEventListener('loadedmetadata', updateDuration)
    videoElement.addEventListener('play', () => setIsPlaying(true))
    videoElement.addEventListener('pause', () => setIsPlaying(false))

    return () => {
      videoElement.removeEventListener('timeupdate', updateTime)
      videoElement.removeEventListener('loadedmetadata', updateDuration)
      videoElement.removeEventListener('play', () => setIsPlaying(true))
      videoElement.removeEventListener('pause', () => setIsPlaying(false))
    }
  }, [])

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
    }
  }

  const seekTo = (time: string) => {
    if (videoRef.current) {
      const [minutes, seconds] = time.split(':').map(Number)
      videoRef.current.currentTime = minutes * 60 + seconds
    }
  }

  const changePlaybackRate = () => {
    const rates = [0.5, 0.75, 1, 1.25, 1.5, 2]
    const currentIndex = rates.indexOf(playbackRate)
    const nextIndex = (currentIndex + 1) % rates.length
    const newRate = rates[nextIndex]
    
    setPlaybackRate(newRate)
    if (videoRef.current) {
      videoRef.current.playbackRate = newRate
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // 未ログインユーザーにはプレビューのみ表示
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-black rounded-bjj overflow-hidden mb-4 relative">
              <div className="aspect-video flex items-center justify-center bg-gradient-to-b from-bjj-bg2 to-bjj-bg">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-4">{video.title}</h2>
                  <p className="text-bjj-muted mb-6">この動画を視聴するにはログインが必要です</p>
                  <button
                    onClick={() => setShowAuthDialog(true)}
                    className="btn-primary"
                  >
                    ログインして視聴
                  </button>
                </div>
              </div>
            </div>
            
            {/* Video Info */}
            <div className="card-gradient border border-white/10 rounded-bjj p-6 mb-4">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{video.title}</h1>
              <div className="flex items-center gap-4 text-bjj-muted mb-4">
                <span>講師: {video.instructor}</span>
                <span>•</span>
                <span>{video.duration}</span>
                <span>•</span>
                <span>{video.level}</span>
              </div>
              <p className="text-bjj-muted">{video.description}</p>
            </div>
          </div>
        </div>
        
        <AuthDialog
          isOpen={showAuthDialog}
          onClose={() => setShowAuthDialog(false)}
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Video Section */}
        <div className="lg:col-span-2">
          <div className="bg-black rounded-bjj overflow-hidden mb-4">
            <div className="relative aspect-video">
              <video
                ref={videoRef}
                className="w-full h-full"
                src={video.videoUrl}
                poster="/video-poster.jpg"
              >
                <source src={video.videoUrl} type="video/mp4" />
                動画を再生するにはHTML5対応のブラウザが必要です。
              </video>
              
              {/* Custom Controls Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={togglePlay}
                    className="text-white hover:text-bjj-accent transition-colors"
                  >
                    {isPlaying ? (
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5 4h3v12H5V4zm7 0h3v12h-3V4z" />
                      </svg>
                    ) : (
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                    )}
                  </button>
                  
                  <div className="flex-1">
                    <div className="bg-white/20 rounded-full h-1 cursor-pointer">
                      <div 
                        className="bg-bjj-accent h-full rounded-full transition-all"
                        style={{ width: `${(currentTime / duration) * 100}%` }}
                      />
                    </div>
                  </div>
                  
                  <span className="text-white text-sm">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                  
                  <button
                    onClick={changePlaybackRate}
                    className="text-white text-sm hover:text-bjj-accent transition-colors"
                  >
                    {playbackRate}x
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Video Info */}
          <div className="card-gradient border border-white/10 rounded-bjj p-6 mb-4">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{video.title}</h1>
            <div className="flex items-center gap-4 text-bjj-muted mb-4">
              <span>講師: {video.instructor}</span>
              <span>•</span>
              <span>{video.duration}</span>
              <span>•</span>
              <span>{video.level}</span>
            </div>
            <p className="text-bjj-muted">{video.description}</p>
          </div>

          {/* Tabs */}
          <div className="card-gradient border border-white/10 rounded-bjj p-6">
            <div className="flex gap-4 mb-6 border-b border-white/10">
              <button
                onClick={() => setActiveTab('chapters')}
                className={`pb-2 px-1 transition-colors ${
                  activeTab === 'chapters' 
                    ? 'text-bjj-accent border-b-2 border-bjj-accent' 
                    : 'text-bjj-muted hover:text-bjj-text'
                }`}
              >
                チャプター
              </button>
              <button
                onClick={() => setActiveTab('keypoints')}
                className={`pb-2 px-1 transition-colors ${
                  activeTab === 'keypoints' 
                    ? 'text-bjj-accent border-b-2 border-bjj-accent' 
                    : 'text-bjj-muted hover:text-bjj-text'
                }`}
              >
                キーポイント
              </button>
              <button
                onClick={() => setActiveTab('transcript')}
                className={`pb-2 px-1 transition-colors ${
                  activeTab === 'transcript' 
                    ? 'text-bjj-accent border-b-2 border-bjj-accent' 
                    : 'text-bjj-muted hover:text-bjj-text'
                }`}
              >
                文字起こし
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'chapters' && video.chapters && (
              <div className="space-y-2">
                {video.chapters.map((chapter, index) => (
                  <button
                    key={index}
                    onClick={() => seekTo(chapter.time)}
                    className="w-full text-left p-3 rounded-lg hover:bg-white/5 transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-bjj-accent">{chapter.time}</span>
                      <span>{chapter.title}</span>
                    </div>
                    <svg className="w-4 h-4 text-bjj-muted group-hover:text-bjj-accent transition-colors" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                ))}
              </div>
            )}

            {activeTab === 'keypoints' && video.keyPoints && (
              <ul className="space-y-3">
                {video.keyPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-bjj-accent mt-1">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            )}

            {activeTab === 'transcript' && video.transcript && (
              <div className="prose prose-invert max-w-none">
                <p className="text-bjj-muted whitespace-pre-wrap">{video.transcript}</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="card-gradient border border-white/10 rounded-bjj p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-4">関連する技術</h2>
            <div className="space-y-3">
              <Link href="/videos/arm-drag" className="block p-3 rounded-lg hover:bg-white/5 transition-colors">
                <h3 className="font-medium mb-1">アームドラッグ</h3>
                <p className="text-sm text-bjj-muted">次のステップへ</p>
              </Link>
              <Link href="/videos/sweep" className="block p-3 rounded-lg hover:bg-white/5 transition-colors">
                <h3 className="font-medium mb-1">スイープ</h3>
                <p className="text-sm text-bjj-muted">別の選択肢</p>
              </Link>
            </div>

            <div className="mt-6 pt-6 border-t border-white/10">
              <h3 className="font-medium mb-3">習得度を記録</h3>
              <div className="space-y-2">
                {['理解', '手順', '再現', '連携', '実戦'].map((level, index) => (
                  <button
                    key={index}
                    className="w-full text-left p-2 rounded-lg border border-white/10 hover:border-bjj-accent hover:bg-bjj-accent/10 transition-all"
                  >
                    <span className="text-sm">{index + 1}. {level}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}