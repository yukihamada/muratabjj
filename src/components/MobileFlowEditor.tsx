'use client'

import { ReactNode } from 'react'
import { Info } from 'lucide-react'

interface MobileFlowEditorProps {
  children: ReactNode
}

export default function MobileFlowEditor({ children }: MobileFlowEditorProps) {
  return (
    <>
      {/* Mobile notice */}
      <div className="md:hidden fixed top-16 left-0 right-0 bg-yellow-500/10 border-b border-yellow-500/20 p-2 z-40">
        <div className="flex items-center gap-2 text-xs text-yellow-200">
          <Info className="w-4 h-4" />
          <span>フローエディタはデスクトップでの利用を推奨します</span>
        </div>
      </div>
      
      {/* Add padding for mobile */}
      <div className="md:hidden pt-12">
        {children}
      </div>
      
      {/* Desktop view */}
      <div className="hidden md:block">
        {children}
      </div>
    </>
  )
}