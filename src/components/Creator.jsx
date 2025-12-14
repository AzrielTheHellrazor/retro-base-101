import React, { useState, useEffect } from 'react'
import ImageCropper from './ImageCropper'
import heic2any from 'heic2any'
import { createMoodPack, getCreatorPacks } from '../services/firebaseService'
import './Creator.css'

function Creator({ walletAddress, userProfile }) {
  const [activeTab, setActiveTab] = useState('create') // 'create' or 'myCreations'
  const [selectedImages, setSelectedImages] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [imageToCrop, setImageToCrop] = useState(null)
  const [cropIndex, setCropIndex] = useState(null)
  const [packName, setPackName] = useState('')
  const [packDescription, setPackDescription] = useState('')
  const [packPrice, setPackPrice] = useState('1.00')
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [myPacks, setMyPacks] = useState([])
  const [loadingPacks, setLoadingPacks] = useState(false)
  const MAX_IMAGES = 5

  // Load creator's packs when wallet changes or tab switches to myCreations
  useEffect(() => {
    const loadMyPacks = async () => {
      if (walletAddress && activeTab === 'myCreations') {
        setLoadingPacks(true)
        try {
          const packs = await getCreatorPacks(walletAddress)
          setMyPacks(packs)
        } catch (err) {
          console.error('Error loading packs:', err)
        } finally {
          setLoadingPacks(false)
        }
      }
    }
    loadMyPacks()
  }, [walletAddress, activeTab])

  const convertHeicIfNeeded = async (file) => {
    const isHeic = file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')

    if (isHeic) {
      try {
        const convertedBlob = await heic2any({
          blob: file,
          toType: 'image/jpeg',
          quality: 0.9
        })
        // heic2any can return array or single blob
        const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob
        return new File([blob], file.name.replace(/\.heic$/i, '.jpg').replace(/\.heif$/i, '.jpg'), {
          type: 'image/jpeg'
        })
      } catch (err) {
        console.error('HEIC conversion error:', err)
        throw new Error('Failed to convert HEIC image')
      }
    }
    return file
  }

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)

    if (selectedImages.length + files.length > MAX_IMAGES) {
      setError(`You can upload maximum ${MAX_IMAGES} images`)
      return
    }

    for (const file of files) {
      try {
        if (file.size > 5 * 1024 * 1024) {
          setError('Image size should be less than 5MB')
          continue
        }

        // Convert HEIC to JPEG if needed
        const processedFile = await convertHeicIfNeeded(file)

        const reader = new FileReader()
        reader.onloadend = () => {
          const img = new Image()
          img.onload = () => {
            // Check if image needs cropping (larger than 240x280)
            if (img.width > 240 || img.height > 280) {
              setImageToCrop(reader.result)
              setCropIndex(selectedImages.length)
            } else {
              setSelectedImages(prev => [...prev, processedFile])
              setImagePreviews(prev => [...prev, reader.result])
            }
          }
          img.src = reader.result
        }
        reader.readAsDataURL(processedFile)
      } catch (err) {
        setError(err.message || 'Failed to process image')
      }
    }
    setError('')
  }

  const handleCropComplete = (croppedImageUrl) => {
    setSelectedImages(prev => [...prev, croppedImageUrl])
    setImagePreviews(prev => [...prev, croppedImageUrl])
    setImageToCrop(null)
    setCropIndex(null)
  }

  const handleCropCancel = () => {
    setImageToCrop(null)
    setCropIndex(null)
  }

  const handleRemoveImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files).filter(file => {
      const isImage = file.type.startsWith('image/')
      const isHeic = file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')
      return isImage || isHeic
    })

    if (selectedImages.length + files.length > MAX_IMAGES) {
      setError(`You can upload maximum ${MAX_IMAGES} images`)
      return
    }

    for (const file of files) {
      try {
        if (file.size > 5 * 1024 * 1024) {
          setError('Image size should be less than 5MB')
          continue
        }

        // Convert HEIC to JPEG if needed
        const processedFile = await convertHeicIfNeeded(file)

        const reader = new FileReader()
        reader.onloadend = () => {
          const img = new Image()
          img.onload = () => {
            // Check if image needs cropping (larger than 240x280)
            if (img.width > 240 || img.height > 280) {
              setImageToCrop(reader.result)
              setCropIndex(selectedImages.length)
            } else {
              setSelectedImages(prev => [...prev, processedFile])
              setImagePreviews(prev => [...prev, reader.result])
            }
          }
          img.src = reader.result
        }
        reader.readAsDataURL(processedFile)
      } catch (err) {
        setError(err.message || 'Failed to process image')
      }
    }
    setError('')
  }

  const handleCreatePack = async () => {
    if (!walletAddress) {
      setError('Please connect your wallet first')
      return
    }

    if (selectedImages.length === 0 || !packName || !packDescription || !packPrice) {
      setError('Please fill all required fields and upload at least one image')
      return
    }

    setIsCreating(true)
    setError('')

    try {
      // Create mood pack with image previews (base64 data URLs)
      const packData = {
        name: packName,
        description: packDescription,
        price: packPrice,
        images: imagePreviews // base64 data URLs
      }

      const packId = await createMoodPack(walletAddress, packData)

      setSuccess(`Mood pack "${packName}" created successfully with ${selectedImages.length} image${selectedImages.length > 1 ? 's' : ''}!`)

      // Reset form
      setSelectedImages([])
      setImagePreviews([])
      setPackName('')
      setPackDescription('')
      setPackPrice('1.00')

      setTimeout(() => setSuccess(''), 5000)
    } catch (err) {
      setError('Failed to create mood pack: ' + err.message)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <>
      {imageToCrop && (
        <ImageCropper
          image={imageToCrop}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}

      <div className="creator-container">
        <h1 className="page-title">Pack Creator</h1>

        {/* Tab Navigation */}
        <div className="creator-tabs">
          <button
            className={`tab-button ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => setActiveTab('create')}
          >
            Create Pack
          </button>
          <button
            className={`tab-button ${activeTab === 'myCreations' ? 'active' : ''}`}
            onClick={() => setActiveTab('myCreations')}
          >
            My Creations
          </button>
        </div>

      {activeTab === 'create' && (
      <div className="creator-content">
        {/* Upload Section */}
        <div className="upload-section">
          {/* Image Previews */}
          {imagePreviews.length > 0 && (
            <div className="images-preview-grid">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="image-preview-item">
                  <img src={preview} alt={`Preview ${index + 1}`} />
                  <button
                    className="remove-image-btn"
                    onClick={() => handleRemoveImage(index)}
                  >
                    ×
                  </button>
                  <span className="image-number">{index + 1}</span>
                </div>
              ))}
            </div>
          )}

          {/* Upload Area */}
          {imagePreviews.length < MAX_IMAGES && (
            <div
              className="upload-area"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <label htmlFor="image-upload" className="upload-label">
                <div className="upload-icon">📸</div>
                <h3>Upload Mood Pack Images</h3>
                <p>Drag & drop or click to select</p>
                <span className="upload-hint">
                  PNG, JPG, GIF, HEIC up to 5MB • {imagePreviews.length}/{MAX_IMAGES} images
                </span>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*,.heic,.heif"
                  multiple
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          )}

          {/* Creator Info */}
          {userProfile && (
            <div className="creator-info-card">
              <div className="creator-avatar">
                {userProfile.avatar ? (
                  <img src={userProfile.avatar} alt={userProfile.username} />
                ) : (
                  <div className="avatar-placeholder">
                    {userProfile.username.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="creator-details">
                <span className="creator-label">CREATOR</span>
                <span className="creator-name">{userProfile.username}</span>
                <span className="creator-wallet">
                  {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Form Section */}
        <div className="form-section">
          <div className="form-group">
            <label htmlFor="pack-name">Pack Name *</label>
            <input
              id="pack-name"
              type="text"
              value={packName}
              onChange={(e) => setPackName(e.target.value)}
              placeholder="Enter pack name"
              maxLength={50}
            />
          </div>

          <div className="form-group">
            <label htmlFor="pack-description">Description *</label>
            <textarea
              id="pack-description"
              value={packDescription}
              onChange={(e) => setPackDescription(e.target.value)}
              placeholder="Describe your pack"
              maxLength={200}
              rows={3}
            />
          </div>

          <div className="form-group">
            <label htmlFor="pack-price">Price (USDC) *</label>
            <input
              id="pack-price"
              type="number"
              step="0.01"
              min="0.01"
              value={packPrice}
              onChange={(e) => setPackPrice(e.target.value)}
              placeholder="1.00"
            />
          </div>

          {error && <div className="creator-error">{error}</div>}
          {success && <div className="creator-success">{success}</div>}

          <button
            className="create-button"
            onClick={handleCreatePack}
            disabled={isCreating || selectedImages.length === 0 || !packName || !packDescription || !packPrice}
          >
            {isCreating ? 'Creating...' : `Create Mood Pack ${selectedImages.length > 0 ? `(${selectedImages.length} image${selectedImages.length > 1 ? 's' : ''})` : ''}`}
          </button>

          <p className="creator-note">
            Your mood pack will be minted as an NFT and listed on the marketplace.
          </p>
        </div>
      </div>
      )}

      {/* My Creations Tab */}
      {activeTab === 'myCreations' && (
        <div className="my-creations-content">
          {loadingPacks ? (
            <div className="loading-packs">
              <div className="loading-spinner"></div>
              <p>Loading your packs...</p>
            </div>
          ) : myPacks.length === 0 ? (
            <div className="no-packs-created">
              <div className="no-packs-icon">📦</div>
              <h3>No Packs Created Yet</h3>
              <p>Create your first mood pack to see it here!</p>
              <button
                className="switch-to-create-btn"
                onClick={() => setActiveTab('create')}
              >
                Create Pack
              </button>
            </div>
          ) : (
            <div className="my-packs-grid">
              {myPacks.map((pack) => (
                <div key={pack.id} className="my-pack-card">
                  <div className="my-pack-image-container">
                    {pack.images && pack.images.length > 1 ? (
                      <div className="multi-image-preview">
                        {pack.images.slice(0, 4).map((img, idx) => (
                          <div key={idx} className="mini-image">
                            <img src={img} alt={`${pack.name} ${idx + 1}`} />
                          </div>
                        ))}
                        {pack.images.length > 4 && (
                          <div className="more-count">+{pack.images.length - 4}</div>
                        )}
                      </div>
                    ) : (
                      <img
                        src={pack.images[0] || pack.image}
                        alt={pack.name}
                        className="my-pack-image"
                      />
                    )}
                  </div>
                  <div className="my-pack-info">
                    <h3 className="my-pack-name">{pack.name}</h3>
                    <p className="my-pack-description">{pack.description}</p>
                    <div className="my-pack-footer">
                      <div className="my-pack-price">
                        <span className="price-label">PRICE</span>
                        <span className="price-value">{pack.price} USDC</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
    </>
  )
}

export default Creator
