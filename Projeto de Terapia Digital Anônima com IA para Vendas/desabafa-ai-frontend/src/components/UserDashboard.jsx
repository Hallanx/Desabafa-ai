import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'

const UserDashboard = ({ user, onUpgrade }) => {
  const [sessions, setSessions] = useState([])
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      // Buscar sessões do usuário
      const sessionsResponse = await fetch(`http://localhost:5001/api/users/${user.id}/sessions`)
      const sessionsData = await sessionsResponse.json()
      setSessions(sessionsData.sessions || [])

      // Buscar relatórios (se premium)
      if (user.subscription_active) {
        const reportsResponse = await fetch(`http://localhost:5001/api/users/${user.id}/reports`)
        const reportsData = await reportsResponse.json()
        setReports(reportsData.reports || [])
      }
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTherapistName = (profile) => {
    const therapists = {
      'ana': 'Ana - Psicóloga Virtual',
      'carlos': 'Carlos - Coach de Vida',
      'luz': 'Luz - Conselheira Espiritual'
    }
    return therapists[profile] || profile
  }

  const getSessionTypeLabel = (type) => {
    const types = {
      'apoio_emocional': 'Apoio Emocional',
      'gestao_estresse': 'Gestão de Estresse',
      'autoestima': 'Autoestima',
      'relacionamentos': 'Relacionamentos',
      'carreira': 'Carreira',
      'proposito_vida': 'Propósito de Vida'
    }
    return types[type] || type
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando seus dados...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Sua Área Pessoal
        </h1>
        <p className="text-gray-600">
          Acompanhe seu progresso e gerencie sua conta
        </p>
      </div>

      {/* Status da Conta */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Status da Conta</CardTitle>
              <CardDescription>
                {user.is_anonymous ? 'Usuário Anônimo' : user.email}
              </CardDescription>
            </div>
            <Badge 
              variant={user.subscription_active ? 'default' : 'secondary'}
              className={user.subscription_active ? 'bg-purple-600' : ''}
            >
              {user.subscription_active ? 'Premium' : 'Gratuito'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {user.subscription_active ? '∞' : user.free_sessions_remaining}
              </div>
              <div className="text-sm text-gray-600">
                {user.subscription_active ? 'Sessões Ilimitadas' : 'Sessões Restantes'}
              </div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{sessions.length}</div>
              <div className="text-sm text-gray-600">Total de Sessões</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {user.subscription_active ? reports.length : '0'}
              </div>
              <div className="text-sm text-gray-600">Relatórios Gerados</div>
            </div>
          </div>

          {!user.subscription_active && (
            <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-purple-800">
                    Desbloqueie todo o potencial do Desabafa.AI
                  </h3>
                  <p className="text-sm text-purple-600 mt-1">
                    Sessões ilimitadas, relatórios personalizados e muito mais
                  </p>
                </div>
                <Button 
                  onClick={onUpgrade}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Fazer Upgrade
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="sessions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sessions">Minhas Sessões</TabsTrigger>
          <TabsTrigger value="reports" disabled={!user.subscription_active}>
            Relatórios
          </TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        {/* Sessões */}
        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Sessões</CardTitle>
              <CardDescription>
                Suas conversas com os terapeutas virtuais
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sessions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">Você ainda não iniciou nenhuma sessão</p>
                  <Button onClick={() => window.location.href = '/'}>
                    Começar Primeira Sessão
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <div 
                      key={session.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">
                            {getSessionTypeLabel(session.session_type)}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            {getTherapistName(session.therapist_profile)}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatDate(session.created_at)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          {session.message_count} mensagens
                        </span>
                        <Badge 
                          variant={session.is_active ? 'default' : 'secondary'}
                        >
                          {session.is_active ? 'Ativa' : 'Finalizada'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Relatórios */}
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios de Progresso</CardTitle>
              <CardDescription>
                Insights personalizados sobre seu bem-estar emocional
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!user.subscription_active ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">
                    Relatórios disponíveis apenas para usuários Premium
                  </p>
                  <Button onClick={onUpgrade} className="bg-purple-600 hover:bg-purple-700">
                    Fazer Upgrade
                  </Button>
                </div>
              ) : reports.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    Seus relatórios aparecerão aqui após algumas sessões
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div 
                      key={report.id}
                      className="border rounded-lg p-4"
                    >
                      <h3 className="font-semibold mb-2">{report.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{report.summary}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          {formatDate(report.created_at)}
                        </span>
                        <Button variant="outline" size="sm">
                          Ver Relatório
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Configurações da Conta</CardTitle>
              <CardDescription>
                Gerencie suas preferências e assinatura
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {user.subscription_active && (
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Assinatura Premium</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Sua assinatura está ativa até {user.subscription_expires_at ? 
                      formatDate(user.subscription_expires_at) : 'indefinidamente'}
                  </p>
                  <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
                    Cancelar Assinatura
                  </Button>
                </div>
              )}

              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Privacidade</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Suas conversas são privadas e criptografadas
                </p>
                <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
                  Excluir Todos os Dados
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default UserDashboard

