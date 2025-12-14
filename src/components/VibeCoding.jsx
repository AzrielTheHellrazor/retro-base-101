import React, { useState } from 'react'
import './VibeCoding.css'

const VibeCoding = () => {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [showComingSoon, setShowComingSoon] = useState(false)

  const examplePrompts = [
    'Create a Pomodoro app',
    'Daily affirmation generator',
    'Reminder app',
    'Calendar app'
  ]

  const handleCreate = async () => {
    if (!prompt.trim()) return
    
    setIsGenerating(true)
    setShowComingSoon(false)
    // TODO: AI generation logic
    setTimeout(() => {
      setIsGenerating(false)
      setShowComingSoon(true)
    }, 1500)
  }

  const handleExampleClick = (example) => {
    setPrompt(example)
  }

  return (
    <div className="vibe-coding-container">
      <h1 className="page-title">Vibe Coding</h1>
      
      <div className="vibe-card">
        <div className="vibe-header">
          <div className="vibe-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="vibe-title-section">
            <h2 className="vibe-title">Vibe Coding</h2>
            <p className="vibe-subtitle">Retro AI builds it for you! ✨</p>
          </div>
        </div>

        <div className="vibe-input-section">
          <textarea
            className="vibe-textarea"
            placeholder="Describe your creation...  Examples:"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={5}
          />
          
          <div className="vibe-examples">
            {examplePrompts.map((example, index) => (
              <button
                key={index}
                className="example-chip"
                onClick={() => handleExampleClick(example)}
              >
                • {example}
              </button>
            ))}
          </div>
        </div>

        <button 
          className="vibe-create-button"
          onClick={handleCreate}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <span className="spinner"></span>
              Generating...
            </>
          ) : (
            <>
              🚀 Create with Retro AI
            </>
          )}
        </button>

        {showComingSoon && (
          <p className="coming-soon-text">Coming soon! 🚀</p>
        )}
      </div>
    </div>
  )
}

export default VibeCoding

