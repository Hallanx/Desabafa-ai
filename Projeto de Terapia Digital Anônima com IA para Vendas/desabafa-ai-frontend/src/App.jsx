import { useState, useEffect } from 'react'
import TherapistSelection from './components/TherapistSelection'
import ChatInterface from './components/ChatInterface'
import PricingPlans from './components/PricingPlans'
import UserDashboard from './components/UserDashboard'
import './App.css'

function App() {
  const [currentView, setCurrentView] = useState('landing')
  const [selectedSessionType, setSelectedSessionType] = useState(null)
  const [selectedTherapist, setSelectedTherapist] = useState(null)
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Verificar se há usuário logado
    const savedUser = localStorage.getItem('desabafa_user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const handleStartChat = () => {
    setCurrentView('sessionType')
  }

  const handleSessionTypeSelect = (sessionType) => {
    setSelectedSessionType(sessionType)
    setCurrentView('therapistSelection')
  }

  const handleTherapistSelect = (therapist) => {
    setSelectedTherapist(therapist)
    setCurrentView('chat')
  }

  const handleBack = () => {
    if (currentView === 'chat') {
      setCurrentView('therapistSelection')
    } else if (currentView === 'therapistSelection') {
      setCurrentView('sessionType')
    } else if (currentView === 'sessionType') {
      setCurrentView('landing')
    } else if (currentView === 'pricing' || currentView === 'dashboard') {
      setCurrentView('landing')
    }
  }

  const handleShowPricing = () => {
    setCurrentView('pricing')
  }

  const handleShowDashboard = () => {
    setCurrentView('dashboard')
  }

  const handleLogin = (userData) => {
    setUser(userData)
    localStorage.setItem('desabafa_user', JSON.stringify(userData))
    setCurrentView('dashboard')
  }

  const handleSelectPlan = (plan) => {
    // Aqui você integraria com um sistema de pagamento como Stripe
    console.log('Plano selecionado:', plan)
    alert(`Plano ${plan.name} selecionado! Em breve você será redirecionado para o pagamento.`)
  }

  const handleUpgrade = () => {
    setCurrentView('pricing')
  }

  // Landing Page
  if (currentView === 'landing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg mr-3"></div>
                <span className="text-xl font-bold text-gray-900">Desabafa.AI</span>
              </div>
              <nav className="flex space-x-4">
                <button 
                  onClick={handleShowPricing}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Como funciona
                </button>
                <button 
                  onClick={handleShowPricing}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Planos
                </button>
                <button 
                  onClick={handleShowDashboard}
                  className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-700"
                >
                  Entrar
                </button>
              </nav>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-medium mb-6">
              ✨ Totalmente Anônimo
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Desabafa.AI
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Sou sua confidente virtual, sem julgamento e sem cobrança.<br />
              Escreve o que quiser. Eu escuto.
            </p>
            
            <button 
              onClick={handleStartChat}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              💬 Começar a conversar
            </button>
            
            <p className="text-sm text-gray-500 mt-4">
              3 sessões gratuitas • Sem cadastro necessário
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">100% Anônimo</h3>
              <p className="text-gray-600">
                Sem cadastro, sem dados pessoais. Sua privacidade é nossa prioridade.
              </p>
            </div>

            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Conversa por Voz</h3>
              <p className="text-gray-600">
                Fale naturalmente ou digite. A IA responde em áudio com voz empática.
              </p>
            </div>

            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">IA Empática</h3>
              <p className="text-gray-600">
                Diferentes perfis: psicóloga, coach ou conselheira espiritual.
              </p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Por que escolher o Desabafa.AI?
            </h2>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">🔒 100% Anônimo</h3>
                <p className="text-sm text-gray-600">
                  Sem cadastro, sem dados pessoais. Sua privacidade é nossa prioridade.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">🎙️ Conversa por Voz</h3>
                <p className="text-sm text-gray-600">
                  Fale naturalmente ou digite. A IA responde em áudio com voz empática.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">🧠 IA Empática</h3>
                <p className="text-sm text-gray-600">
                  Diferentes perfis: psicóloga, coach ou conselheira espiritual.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Session Type Selection
  if (currentView === 'sessionType') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center py-4">
              <button 
                onClick={handleBack}
                className="mr-4 p-2 text-gray-600 hover:text-gray-900 rounded-md"
              >
                ← Voltar
              </button>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg mr-3"></div>
                <span className="text-xl font-bold text-gray-900">Desabafa.AI</span>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Como posso te ajudar hoje?
            </h1>
            <p className="text-lg text-gray-600">
              Escolha o tipo de apoio que você precisa neste momento
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { id: 'apoio_emocional', title: 'Apoio Emocional', description: 'Para momentos difíceis e sentimentos intensos' },
              { id: 'gestao_estresse', title: 'Gestão de Estresse', description: 'Técnicas para lidar com pressão e ansiedade' },
              { id: 'autoestima', title: 'Autoestima', description: 'Fortalecer a confiança e amor próprio' },
              { id: 'relacionamentos', title: 'Relacionamentos', description: 'Questões familiares, amorosas ou sociais' },
              { id: 'carreira', title: 'Carreira', description: 'Decisões profissionais e crescimento' },
              { id: 'proposito_vida', title: 'Propósito de Vida', description: 'Encontrar significado e direção' }
            ].map((type) => (
              <button
                key={type.id}
                onClick={() => handleSessionTypeSelect(type.id)}
                className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow text-left"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{type.title}</h3>
                <p className="text-gray-600 text-sm">{type.description}</p>
              </button>
            ))}
          </div>
        </main>
      </div>
    )
  }

  // Therapist Selection
  if (currentView === 'therapistSelection') {
    return (
      <TherapistSelection 
        sessionType={selectedSessionType}
        onSelectTherapist={handleTherapistSelect}
        onBack={handleBack}
      />
    )
  }

  // Chat Interface
  if (currentView === 'chat') {
    return (
      <ChatInterface 
        sessionType={selectedSessionType}
        therapist={selectedTherapist}
        onBack={handleBack}
      />
    )
  }

  // Pricing Plans
  if (currentView === 'pricing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center py-4">
              <button 
                onClick={handleBack}
                className="mr-4 p-2 text-gray-600 hover:text-gray-900 rounded-md"
              >
                ← Voltar
              </button>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg mr-3"></div>
                <span className="text-xl font-bold text-gray-900">Desabafa.AI</span>
              </div>
            </div>
          </div>
        </header>
        <PricingPlans onSelectPlan={handleSelectPlan} />
      </div>
    )
  }

  // User Dashboard
  if (currentView === 'dashboard') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center">
                <button 
                  onClick={handleBack}
                  className="mr-4 p-2 text-gray-600 hover:text-gray-900 rounded-md"
                >
                  ← Voltar
                </button>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg mr-3"></div>
                  <span className="text-xl font-bold text-gray-900">Desabafa.AI</span>
                </div>
              </div>
              <button 
                onClick={handleStartChat}
                className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-700"
              >
                Nova Sessão
              </button>
            </div>
          </div>
        </header>
        {user ? (
          <UserDashboard user={user} onUpgrade={handleUpgrade} />
        ) : (
          <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold text-center mb-6">Entrar na sua conta</h2>
            <p className="text-center text-gray-600 mb-6">
              Como usuário anônimo, você pode começar a usar imediatamente
            </p>
            <button 
              onClick={() => handleLogin({ 
                id: Date.now(), 
                email: 'anonymous@desabafa.ai', 
                is_anonymous: true,
                free_sessions_remaining: 3,
                subscription_active: false 
              })}
              className="w-full bg-purple-600 text-white py-3 rounded-md hover:bg-purple-700"
            >
              Continuar como Anônimo
            </button>
          </div>
        )}
      </div>
    )
  }

  return null
}

export default App

