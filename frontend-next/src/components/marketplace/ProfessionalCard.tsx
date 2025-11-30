import { Star, MapPin, DollarSign, Clock, Briefcase, Award, Mail, Phone } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useTranslation } from '@/context/LanguageContext';
import type { Professional, User } from '@/types';

interface ProfessionalCardProps {
  professional: Professional;
  onContact: (professional: Professional) => void;
}

export function ProfessionalCard({ professional, onContact }: ProfessionalCardProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const user = typeof professional.user === 'object' ? professional.user : null;
  const userName = user?.name || t('professional.card.professional');
  
  // AI Score display logic
  const aiScore = professional.aiScore?.total || 0;
  const getScoreLabel = (score: number) => {
    if (score >= 900) return t('professional.card.eliteProfessional');
    if (score >= 800) return t('professional.card.topRatedLabel');
    if (score >= 700) return t('professional.card.highlySkilled');
    if (score >= 600) return t('professional.card.verifiedPro');
    return t('professional.card.professional');
  };

  const getScoreColor = (score: number) => {
    if (score >= 900) return 'from-purple-600 to-purple-700';
    if (score >= 800) return 'from-blue-600 to-blue-700';
    if (score >= 700) return 'from-green-600 to-green-700';
    return 'from-gray-600 to-gray-700';
  };
  
  return (
    <Card className="hover:shadow-xl transition-all duration-300 border border-gray-200">
      <div className="flex flex-col">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold flex-shrink-0 ring-4 ring-blue-100">
              {userName.charAt(0)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-2xl font-bold text-gray-900 truncate">
                  {userName}
                </h3>
                {professional.verified && (
                  <Badge variant="success" className="flex items-center gap-1 flex-shrink-0">
                    <Award className="w-3 h-3" />
                    {t('professional.card.verified')}
                  </Badge>
                )}
                {professional.topRated && (
                  <Badge className="bg-orange-500 text-white flex-shrink-0">
                    ⭐ {t('professional.card.topRated')}
                  </Badge>
                )}
              </div>
              <p className="text-lg text-blue-600 font-semibold truncate">{professional.trade}</p>
              {user?.location && (
                <div className="flex items-center gap-1 text-gray-600 text-sm mt-1">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{user.location.city}, {user.location.state}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Score Section */}
        <div className={`bg-gradient-to-r ${getScoreColor(aiScore)} text-white rounded-lg p-6 mb-4`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-6xl font-bold mb-1">{Math.round(aiScore)}</div>
              <div className="text-lg font-semibold">{getScoreLabel(aiScore)}</div>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-90">{t('professional.card.aiScore')}</div>
            </div>
          </div>
          
          {/* Star Rating */}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/20">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-6 h-6 ${
                  star <= Math.floor(professional.stats.rating)
                    ? 'fill-yellow-300 text-yellow-300'
                    : 'text-white/40'
                }`}
              />
            ))}
            <span className="ml-2 text-lg font-semibold">
              {professional.stats.rating.toFixed(1)} ({professional.stats.reviewCount})
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-4 text-center">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-gray-900">{professional.yearsExperience}</div>
            <div className="text-xs text-gray-600 uppercase mt-1">{t('professional.card.yearsExp')}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-gray-900">{professional.stats.projectsCompleted}</div>
            <div className="text-xs text-gray-600 uppercase mt-1">{t('professional.card.projects')}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-gray-900">{Math.round(professional.stats.averageResponseTime)} hrs</div>
            <div className="text-xs text-gray-600 uppercase mt-1">{t('professional.card.answer')}</div>
          </div>
        </div>

        {/* Specialties */}
        {professional.specialties && professional.specialties.length > 0 && (
          <div className="mb-4">
            <div className="text-sm font-semibold text-gray-700 mb-2 uppercase">{t('professional.card.specialties')}</div>
            <div className="flex flex-wrap gap-2">
              {professional.specialties.slice(0, 4).map((specialty: string, index: number) => (
                <Badge key={index} variant="info" className="bg-blue-50 text-blue-700">
                  {specialty}
                </Badge>
              ))}
              {professional.specialties.length > 4 && (
                <Badge variant="info" className="bg-gray-100 text-gray-700">
                  +{professional.specialties.length - 4} {t('professional.card.more')}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Hourly Rate */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-gray-700 uppercase">{t('professional.hourlyRate')}</div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <span className="text-2xl font-bold text-gray-900">
                ${professional.hourlyRate?.min}-{professional.hourlyRate?.max}
              </span>
            </div>
          </div>
          <div className="mt-2">
            <div className="bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded-full inline-block">
              {professional.availability}
            </div>
          </div>
        </div>

        {/* Contact Options */}
        <div className="space-y-2">
          <Button
            onClick={() => router.push(`/professional/${professional._id}`)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 text-lg"
          >
            {t('professional.card.viewFullProfile')}
          </Button>
          
          <div className="grid grid-cols-2 gap-2">
            {/* Email Button */}
            <Button
              onClick={(e) => {
                e.stopPropagation();
                if (user?.email) {
                  window.location.href = `mailto:${user.email}?subject=TradeShop Inquiry - ${professional.trade}`;
                }
              }}
              variant="secondary"
              className="flex items-center justify-center gap-2"
              disabled={!user?.email}
            >
              <Mail className="w-4 h-4" />
              {t('professional.card.email')}
            </Button>
            
            {/* Phone Button - Only show if phoneVisible is true */}
            {professional.contactPreferences?.phoneVisible && user?.phone && (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.href = `tel:${user.phone}`;
                }}
                variant="secondary"
                className="flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" />
                {t('professional.card.call')}
              </Button>
            )}
            
            {/* Placeholder if phone not visible */}
            {(!professional.contactPreferences?.phoneVisible || !user?.phone) && (
              <Button
                variant="secondary"
                className="flex items-center justify-center gap-2 opacity-50 cursor-not-allowed"
                disabled
              >
                <Phone className="w-4 h-4" />
                {t('professional.card.phoneHidden')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
