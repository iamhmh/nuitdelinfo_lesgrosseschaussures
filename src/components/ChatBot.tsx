/**
 * Composant ChatBot - Secrétaire Virtuel IA
 * Interface de chat moderne avec isolation des touches clavier
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import type { KnowledgeBase, MistralConfig } from '../services/aiSecretaryService'
import { AISecretaryService, getAISecretary } from '../services/aiSecretaryService'
import './ChatBot.css'

interface ChatBotProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  subtitle?: string
  placeholder?: string
  config?: MistralConfig
  customKnowledgeBase?: KnowledgeBase
}

interface DisplayMessage {
  id: number
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export function ChatBot({
  isOpen,
  onClose,
  title = "Secrétaire Virtuel",
  subtitle = "Technicien NIRD - Atelier de reconditionnement",
  placeholder = "Écrivez votre question...",
  config,
  customKnowledgeBase
}: ChatBotProps) {
  const [messages, setMessages] = useState<DisplayMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [aiService, setAiService] = useState<AISecretaryService | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Initialiser le service IA
  useEffect(() => {
    const service = getAISecretary(config, customKnowledgeBase)
    setAiService(service)
    
    // Message de bienvenue
    if (messages.length === 0) {
      setMessages([{
        id: Date.now(),
        role: 'assistant',
        content: "👋 Salut ! Je suis le technicien de l'atelier NIRD. Je peux te renseigner sur le défi de la Nuit de l'Info, le jeu Recondi_Tech, ou l'écologie numérique. Que veux-tu savoir ?",
        timestamp: new Date()
      }])
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, customKnowledgeBase])

  // Auto-scroll vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus sur l'input quand le chat s'ouvre
  useEffect(() => {
    if (isOpen) {
      // Petit délai pour l'animation
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [isOpen])

  // ===== ISOLATION DES TOUCHES CLAVIER =====
  // Empêche les événements clavier de se propager au jeu
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Fermer avec Escape
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        onClose()
        return
      }

      // Toujours stopper la propagation pour éviter que le jeu reçoive les touches
      e.stopPropagation()
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      e.stopPropagation()
    }

    const handleKeyPress = (e: KeyboardEvent) => {
      e.stopPropagation()
    }

    // Capturer les événements en phase de capture (avant qu'ils n'atteignent le jeu)
    window.addEventListener('keydown', handleKeyDown, true)
    window.addEventListener('keyup', handleKeyUp, true)
    window.addEventListener('keypress', handleKeyPress, true)

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true)
      window.removeEventListener('keyup', handleKeyUp, true)
      window.removeEventListener('keypress', handleKeyPress, true)
    }
  }, [isOpen, onClose])

  // Empêcher le clic de se propager
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleContainerClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isLoading || !aiService) return

    const userMessage: DisplayMessage = {
      id: Date.now(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      const response = await aiService.sendMessage(userMessage.content)
      
      const assistantMessage: DisplayMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Erreur chatbot:', error)
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: "❌ Désolé, une erreur s'est produite. Réessaie dans un moment !",
        timestamp: new Date()
      }])
    } finally {
      setIsLoading(false)
      // Re-focus sur l'input après envoi
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [inputValue, isLoading, aiService])

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation()
    
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleReset = () => {
    aiService?.resetConversation()
    setMessages([{
      id: Date.now(),
      role: 'assistant',
      content: "🔄 Conversation réinitialisée ! Comment puis-je t'aider ?",
      timestamp: new Date()
    }])
    inputRef.current?.focus()
  }

  // Suggestions rapides
  const quickSuggestions = [
    "C'est quoi la Nuit de l'Info ?",
    "Comment jouer ?",
    "Qu'est-ce que le reconditionnement ?"
  ]

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion)
    inputRef.current?.focus()
  }

  if (!isOpen) return null

  return (
    <div className="chatbot-overlay" onClick={handleOverlayClick}>
      <div 
        className="chatbot-container" 
        ref={containerRef}
        onClick={handleContainerClick}
      >
        {/* Header */}
        <header className="chatbot-header">
          <div className="chatbot-header-info">
            <h2 className="chatbot-title">
              <span className="chatbot-title-icon">🤖</span>
              {title}
            </h2>
            <p className="chatbot-subtitle">{subtitle}</p>
          </div>
          <div className="chatbot-header-actions">
            <button
              className="chatbot-header-btn"
              onClick={handleReset}
              title="Réinitialiser la conversation"
            >
              🔄
            </button>
            <button
              className="chatbot-header-btn chatbot-close-btn"
              onClick={onClose}
              title="Fermer (Échap)"
            >
              ✕
            </button>
          </div>
        </header>

        {/* Messages */}
        <div className="chatbot-messages">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`chatbot-message ${msg.role}`}
            >
              <div className="chatbot-bubble">
                {msg.role === 'assistant' && (
                  <span className="chatbot-bubble-sender">🔧 Technicien NIRD</span>
                )}
                <p className="chatbot-bubble-content">{msg.content}</p>
                <span className="chatbot-bubble-time">
                  {msg.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="chatbot-message assistant">
              <div className="chatbot-bubble">
                <span className="chatbot-bubble-sender">🔧 Technicien NIRD</span>
                <div className="chatbot-loading">
                  <div className="chatbot-loading-dots">
                    <span className="chatbot-loading-dot"></span>
                    <span className="chatbot-loading-dot"></span>
                    <span className="chatbot-loading-dot"></span>
                  </div>
                  <span className="chatbot-loading-text">Réflexion en cours...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions rapides */}
        {messages.length <= 2 && (
          <div className="chatbot-suggestions">
            {quickSuggestions.map((suggestion, idx) => (
              <button
                key={idx}
                className="chatbot-suggestion-btn"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="chatbot-input-container">
          <div className="chatbot-input-wrapper">
            <input
              ref={inputRef}
              type="text"
              className="chatbot-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder={placeholder}
              disabled={isLoading}
              autoComplete="off"
              autoFocus
            />
            <button
              className="chatbot-send-btn"
              onClick={handleSendMessage}
              disabled={isLoading || !inputValue.trim()}
            >
              {isLoading ? (
                <span className="chatbot-send-loading">⏳</span>
              ) : (
                <>
                  <span>Envoyer</span>
                  <span className="chatbot-send-icon">➤</span>
                </>
              )}
            </button>
          </div>
          <div className="chatbot-footer">
            Propulsé par <span className="chatbot-footer-highlight">Mistral AI</span> 🚀
          </div>
        </div>
      </div>

      {/* Hint pour fermer */}
      <div className="chatbot-escape-hint">
        Appuyez sur <span className="chatbot-escape-key">Échap</span> pour fermer
      </div>
    </div>
  )
}

export default ChatBot
