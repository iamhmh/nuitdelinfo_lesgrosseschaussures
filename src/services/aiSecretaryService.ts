/**
 * Service d'IA pour le secrétaire virtuel
 * Utilise l'API Mistral pour répondre aux questions des utilisateurs
 * Configurable avec une base de connaissance personnalisée
 */

import knowledgeBase from '../data/knowledgeBase.json'

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface MistralConfig {
  apiKey?: string
  model?: string
  temperature?: number
  maxTokens?: number
}

export interface KnowledgeBase {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

/**
 * Classe du secrétaire virtuel IA
 * Réutilisable avec différentes bases de connaissance
 */
export class AISecretaryService {
  private apiKey: string
  private model: string
  private temperature: number
  private maxTokens: number
  private conversationHistory: ChatMessage[] = []
  private knowledgeBase: KnowledgeBase
  private systemPrompt: string

  constructor(config?: MistralConfig, customKnowledgeBase?: KnowledgeBase) {
    this.apiKey = config?.apiKey || import.meta.env.VITE_MISTRAL_API_KEY || ''
    this.model = config?.model || 'mistral-small-latest'
    this.temperature = config?.temperature || 0.7
    this.maxTokens = config?.maxTokens || 500
    this.knowledgeBase = customKnowledgeBase || knowledgeBase

    // Construire le prompt système avec la base de connaissance
    this.systemPrompt = this.buildSystemPrompt()
    
    // Initialiser l'historique avec le prompt système
    this.conversationHistory = [
      { role: 'system', content: this.systemPrompt }
    ]
  }

  /**
   * Construit le prompt système à partir de la base de connaissance
   */
  private buildSystemPrompt(): string {
    const kb = this.knowledgeBase
    
    return `Tu es un secrétaire virtuel amical et serviable pour l'application "Recondi_Tech".
Tu es représenté dans le jeu par un technicien devant l'atelier de reconditionnement.

Voici ta base de connaissance :

## À propos du Défi National
${kb.defiNational ? `
- Événement : ${kb.defiNational.nom}
- Description : ${kb.defiNational.description}
- Date : ${kb.defiNational.date}
- Thème 2024 : ${kb.defiNational.theme2024}
` : ''}

## À propos de l'Application
${kb.application ? `
- Nom : ${kb.application.nom}
- Description : ${kb.application.description}
- Objectif du jeu : ${kb.application.objectifJeu}
- Technologies : ${kb.application.technologies?.join(', ')}
` : ''}

## À propos de NIRD (Atelier de reconditionnement)
${kb.nird ? `
- Mission : ${kb.nird.mission}
- Valeurs : ${kb.nird.valeurs?.join(', ')}
- Services : ${kb.nird.services?.join(', ')}
` : ''}

## Horaires
${kb.horaires ? `
- Début du défi : ${kb.horaires.debutDefi}
- Fin du défi : ${kb.horaires.finDefi}
` : ''}

## Comment jouer
${kb.gameplay ? `
- Contrôles : ${JSON.stringify(kb.gameplay.controles)}
- Étapes du jeu : ${kb.gameplay.etapes?.map((e: { nom: string; description: string }) => `${e.nom}: ${e.description}`).join(' | ')}
- Objectif final : ${kb.gameplay.objectifFinal}
` : ''}

## Contact
${kb.contacts ? `
- Équipe : ${kb.contacts.equipe}
- GitHub : ${kb.contacts.github}
` : ''}

## Écologie et numérique responsable
${kb.ecologie ? `
- Impact : ${kb.ecologie.impactNumerique?.description}
- Solutions : ${kb.ecologie.impactNumerique?.solutions?.join(', ')}
- Conseils : ${kb.ecologie.conseils?.join(' | ')}
` : ''}

## FAQ
${kb.faq ? kb.faq.map((f: { question: string; reponse: string }) => `Q: ${f.question}\nR: ${f.reponse}`).join('\n\n') : ''}

---
Instructions :
- Réponds de manière concise et amicale
- Utilise des emojis pour rendre les réponses plus vivantes 🎮
- Si tu ne sais pas quelque chose, dis-le honnêtement
- Tu peux parler du jeu, du défi, de l'écologie numérique, ou aider les joueurs
- Reste dans le contexte du jeu et du défi national
- Réponds en français
`
  }

  /**
   * Envoie un message à l'IA et retourne la réponse
   */
  async sendMessage(userMessage: string): Promise<string> {
    if (!this.apiKey) {
      return "⚠️ La clé API Mistral n'est pas configurée. Ajoutez VITE_MISTRAL_API_KEY dans votre fichier .env"
    }

    // Ajouter le message utilisateur à l'historique
    this.conversationHistory.push({
      role: 'user',
      content: userMessage
    })

    try {
      const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: this.conversationHistory,
          temperature: this.temperature,
          max_tokens: this.maxTokens
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Erreur API Mistral:', errorData)
        
        if (response.status === 401) {
          return "🔑 Clé API invalide. Vérifiez votre clé Mistral dans le fichier .env"
        }
        if (response.status === 429) {
          return "⏳ Trop de requêtes. Attendez un moment avant de réessayer."
        }
        
        return `❌ Erreur de l'API (${response.status}). Réessayez plus tard.`
      }

      const data = await response.json()
      const assistantMessage = data.choices?.[0]?.message?.content || "Je n'ai pas pu générer de réponse."

      // Ajouter la réponse à l'historique
      this.conversationHistory.push({
        role: 'assistant',
        content: assistantMessage
      })

      // Garder seulement les 20 derniers messages pour éviter de dépasser les limites
      if (this.conversationHistory.length > 21) {
        this.conversationHistory = [
          this.conversationHistory[0], // Garder le system prompt
          ...this.conversationHistory.slice(-20)
        ]
      }

      return assistantMessage

    } catch (error) {
      console.error('Erreur réseau:', error)
      return "🌐 Erreur de connexion. Vérifiez votre connexion internet."
    }
  }

  /**
   * Réinitialise la conversation
   */
  resetConversation(): void {
    this.conversationHistory = [
      { role: 'system', content: this.systemPrompt }
    ]
  }

  /**
   * Met à jour la base de connaissance
   */
  updateKnowledgeBase(newKnowledgeBase: KnowledgeBase): void {
    this.knowledgeBase = newKnowledgeBase
    this.systemPrompt = this.buildSystemPrompt()
    this.resetConversation()
  }

  /**
   * Retourne l'historique de conversation (sans le system prompt)
   */
  getConversationHistory(): ChatMessage[] {
    return this.conversationHistory.filter(m => m.role !== 'system')
  }

  /**
   * Vérifie si l'API est configurée
   */
  isConfigured(): boolean {
    return !!this.apiKey && this.apiKey !== 'votre_cle_api_mistral_ici'
  }
}

// Instance singleton par défaut
let defaultInstance: AISecretaryService | null = null

export function getAISecretary(config?: MistralConfig, customKnowledgeBase?: KnowledgeBase): AISecretaryService {
  if (!defaultInstance || config || customKnowledgeBase) {
    defaultInstance = new AISecretaryService(config, customKnowledgeBase)
  }
  return defaultInstance
}

export default AISecretaryService
