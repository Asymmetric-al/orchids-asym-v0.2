'use client'

import * as React from 'react'

interface UnlayerEditorProps {
  mode: 'email' | 'pdf'
  onSave: () => void
  onExport: (type: string) => void
}

export function UnlayerEditor({ mode, onSave, onExport }: UnlayerEditorProps) {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)] border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 mt-6">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 capitalize">{mode} Studio</h2>
        <p className="text-slate-500 max-w-md mx-auto">
          This is a placeholder for the {mode} editor. In a production environment, this would integrate with a visual builder like Unlayer.
        </p>
        <div className="flex gap-3 justify-center">
          <button 
            onClick={onSave}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            Save Template
          </button>
          <button 
            onClick={() => onExport('html')}
            className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-white transition-colors"
          >
            Export HTML
          </button>
        </div>
      </div>
    </div>
  )
}
