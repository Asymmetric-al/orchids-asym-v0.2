'use client'

import React from 'react'
import { UnlayerEditor } from '@/components/studio/UnlayerEditor'
import { Mail, Save, Send, ChevronRight, LayoutTemplate, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function EmailStudio() {
  const handleSave = () => {
    alert("Email template saved successfully.")
  }

  const handleExport = (type: string) => {
    alert(`Exporting ${type}...`)
  }

  return (
    <div className="flex h-[calc(100vh-10rem)] flex-col bg-slate-50 overflow-hidden border border-slate-200 rounded-xl">
      <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <div className="p-1.5 rounded-md bg-blue-50 text-blue-600 border border-blue-100">
              <Mail className="h-4 w-4" />
            </div>
            <span className="uppercase tracking-widest text-[11px]">Email Studio</span>
          </div>
          <div className="h-6 w-px bg-slate-200 mx-1" />
          <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
             <span>Campaigns</span>
             <ChevronRight className="h-3 w-3" />
             <span className="text-slate-900">Q4 Monthly Update</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 bg-white border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
            <Settings className="h-3.5 w-3.5 mr-1.5" /> Config
          </Button>
          <Button size="sm" onClick={handleSave} className="h-8 px-4 font-bold uppercase tracking-wider text-[10px] bg-slate-900 hover:bg-slate-800">
            <Save className="h-3.5 w-3.5 mr-1.5" /> Save Template
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden relative">
        <UnlayerEditor mode="email" onSave={handleSave} onExport={handleExport} />
      </div>
    </div>
  )
}
