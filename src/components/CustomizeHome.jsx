import React from 'react'
import './CustomizeHome.css'

const CustomizeHome = ({ children }) => {
  const features = [
    {
      icon: '🎨',
      title: 'Express Digital Self',
      description: 'Personalize your Retro device',
      gradient: 'linear-gradient(135deg, #ff6b9d, #c44569)'
    },
    {
      icon: '🔄',
      title: 'Swap Personalities',
      description: 'Change AI companions anytime',
      gradient: 'linear-gradient(135deg, #a55eea, #8854d0)'
    },
    {
      icon: '📲',
      title: 'Install Apps',
      description: 'Add new features',
      gradient: 'linear-gradient(135deg, #778ca3, #4b6584)'
    },
    {
      icon: '🎭',
      title: 'Change Moods',
      description: 'Adjust animations',
      gradient: 'linear-gradient(135deg, #ff9ff3, #f368e0)'
    }
  ]

  return (
    <div className="customize-home-container">
      <h1 className="page-title">Customize</h1>
      
      {/* RetroDevice bileşeni buraya gelecek */}
      {children}
      
      {/* Feature Cards */}
      <div className="feature-cards">
        {features.map((feature, index) => (
          <div key={index} className="feature-card">
            <div 
              className="feature-accent"
              style={{ background: feature.gradient }}
            />
            <div className="feature-icon">{feature.icon}</div>
            <div className="feature-content">
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CustomizeHome
