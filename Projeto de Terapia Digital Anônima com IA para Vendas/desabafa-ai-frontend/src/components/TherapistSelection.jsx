import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { ArrowLeft, Heart, Brain, Sparkles, User } from 'lucide-react'
import { motion } from 'framer-motion'

const therapists = [
  {
    id: 'psicologo',
    name: 'Ana',
    title: 'Psicóloga Virtual',
    description: 'Especialista em escuta ativa e abordagem humanística. Perfeita para questões emocionais profundas.',
    personality: 'Empática, acolhedora e profissional',
    specialties: ['Ansiedade', 'Depressão', 'Autoestima', 'Relacionamentos'],
    greeting: 'Olá! Eu sou a Ana, sua psicóloga virtual. Estou aqui para te escutar sem julgamentos.',
    color: 'purple',
    icon: Heart
  },
  {
    id: 'coach',
    name: 'Carlos',
    title: 'Coach de Vida',
    description: 'Focado em soluções práticas e crescimento pessoal. Ideal para superar desafios e alcançar objetivos.',
    personality: 'Motivador, encorajador e orientado a resultados',
    specialties: ['Produtividade', 'Metas', 'Carreira', 'Motivação'],
    greeting: 'E aí! Eu sou o Carlos, seu coach pessoal. Vamos transformar desafios em oportunidades?',
    color: 'blue',
    icon: Brain
  },
  {
    id: 'conselheiro_espiritual',
    name: 'Luz',
    title: 'Conselheira Espiritual',
    description: 'Oferece orientação baseada em sabedoria universal e amor incondicional. Para questões de propósito e significado.',
    personality: 'Sábia, compassiva e inspiradora',
    specialties: ['Propósito', 'Espiritualidade', 'Paz interior', 'Autoconhecimento'],
    greeting: 'Namastê! Eu sou a Luz, sua guia espiritual. Que luz posso ajudar a despertar em você?',
    color: 'indigo',
    icon: Sparkles
  }
]

const sessionTypes = [
  { id: 'emocional', name: 'Apoio Emocional', description: 'Para momentos difíceis e sentimentos intensos' },
  { id: 'estresse', name: 'Gestão de Estresse', description: 'Técnicas para lidar com pressão e ansiedade' },
  { id: 'autoestima', name: 'Autoestima', description: 'Fortalecer a confiança e amor próprio' },
  { id: 'relacionamentos', name: 'Relacionamentos', description: 'Questões familiares, amorosas ou sociais' },
  { id: 'carreira', name: 'Carreira', description: 'Decisões profissionais e crescimento' },
  { id: 'proposito', name: 'Propósito de Vida', description: 'Encontrar significado e direção' }
]

function TherapistSelection({ onTherapistSelected, onBack }) {
  const [selectedTherapist, setSelectedTherapist] = useState(null)
  const [selectedSessionType, setSelectedSessionType] = useState(null)
  const [step, setStep] = useState(1) // 1: escolher tipo, 2: escolher terapeuta

  const handleSessionTypeSelect = (sessionType) => {
    setSelectedSessionType(sessionType)
    setStep(2)
  }

  const handleTherapistSelect = (therapist) => {
    setSelectedTherapist(therapist)
  }

  const handleStartSession = () => {
    if (selectedTherapist && selectedSessionType) {
      onTherapistSelected({
        therapist: selectedTherapist,
        sessionType: selectedSessionType
      })
    }
  }

  const getColorClasses = (color) => {
    const colors = {
      purple: 'border-purple-200 hover:border-purple-400 bg-purple-50 hover:bg-purple-100',
      blue: 'border-blue-200 hover:border-blue-400 bg-blue-50 hover:bg-blue-100',
      indigo: 'border-indigo-200 hover:border-indigo-400 bg-indigo-50 hover:bg-indigo-100'
    }
    return colors[color] || colors.purple
  }

  const getTextColorClasses = (color) => {
    const colors = {
      purple: 'text-purple-600',
      blue: 'text-blue-600',
      indigo: 'text-indigo-600'
    }
    return colors[color] || colors.purple
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={step === 1 ? onBack : () => setStep(1)}
            className="flex items-center text-gray-600 hover:text-purple-600"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          
          <div className="flex items-center space-x-2">
            <Heart className="h-6 w-6 text-purple-600" />
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Desabafa.AI
            </span>
          </div>
          
          <div className="w-16" /> {/* Spacer */}
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4 text-gray-800">
                Como posso te ajudar hoje?
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Escolha o tipo de apoio que você precisa neste momento
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {sessionTypes.map((type, index) => (
                <motion.div
                  key={type.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card 
                    className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                      selectedSessionType?.id === type.id 
                        ? 'ring-2 ring-purple-400 bg-purple-50' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => handleSessionTypeSelect(type)}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg">{type.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>{type.description}</CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-purple-100 text-purple-700">
                {selectedSessionType?.name}
              </Badge>
              <h1 className="text-4xl font-bold mb-4 text-gray-800">
                Escolha seu terapeuta virtual
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Cada um tem uma abordagem única para te ajudar
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
              {therapists.map((therapist, index) => {
                const IconComponent = therapist.icon
                return (
                  <motion.div
                    key={therapist.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card 
                      className={`cursor-pointer transition-all duration-300 h-full ${
                        selectedTherapist?.id === therapist.id 
                          ? `ring-2 ring-${therapist.color}-400 ${getColorClasses(therapist.color)}` 
                          : 'hover:shadow-lg'
                      }`}
                      onClick={() => handleTherapistSelect(therapist)}
                    >
                      <CardHeader className="text-center">
                        <div className={`w-16 h-16 rounded-full ${getColorClasses(therapist.color)} flex items-center justify-center mx-auto mb-4`}>
                          <IconComponent className={`h-8 w-8 ${getTextColorClasses(therapist.color)}`} />
                        </div>
                        <CardTitle className="text-xl">{therapist.name}</CardTitle>
                        <CardDescription className={`font-medium ${getTextColorClasses(therapist.color)}`}>
                          {therapist.title}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-gray-600 text-sm">{therapist.description}</p>
                        
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">Personalidade:</p>
                          <p className="text-sm text-gray-600">{therapist.personality}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">Especialidades:</p>
                          <div className="flex flex-wrap gap-1">
                            {therapist.specialties.map((specialty) => (
                              <Badge key={specialty} variant="secondary" className="text-xs">
                                {specialty}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className={`p-3 rounded-lg ${getColorClasses(therapist.color)}`}>
                          <p className="text-sm italic text-gray-700">
                            "{therapist.greeting}"
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>

            {selectedTherapist && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <Button 
                  onClick={handleStartSession}
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Começar conversa com {selectedTherapist.name}
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default TherapistSelection

