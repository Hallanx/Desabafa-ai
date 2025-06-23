import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Input } from '@/components/ui/input.jsx'
import { 
  ArrowLeft, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Heart, 
  User,
  Bot,
  Play,
  Pause
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

function ChatInterface({ therapist, user, onBack }) {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [userId, setUserId] = useState(null)
  const [freeSessionsRemaining, setFreeSessionsRemaining] = useState(3)
  
  const messagesEndRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const currentAudioRef = useRef(null)

  // Inicializar usuário anônimo e sessão
  useEffect(() => {
    initializeAnonymousUser()
  }, [])

  // Scroll automático para última mensagem
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const initializeAnonymousUser = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/anonymous-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        const userData = await response.json()
        setUserId(userData.user_id)
        setFreeSessionsRemaining(userData.free_sessions_remaining)
        await createSession(userData.user_id)
      }
    } catch (error) {
      console.error('Erro ao criar usuário anônimo:', error)
    }
  }

  const createSession = async (userId) => {
    try {
      const response = await fetch('http://localhost:5001/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          session_type: therapist.sessionType.id,
          therapist_profile: therapist.therapist.id
        })
      })
      
      if (response.ok) {
        const sessionData = await response.json()
        setSessionId(sessionData.id)
        
        // Adicionar mensagem de boas-vindas
        const welcomeMessage = {
          id: Date.now(),
          sender: 'ai',
          message: therapist.therapist.greeting,
          timestamp: new Date().toISOString(),
          has_audio: false
        }
        setMessages([welcomeMessage])
      }
    } catch (error) {
      console.error('Erro ao criar sessão:', error)
    }
  }

  const sendMessage = async (messageText, isFromAudio = false) => {
    if (!messageText.trim() || !sessionId) return

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      message: messageText,
      timestamp: new Date().toISOString(),
      is_transcribed: isFromAudio
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      // Salvar mensagem do usuário
      await fetch(`http://localhost:5001/api/sessions/${sessionId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender: 'user',
          message: messageText
        })
      })

      // Obter resposta da IA
      const response = await fetch('http://localhost:5001/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          message: messageText,
          generate_audio: audioEnabled,
          voice: 'nova'
        })
      })

      if (response.ok) {
        const aiResponse = await response.json()
        
        const aiMessage = {
          id: aiResponse.message_id,
          sender: 'ai',
          message: aiResponse.message,
          timestamp: aiResponse.timestamp,
          has_audio: aiResponse.has_audio,
          audio_url: aiResponse.audio_url
        }

        setMessages(prev => [...prev, aiMessage])
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      const errorMessage = {
        id: Date.now(),
        sender: 'ai',
        message: 'Desculpe, ocorreu um erro. Tente novamente.',
        timestamp: new Date().toISOString(),
        has_audio: false
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        await sendAudioMessage(audioBlob)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const sendAudioMessage = async (audioBlob) => {
    if (!sessionId) return

    setIsLoading(true)
    
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'audio.wav')
      formData.append('session_id', sessionId)

      const response = await fetch('http://localhost:5001/api/audio/speech-to-text', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const result = await response.json()
        await sendMessage(result.transcription, true)
      }
    } catch (error) {
      console.error('Erro ao processar áudio:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const playAudio = async (audioUrl) => {
    try {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause()
      }

      const audio = new Audio(`http://localhost:5001${audioUrl}`)
      currentAudioRef.current = audio
      
      audio.onplay = () => setIsPlaying(true)
      audio.onended = () => setIsPlaying(false)
      audio.onerror = () => setIsPlaying(false)
      
      await audio.play()
    } catch (error) {
      console.error('Erro ao reproduzir áudio:', error)
      setIsPlaying(false)
    }
  }

  const stopAudio = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause()
      setIsPlaying(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    sendMessage(inputMessage)
  }

  const getTherapistColor = () => {
    const colors = {
      purple: 'from-purple-600 to-purple-700',
      blue: 'from-blue-600 to-blue-700',
      indigo: 'from-indigo-600 to-indigo-700'
    }
    return colors[therapist.therapist.color] || colors.purple
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={onBack}
                className="flex items-center text-gray-600 hover:text-purple-600"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${getTherapistColor()} flex items-center justify-center`}>
                  <therapist.therapist.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-800">{therapist.therapist.name}</h2>
                  <p className="text-sm text-gray-600">{therapist.therapist.title}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs">
                {therapist.sessionType.name}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {freeSessionsRemaining} sessões restantes
              </Badge>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAudioEnabled(!audioEnabled)}
                className={audioEnabled ? 'text-blue-600' : 'text-gray-400'}
              >
                {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 container mx-auto px-4 py-6 overflow-hidden">
        <div className="h-full max-w-4xl mx-auto flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-4 mb-6">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-3 max-w-xs md:max-w-md lg:max-w-lg ${
                    message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}>
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.sender === 'user' 
                        ? 'bg-gray-600' 
                        : `bg-gradient-to-r ${getTherapistColor()}`
                    }`}>
                      {message.sender === 'user' ? (
                        <User className="h-4 w-4 text-white" />
                      ) : (
                        <therapist.therapist.icon className="h-4 w-4 text-white" />
                      )}
                    </div>

                    {/* Message Bubble */}
                    <Card className={`${
                      message.sender === 'user' 
                        ? 'bg-gray-600 text-white' 
                        : 'bg-white border-gray-200'
                    }`}>
                      <CardContent className="p-3">
                        <p className="text-sm leading-relaxed">{message.message}</p>
                        
                        {message.is_transcribed && (
                          <Badge variant="secondary" className="mt-2 text-xs">
                            <Mic className="h-3 w-3 mr-1" />
                            Transcrito
                          </Badge>
                        )}
                        
                        {message.has_audio && message.audio_url && (
                          <div className="mt-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => isPlaying ? stopAudio() : playAudio(message.audio_url)}
                              className="text-xs p-1 h-auto"
                            >
                              {isPlaying ? (
                                <Pause className="h-3 w-3 mr-1" />
                              ) : (
                                <Play className="h-3 w-3 mr-1" />
                              )}
                              {isPlaying ? 'Pausar' : 'Ouvir'}
                            </Button>
                          </div>
                        )}
                        
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(message.timestamp).toLocaleTimeString('pt-BR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${getTherapistColor()} flex items-center justify-center`}>
                    <therapist.therapist.icon className="h-4 w-4 text-white" />
                  </div>
                  <Card className="bg-white border-gray-200">
                    <CardContent className="p-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 p-4">
            <form onSubmit={handleSubmit} className="flex items-center space-x-3">
              <div className="flex-1 relative">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  className="pr-12 border-gray-300 focus:border-purple-400 focus:ring-purple-400"
                  disabled={isLoading}
                />
              </div>
              
              <Button
                type="button"
                variant={isRecording ? "destructive" : "outline"}
                size="sm"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isLoading}
                className={isRecording ? 'animate-pulse' : ''}
              >
                {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              
              <Button 
                type="submit" 
                disabled={!inputMessage.trim() || isLoading}
                className={`bg-gradient-to-r ${getTherapistColor()} hover:opacity-90`}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
            
            <p className="text-xs text-gray-500 mt-2 text-center">
              {isRecording ? 'Gravando... Clique no microfone para parar' : 'Digite ou use o microfone para falar'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatInterface

