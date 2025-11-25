'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Star, 
  MapPin, 
  DollarSign, 
  Briefcase, 
  Award, 
  Mail, 
  Phone,
  Globe,
  Linkedin,
  Twitter,
  Calendar,
  CheckCircle,
  Shield,
  TrendingUp,
  Clock,
  Languages
} from 'lucide-react';
import { professionalsApi } from '@/lib/api/professionals';
import { uploadApi } from '@/lib/api/upload';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import type { Professional } from '@/types';

export default function ProfessionalProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const professionalId = params.id as string;

  useEffect(() => {
    loadProfessional();
  }, [professionalId]);

  const loadProfessional = async () => {
    try {
      setLoading(true);
      const response = await professionalsApi.getById(professionalId) as any;
      
      if (response.success && response.professional) {
        setProfessional(response.professional);
      } else {
        setError('Professional not found');
      }
    } catch (err: any) {
      setError(err.message || 'Error loading professional profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !professional) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Professional Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  const user = typeof professional.user === 'object' ? professional.user : null;
  const userName = user?.name || 'Professional';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Marketplace
        </Button>

        {/* Header Section */}
        <Card className="mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-5xl font-bold ring-4 ring-blue-100">
                {user?.avatar && !user.avatar.includes('🔧') ? (
                  <img 
                    src={uploadApi.getImageUrl(user.avatar)} 
                    alt={userName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  userName.charAt(0)
                )}
              </div>
            </div>

            {/* Basic Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{userName}</h1>
                  <p className="text-xl text-blue-600 font-semibold mb-2">{professional.trade}</p>
                  {user?.location && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{user.location.city}, {user.location.state}</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  {professional.verified && (
                    <Badge variant="success" className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Verified
                    </Badge>
                  )}
                  {professional.topRated && (
                    <Badge className="bg-orange-500 text-white">
                      ⭐ Top Rated
                    </Badge>
                  )}
                </div>
              </div>

              {/* Bio */}
              {professional.bio && (
                <p className="text-gray-700 mb-4">{professional.bio}</p>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Briefcase className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-gray-900">{professional.yearsExperience}</p>
                  <p className="text-xs text-gray-600">Years Exp.</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-gray-900">{professional.stats.projectsCompleted}</p>
                  <p className="text-xs text-gray-600">Projects</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Star className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-gray-900">{professional.stats.rating.toFixed(1)}</p>
                  <p className="text-xs text-gray-600">Rating</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Clock className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-gray-900">{Math.round(professional.stats.averageResponseTime)}</p>
                  <p className="text-xs text-gray-600">Hrs Response</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI Score */}
            <Card>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-blue-600" />
                AI Trade Score™
              </h2>
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="text-6xl font-bold mb-2">{Math.round(professional.aiScore.total)}</div>
                    <div className="text-xl font-semibold">
                      {professional.aiScore.total >= 9 ? 'Elite Professional' :
                       professional.aiScore.total >= 8 ? 'Top Rated' :
                       professional.aiScore.total >= 7 ? 'Highly Skilled' :
                       professional.aiScore.total >= 6 ? 'Verified Pro' :
                       'Professional'}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-8 h-8 ${
                          star <= Math.floor(professional.stats.rating)
                            ? 'fill-yellow-300 text-yellow-300'
                            : 'text-white/40'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm opacity-90 mb-1">Skill Verification</p>
                    <div className="bg-white/20 rounded-full h-2">
                      <div 
                        className="bg-white rounded-full h-2" 
                        style={{ width: `${(professional.aiScore.skillVerification / 10) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm opacity-90 mb-1">Reliability</p>
                    <div className="bg-white/20 rounded-full h-2">
                      <div 
                        className="bg-white rounded-full h-2" 
                        style={{ width: `${(professional.aiScore.reliability / 10) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm opacity-90 mb-1">Quality</p>
                    <div className="bg-white/20 rounded-full h-2">
                      <div 
                        className="bg-white rounded-full h-2" 
                        style={{ width: `${(professional.aiScore.quality / 10) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm opacity-90 mb-1">Safety</p>
                    <div className="bg-white/20 rounded-full h-2">
                      <div 
                        className="bg-white rounded-full h-2" 
                        style={{ width: `${(professional.aiScore.safety / 10) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-4">
                {professional.stats.reviewCount} verified reviews from completed projects
              </p>
            </Card>

            {/* Specialties */}
            {professional.specialties && professional.specialties.length > 0 && (
              <Card>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Specialties & Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {professional.specialties.map((specialty: string, index: number) => (
                    <Badge key={index} variant="info" className="bg-blue-100 text-blue-800">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}

            {/* Certifications */}
            {professional.certifications && professional.certifications.length > 0 && (
              <Card>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Award className="w-6 h-6 text-blue-600" />
                  Certifications & Licenses
                </h2>
                <div className="space-y-4">
                  {professional.certifications.map((cert: any, index: number) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                      <h3 className="font-semibold text-gray-900">{cert.name}</h3>
                      <p className="text-blue-600">{cert.issuer}</p>
                      <p className="text-sm text-gray-500">
                        Issued: {new Date(cert.dateObtained).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Portfolio */}
            {professional.portfolio && professional.portfolio.length > 0 && (
              <Card>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Portfolio</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {professional.portfolio.map((item: any, index: number) => (
                    <div key={index} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                      {item.imageUrl && (
                        <img 
                          src={item.imageUrl} 
                          alt={item.title}
                          className="w-full h-48 object-cover"
                        />
                      )}
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                        {item.completedDate && (
                          <p className="text-xs text-gray-500">
                            <Calendar className="w-3 h-3 inline mr-1" />
                            {new Date(item.completedDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Pricing */}
            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Pricing</h2>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600 mb-2">Hourly Rate</p>
                <p className="text-3xl font-bold text-green-700">
                  ${professional.hourlyRate?.min}-${professional.hourlyRate?.max}
                </p>
                <p className="text-xs text-gray-500 mt-1">per hour</p>
              </div>
              <div className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                {professional.availability}
              </div>
            </Card>

            {/* Contact */}
            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h2>
              <div className="space-y-3">
                {user?.email && (
                  <Button
                    variant="secondary"
                    className="w-full justify-start"
                    onClick={() => window.location.href = `mailto:${user.email}`}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    {user.email}
                  </Button>
                )}
                
                {professional.contactPreferences?.phoneVisible && user?.phone && (
                  <Button
                    variant="secondary"
                    className="w-full justify-start"
                    onClick={() => window.location.href = `tel:${user.phone}`}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    {user.phone}
                  </Button>
                )}

                {!professional.contactPreferences?.phoneVisible && (
                  <div className="text-sm text-gray-500 italic p-3 bg-gray-50 rounded">
                    Phone number hidden by professional
                  </div>
                )}
              </div>
            </Card>

            {/* Languages */}
            {professional.languages && professional.languages.length > 0 && (
              <Card>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Languages className="w-5 h-5 text-blue-600" />
                  Languages
                </h2>
                <div className="flex flex-wrap gap-2">
                  {professional.languages.map((lang: string, index: number) => (
                    <Badge key={index} className="bg-gray-100 text-gray-800">
                      {lang}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}

            {/* Social Links */}
            {(professional.website || professional.linkedin || professional.twitter) && (
              <Card>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Links</h2>
                <div className="space-y-2">
                  {professional.website && (
                    <a 
                      href={professional.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                    >
                      <Globe className="w-4 h-4" />
                      Website
                    </a>
                  )}
                  {professional.linkedin && (
                    <a 
                      href={professional.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                    >
                      <Linkedin className="w-4 h-4" />
                      LinkedIn
                    </a>
                  )}
                  {professional.twitter && (
                    <a 
                      href={professional.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                    >
                      <Twitter className="w-4 h-4" />
                      Twitter
                    </a>
                  )}
                </div>
              </Card>
            )}

            {/* Insurance */}
            {professional.insurance && professional.insurance.provider && (
              <Card>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  Insurance
                </h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Provider:</span>
                    <span className="font-semibold text-gray-900">{professional.insurance.provider}</span>
                  </div>
                  {professional.insurance.coverage && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Coverage:</span>
                      <span className="font-semibold text-gray-900">
                        ${professional.insurance.coverage.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {professional.insurance.verified && (
                    <Badge variant="success" className="w-full justify-center">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
              </Card>
            )}

            {/* CTA */}
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
              onClick={() => router.push('/control-panel')}
            >
              Request a Quote
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
