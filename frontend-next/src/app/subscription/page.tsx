'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Crown, Zap } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { paymentsApi } from '@/lib/api/payments';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';

interface PricingTier {
  name: string;
  price: number;
  priceId: string;
  features: string[];
  popular?: boolean;
  icon: React.ReactNode;
}

export default function SubscriptionPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  const tiers: PricingTier[] = [
    {
      name: 'Básico',
      price: 0,
      priceId: 'free',
      icon: <Zap className="w-8 h-8" />,
      features: [
        'Hasta 3 proyectos activos',
        'Búsqueda básica de profesionales',
        'Mensajería limitada',
        'Soporte por email',
      ],
    },
    {
      name: 'Profesional',
      price: 29,
      priceId: 'price_professional',
      icon: <Crown className="w-8 h-8" />,
      popular: true,
      features: [
        'Proyectos ilimitados',
        'Búsqueda avanzada con filtros',
        'Mensajería ilimitada',
        'Asistente AI para análisis de proyectos',
        'Verificación de profesionales',
        'Soporte prioritario 24/7',
        'Estadísticas detalladas',
        'Insignia de miembro premium',
      ],
    },
    {
      name: 'Empresa',
      price: 99,
      priceId: 'price_enterprise',
      icon: <Crown className="w-8 h-8" />,
      features: [
        'Todo en Profesional',
        'Múltiples usuarios/proyectos',
        'API access',
        'Gestor de cuenta dedicado',
        'Facturación personalizada',
        'Contratos personalizados',
        'Capacitación del equipo',
      ],
    },
  ];

  const handleSubscribe = async (priceId: string) => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (priceId === 'free') {
      return; // Already on free tier
    }

    try {
      setLoading(priceId);
      setError('');

      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const response = await paymentsApi.createCheckoutSession(priceId, token) as any;

      if (response?.success && response?.url) {
        window.location.href = response.url;
      } else {
        setError('Error al iniciar el proceso de pago');
      }
    } catch (err: any) {
      setError(err.message || 'Error al procesar la suscripción');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Elige el Plan Perfecto para Ti
          </h1>
          <p className="text-xl text-gray-600">
            Desbloquea funciones premium y lleva tus proyectos al siguiente nivel
          </p>
        </div>

        {error && (
          <div className="max-w-4xl mx-auto mb-8 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {tiers.map((tier) => (
            <Card
              key={tier.name}
              className={`relative ${
                tier.popular
                  ? 'border-2 border-blue-500 shadow-xl'
                  : ''
              }`}
            >
              {tier.popular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <Badge variant="success" className="text-sm px-4 py-1">
                    Más Popular
                  </Badge>
                </div>
              )}

              <div className="text-center mb-6">
                <div className={`inline-flex p-4 rounded-full mb-4 ${
                  tier.popular
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {tier.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {tier.name}
                </h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-gray-900">
                    ${tier.price}
                  </span>
                  <span className="text-gray-600">/mes</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleSubscribe(tier.priceId)}
                disabled={loading === tier.priceId}
                className={`w-full ${
                  tier.popular
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : ''
                }`}
              >
                {loading === tier.priceId ? (
                  <Spinner size="sm" />
                ) : tier.price === 0 ? (
                  'Gratis'
                ) : (
                  'Suscribirse'
                )}
              </Button>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Preguntas Frecuentes
          </h2>
          <div className="space-y-6">
            <Card>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                ¿Puedo cancelar mi suscripción en cualquier momento?
              </h3>
              <p className="text-gray-600">
                Sí, puedes cancelar tu suscripción en cualquier momento desde tu perfil.
                Mantendrás acceso a las funciones premium hasta el final del período de facturación.
              </p>
            </Card>

            <Card>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                ¿Qué métodos de pago aceptan?
              </h3>
              <p className="text-gray-600">
                Aceptamos todas las principales tarjetas de crédito y débito a través de Stripe,
                nuestra plataforma de pago segura.
              </p>
            </Card>

            <Card>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                ¿Ofrecen descuentos para pagos anuales?
              </h3>
              <p className="text-gray-600">
                Sí, ofrecemos un 20% de descuento en suscripciones anuales.
                Contáctanos para más información.
              </p>
            </Card>

            <Card>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                ¿Puedo cambiar de plan más adelante?
              </h3>
              <p className="text-gray-600">
                Absolutamente. Puedes actualizar o degradar tu plan en cualquier momento.
                Los cambios se reflejarán en tu próxima factura.
              </p>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-4">
            ¿Necesitas ayuda para elegir el plan adecuado?
          </p>
          <Button variant="ghost" onClick={() => router.push('/contact')}>
            Contacta con Ventas
          </Button>
        </div>
      </div>
    </div>
  );
}
