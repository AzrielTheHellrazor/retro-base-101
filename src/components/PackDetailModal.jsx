import React, { useState, useEffect } from 'react'
import RetroDevice from './RetroDevice'
import './PackDetailModal.css'

function PackDetailModal({ pack, onClose, onPurchase, walletAddress, isPurchasing }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)
  const [showWalletWarning, setShowWalletWarning] = useState(false)

  // Pack'in görselleri - tek görsel veya çoklu
  const images = pack.images || [pack.image]

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50

  // Escape tuşu ile kapatma
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  // Body scroll'u engelle modal açıkken
  useEffect(() => {
    // Scroll pozisyonunu kaydet
    const scrollY = window.scrollY
    
    // Body'yi sabitle
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'
    document.body.style.overflow = 'hidden'
    
    return () => {
      // Body'yi normale döndür ve scroll pozisyonunu geri yükle
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      document.body.style.overflow = ''
      window.scrollTo(0, scrollY)
    }
  }, [])

  const handlePrevious = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const onTouchStart = (e) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      handleNext()
    } else if (isRightSwipe) {
      handlePrevious()
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ×
        </button>

        <div className="modal-body">
          {/* Top Section: Device + Info */}
          <div className="modal-top-section">
            {/* Retro Device with Navigation */}
            <div className="modal-device-wrapper">
              {images.length > 1 && (
                <button
                  className="device-nav-btn device-nav-prev"
                  onClick={handlePrevious}
                >
                  ‹
                </button>
              )}

              <div
                className="modal-device-section"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >
                <RetroDevice
                  showControls={false}
                  nftImage={images[currentImageIndex]}
                  ledHue={30}
                  imageObjectFit="cover"
                />

                {/* Dots Indicator */}
                {images.length > 1 && (
                  <div className="device-dots">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        className={`device-dot ${
                          index === currentImageIndex ? 'active' : ''
                        }`}
                        onClick={() => setCurrentImageIndex(index)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {images.length > 1 && (
                <button
                  className="device-nav-btn device-nav-next"
                  onClick={handleNext}
                >
                  ›
                </button>
              )}
            </div>

            {/* Pack Name and Creator */}
            <div className="modal-pack-info">
              <h2 className="modal-pack-name">{pack.name}</h2>
              <p className="modal-pack-creator">
                created by{' '}
                {pack.creator.username ||
                  `${pack.creator.wallet.slice(0, 6)}...${pack.creator.wallet.slice(-4)}`}
              </p>
            </div>
          </div>

          {/* Bottom Section: Buy Button */}
          <div className="modal-info-section">
            {/* Buy Button */}
            <button
              className={`modal-buy-button ${isPurchasing ? 'purchasing' : ''}`}
              onClick={() => {
                if (!walletAddress) {
                  setShowWalletWarning(true)
                  return
                }
                setShowWalletWarning(false)
                onPurchase && onPurchase(pack)
              }}
              disabled={isPurchasing}
            >
              {isPurchasing ? 'Purchasing...' : `Buy for ${pack.price} USDC`}
            </button>

            {/* Wallet warning container - fixed height to prevent layout shift */}
            <div className="modal-wallet-warning-container">
              {showWalletWarning && !walletAddress && (
                <div className="modal-wallet-warning">
                  Insufficient funds to purchase this pack
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PackDetailModal
