import React, { useState } from 'react'
import '../styles/DialogBox.css'

interface DialogBoxProps {
  character: string
  message: string
  icon?: string
  showButtons?: boolean
  onYes?: () => void
  onNo?: () => void
  onClose: () => void
}

export const DialogBox: React.FC<DialogBoxProps> = ({ 
  character, 
  message, 
  icon, 
  showButtons = false,
  onYes,
  onNo,
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(true)

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300)
  }

  const handleYes = () => {
    setIsVisible(false)
    setTimeout(() => {
      onYes?.()
      onClose()
    }, 300)
  }

  const handleNo = () => {
    setIsVisible(false)
    setTimeout(() => {
      onNo?.()
      onClose()
    }, 300)
  }

  if (!isVisible) return null

  return (
    <div className="dialog-box-overlay" onClick={showButtons ? undefined : handleClose}>
      <div className="dialog-box" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <span className="dialog-icon">{icon}</span>
          <span className="dialog-character">{character}</span>
        </div>
        <div className="dialog-content">
          <p>{message}</p>
        </div>
        <div className="dialog-footer">
          {showButtons ? (
            <>
              <button className="dialog-button dialog-button-yes" onClick={handleYes}>
                Oui
              </button>
              <button className="dialog-button dialog-button-no" onClick={handleNo}>
                Non
              </button>
            </>
          ) : (
            <button className="dialog-button" onClick={handleClose}>
              Continuer
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
