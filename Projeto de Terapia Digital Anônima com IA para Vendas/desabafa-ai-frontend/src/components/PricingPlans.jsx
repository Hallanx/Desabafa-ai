import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'

const PricingPlans = ({ onSelectPlan }) => {
  const [selectedPlan, setSelectedPlan] = useState(null)

  const plans = [
    {
      id: 'free',
      name: 'Gratuito',
      price: 'R$ 0',
      period: '/mês',
      description: 'Experimente o Desabafa.AI',
      features: [
        '3 sessões gratuitas',
        'Acesso aos 3 terapeutas virtuais',
        'Chat por texto',
        'Conversas por voz',
        'Totalmente anônimo'
      ],
      limitations: [
        'Sem histórico de sessões',
        'Sem relatórios personalizados'
      ],
      buttonText: 'Começar Grátis',
      popular: false,
      color: 'border-gray-200'
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 'R$ 14,90',
      period: '/mês',
      description: 'Acesso completo e ilimitado',
      features: [
        'Sessões ilimitadas',
        'Histórico completo de conversas',
        'Relatórios semanais de progresso',
        'Insights personalizados da IA',
        'Acompanhamento emocional',
        'Suporte prioritário',
        'Novos terapeutas em primeira mão'
      ],
      limitations: [],
      buttonText: 'Assinar Premium',
      popular: true,
      color: 'border-purple-500'
    },
    {
      id: 'pontual',
      name: 'Apoio Pontual',
      price: 'R$ 5,90',
      period: '/sessão',
      description: 'Para momentos específicos',
      features: [
        '1 sessão premium',
        'Insights aprofundados',
        'Relatório da sessão',
        'Recomendações personalizadas',
        'Válido por 7 dias'
      ],
      limitations: [
        'Sem histórico permanente'
      ],
      buttonText: 'Comprar Sessão',
      popular: false,
      color: 'border-blue-500'
    }
  ]

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan.id)
    onSelectPlan(plan)
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Escolha seu plano
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Comece gratuitamente e evolua conforme suas necessidades. 
          Todos os planos incluem acesso aos nossos terapeutas virtuais especializados.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`relative ${plan.color} ${plan.popular ? 'ring-2 ring-purple-500' : ''} hover:shadow-lg transition-shadow`}
          >
            {plan.popular && (
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-500 text-white">
                Mais Popular
              </Badge>
            )}
            
            <CardHeader className="text-center">
              <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
              <div className="flex items-baseline justify-center">
                <span className="text-3xl font-bold text-purple-600">{plan.price}</span>
                <span className="text-gray-500 ml-1">{plan.period}</span>
              </div>
              <CardDescription className="mt-2">{plan.description}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-green-600 mb-2">✓ Incluído:</h4>
                <ul className="space-y-1">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {plan.limitations.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-500 mb-2">Limitações:</h4>
                  <ul className="space-y-1">
                    {plan.limitations.map((limitation, index) => (
                      <li key={index} className="text-sm text-gray-500 flex items-start">
                        <span className="text-gray-400 mr-2">•</span>
                        {limitation}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>

            <CardFooter>
              <Button 
                className={`w-full ${
                  plan.popular 
                    ? 'bg-purple-600 hover:bg-purple-700' 
                    : plan.id === 'pontual'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-600 hover:bg-gray-700'
                }`}
                onClick={() => handleSelectPlan(plan)}
              >
                {plan.buttonText}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-12 text-center">
        <div className="bg-gray-50 rounded-lg p-6 max-w-4xl mx-auto">
          <h3 className="text-lg font-semibold mb-4">💳 Formas de Pagamento</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div>
              <strong>Cartão de Crédito</strong>
              <p>Visa, Mastercard, Elo</p>
            </div>
            <div>
              <strong>PIX</strong>
              <p>Aprovação instantânea</p>
            </div>
            <div>
              <strong>Boleto</strong>
              <p>Vencimento em 3 dias</p>
            </div>
          </div>
          <p className="mt-4 text-xs text-gray-500">
            🔒 Pagamentos seguros processados via Stripe. Cancele a qualquer momento.
          </p>
        </div>
      </div>
    </div>
  )
}

export default PricingPlans

