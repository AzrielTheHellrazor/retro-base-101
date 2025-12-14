import React, { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import './ImageCropper.css'

function ImageCropper({ image, onCropComplete, onCancel }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)

  const onCropChange = (crop) => {
    setCrop(crop)
  }

  const onZoomChange = (zoom) => {
    setZoom(zoom)
  }

  const onCropCompleteHandler = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleSave = async () => {
    try {
      const croppedImage = await getCroppedImg(image, croppedAreaPixels)
      onCropComplete(croppedImage)
    } catch (error) {
      console.error('Error cropping image:', error)
    }
  }

  return (
    <div className="crop-modal-overlay">
      <div className="crop-modal-content">
        <div className="crop-header">
          <h2>Crop Image</h2>
          <button className="crop-close" onClick={onCancel}>×</button>
        </div>

        <div className="crop-container">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={240 / 280} // 6:7 ratio
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropCompleteHandler}
          />
        </div>

        <div className="crop-controls">
          <div className="zoom-control">
            <label>Zoom</label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="zoom-slider"
            />
          </div>

          <div className="crop-actions">
            <button className="crop-button cancel" onClick={onCancel}>
              Cancel
            </button>
            <button className="crop-button save" onClick={handleSave}>
              Crop & Save
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper function to create cropped image
const getCroppedImg = (imageSrc, pixelCrop) => {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.src = imageSrc
    image.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      // Set canvas size to 240x280
      canvas.width = 240
      canvas.height = 280

      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        240,
        280
      )

      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'))
          return
        }
        const fileUrl = URL.createObjectURL(blob)
        resolve(fileUrl)
      }, 'image/jpeg', 0.95)
    }
    image.onerror = () => {
      reject(new Error('Failed to load image'))
    }
  })
}

export default ImageCropper
