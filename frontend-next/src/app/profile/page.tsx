'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { profileApi } from '@/lib/api/profile';
import { uploadApi } from '@/lib/api/upload';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  DollarSign, 
  Award, 
  Upload, 
  X, 
  Plus,
  Camera,
  FileText,
  Link as LinkIcon,
  Calendar,
  Star
} from 'lucide-react';

interface PortfolioItem {
  id?: string;
  title: string;
  description: string;
  imageUrl?: string;
  completedDate?: string;
  clientName?: string;
  budget?: number;
}

interface Certification {
  id?: string;
  name: string;
  issuingOrganization: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
}

interface WorkExperience {
  id?: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate?: string;
  description: string;
  currentlyWorking?: boolean;
}

export default function ProfilePage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'portfolio' | 'experience' | 'certifications'>('profile');

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: '',
    trade: '',
    yearsExperience: 0,
    hourlyRateMin: 0,
    hourlyRateMax: 0,
    availability: 'Available',
    location: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    specialties: [] as string[],
    languages: [] as string[],
    website: '',
    linkedin: '',
    twitter: '',
    phoneVisible: true
  });

  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [workExperience, setWorkExperience] = useState<WorkExperience[]>([]);
  
  const [newSpecialty, setNewSpecialty] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  
  // Modals
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);
  const [showExpModal, setShowExpModal] = useState(false);
  
  const [editingPortfolio, setEditingPortfolio] = useState<PortfolioItem | null>(null);
  const [editingCert, setEditingCert] = useState<Certification | null>(null);
  const [editingExp, setEditingExp] = useState<WorkExperience | null>(null);

  const [professionalId, setProfessionalId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Wait for auth to load
    if (authLoading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }
    
    // Check if user has _id field (new format)
    if (!user._id) {
      console.error('User object missing _id field. Please log in again.');
      setError('Invalid user session. Please log in again.');
      setTimeout(() => router.push('/login'), 2000);
      return;
    }
    
    // Only load if user is a tradesperson
    if (user.userType !== 'tradesperson') {
      setError('Only tradesperson accounts can access the profile page');
      setLoading(false);
      return;
    }
    
    // Load user profile data
    loadProfileData();
  }, [user, authLoading, router]);

  const loadProfileData = async () => {
    if (!user || !user._id) {
      setError('User not found. Please log in again.');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      // Fetch professional profile by user ID
      const response: any = await profileApi.getProfessionalByUserId(user._id);
      
      if (response.success && response.professional) {
        const prof = response.professional;
        setProfessionalId(prof._id);
        
        // Set profile form with professional data
        setProfileForm({
          name: prof.user?.name || user.name,
          email: prof.user?.email || user.email,
          phone: prof.user?.phone || '',
          trade: prof.trade || '',
          yearsExperience: prof.yearsExperience || 0,
          hourlyRateMin: prof.hourlyRate?.min || 0,
          hourlyRateMax: prof.hourlyRate?.max || 0,
          bio: prof.bio || '',
          specialties: prof.specialties || [],
          languages: prof.languages || [],
          website: prof.website || '',
          linkedin: prof.linkedin || '',
          twitter: prof.twitter || '',
          availability: prof.availability || 'Available',
          phoneVisible: prof.contactPreferences?.phoneVisible ?? true,
          location: {
            street: prof.user?.location?.street || '',
            city: prof.user?.location?.city || user.location?.city || '',
            state: prof.user?.location?.state || user.location?.state || '',
            zipCode: prof.user?.location?.zipCode || user.location?.zipCode || ''
          }
        });
        
        // Set portfolio, certifications, work experience
        setPortfolioItems(prof.portfolio || []);
        setCertifications(prof.certifications || []);
        setWorkExperience(prof.workExperience || []);
        
        // Set profile image if exists
        if (prof.user?.avatar) {
          setProfileImage(uploadApi.getImageUrl(prof.user.avatar));
        }
      }
    } catch (error: any) {
      console.error('Error loading profile:', error);
      setError(error.message || 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!professionalId || !user) return;
    
    setSaving(true);
    setError(null);
    try {
      // Update user basic info (name, email, phone, location)
      await profileApi.updateUser(user._id, {
        name: profileForm.name,
        email: profileForm.email,
        phone: profileForm.phone,
        location: {
          street: profileForm.location.street,
          city: profileForm.location.city,
          state: profileForm.location.state,
          zipCode: profileForm.location.zipCode
        }
      });

      // Update professional info
      await profileApi.updateProfile(professionalId, {
        trade: profileForm.trade,
        yearsExperience: profileForm.yearsExperience,
        hourlyRate: {
          min: profileForm.hourlyRateMin,
          max: profileForm.hourlyRateMax
        },
        bio: profileForm.bio,
        specialties: profileForm.specialties,
        languages: profileForm.languages,
        website: profileForm.website,
        linkedin: profileForm.linkedin,
        twitter: profileForm.twitter,
        availability: profileForm.availability,
        contactPreferences: {
          phoneVisible: profileForm.phoneVisible
        }
      });

      alert('Profile updated successfully!');
      
      // Reload profile data to get updated info
      await loadProfileData();
    } catch (error: any) {
      console.error('Error saving profile:', error);
      setError(error.message || 'Failed to save profile');
      alert('Failed to save profile: ' + (error.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const addSpecialty = () => {
    if (newSpecialty.trim() && !profileForm.specialties.includes(newSpecialty.trim())) {
      setProfileForm({
        ...profileForm,
        specialties: [...profileForm.specialties, newSpecialty.trim()]
      });
      setNewSpecialty('');
    }
  };

  const removeSpecialty = (specialty: string) => {
    setProfileForm({
      ...profileForm,
      specialties: profileForm.specialties.filter(s => s !== specialty)
    });
  };

  const addLanguage = () => {
    if (newLanguage.trim() && !profileForm.languages.includes(newLanguage.trim())) {
      setProfileForm({
        ...profileForm,
        languages: [...profileForm.languages, newLanguage.trim()]
      });
      setNewLanguage('');
    }
  };

  const removeLanguage = (language: string) => {
    setProfileForm({
      ...profileForm,
      languages: profileForm.languages.filter(l => l !== language)
    });
  };

  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    let completed = 0;
    let total = 0;

    // Basic Info (30 points)
    total += 30;
    if (profileForm.name) completed += 5;
    if (profileForm.email) completed += 5;
    if (profileForm.phone) completed += 5;
    if (profileForm.location.city && profileForm.location.state) completed += 5;
    if (profileForm.trade) completed += 5;
    if (profileForm.bio) completed += 5;

    // Professional Details (25 points)
    total += 25;
    if (profileForm.yearsExperience > 0) completed += 5;
    if (profileForm.hourlyRateMin > 0 && profileForm.hourlyRateMax > 0) completed += 5;
    if (profileForm.specialties.length > 0) completed += 5;
    if (profileForm.languages.length > 0) completed += 5;
    if (profileForm.availability) completed += 5;

    // Social Links (15 points)
    total += 15;
    if (profileForm.website) completed += 5;
    if (profileForm.linkedin) completed += 5;
    if (profileForm.twitter) completed += 5;

    // Portfolio & Experience (30 points)
    total += 30;
    if (portfolioItems.length > 0) completed += 10;
    if (certifications.length > 0) completed += 10;
    if (workExperience.length > 0) completed += 10;

    return Math.round((completed / total) * 100);
  };

  const profileCompletion = calculateProfileCompletion();
  const completionMessage = 
    profileCompletion === 100 ? 'Complete!' :
    profileCompletion >= 75 ? 'Almost there!' :
    profileCompletion >= 50 ? 'Good progress!' :
    profileCompletion >= 25 ? 'Getting started!' :
    'Let\'s get started!';

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      setUploading(true);
      const response = await uploadApi.uploadImage(file, 'profiles');
      
      if (response.success) {
        const imageUrl = uploadApi.getImageUrl(response.imageUrl);
        setProfileImage(imageUrl);
        
        // Update user avatar
        await profileApi.updateUser(user._id, { avatar: response.imageUrl });
        alert('Profile photo updated successfully!');
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image: ' + (error.message || 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

  const addPortfolioItem = async (item: PortfolioItem) => {
    if (!professionalId) {
      alert('Professional ID not found');
      return;
    }

    try {
      setLoading(true);
      const response: any = await profileApi.addPortfolioItem(professionalId, item);
      
      if (response.success) {
        // Refresh profile data to get updated portfolio
        await loadProfileData();
        setShowPortfolioModal(false);
        setEditingPortfolio(null);
      }
    } catch (error: any) {
      console.error('Error adding portfolio item:', error);
      alert('Failed to add portfolio item: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const deletePortfolioItem = async (id: string) => {
    if (!professionalId) return;
    
    if (!confirm('Are you sure you want to delete this portfolio item?')) {
      return;
    }

    try {
      setLoading(true);
      await profileApi.deletePortfolioItem(professionalId, id);
      // Refresh profile data
      await loadProfileData();
    } catch (error: any) {
      console.error('Error deleting portfolio item:', error);
      alert('Failed to delete portfolio item: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const addCertification = async (cert: Certification) => {
    if (!professionalId) {
      alert('Professional ID not found');
      return;
    }

    try {
      setLoading(true);
      const response: any = await profileApi.addCertification(professionalId, cert);
      
      if (response.success) {
        // Refresh profile data
        await loadProfileData();
        setShowCertModal(false);
        setEditingCert(null);
      }
    } catch (error: any) {
      console.error('Error adding certification:', error);
      alert('Failed to add certification: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const deleteCertification = async (id: string) => {
    if (!professionalId) return;
    
    if (!confirm('Are you sure you want to delete this certification?')) {
      return;
    }

    try {
      setLoading(true);
      await profileApi.deleteCertification(professionalId, id);
      // Refresh profile data
      await loadProfileData();
    } catch (error: any) {
      console.error('Error deleting certification:', error);
      alert('Failed to delete certification: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const addWorkExperience = async (exp: WorkExperience) => {
    if (!professionalId) {
      alert('Professional ID not found');
      return;
    }

    try {
      setLoading(true);
      const response: any = await profileApi.addWorkExperience(professionalId, exp);
      
      if (response.success) {
        // Refresh profile data
        await loadProfileData();
        setShowExpModal(false);
        setEditingExp(null);
      }
    } catch (error: any) {
      console.error('Error adding work experience:', error);
      alert('Failed to add work experience: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const deleteWorkExperience = async (id: string) => {
    if (!professionalId) return;
    
    if (!confirm('Are you sure you want to delete this work experience?')) {
      return;
    }

    try {
      setLoading(true);
      await profileApi.deleteWorkExperience(professionalId, id);
      // Refresh profile data
      await loadProfileData();
    } catch (error: any) {
      console.error('Error deleting work experience:', error);
      alert('Failed to delete work experience: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Show loading spinner while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your professional profile and showcase your work</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
            {error.includes('log in again') && (
              <p className="text-sm mt-2">
                <button 
                  onClick={() => router.push('/login')} 
                  className="underline font-medium hover:text-red-900"
                >
                  Click here to log in
                </button>
              </p>
            )}
          </div>
        )}

        {/* Profile Completion Bar */}
        <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Profile Completion</h3>
              <p className="text-sm text-gray-600">Complete your profile to get more opportunities</p>
            </div>
            <div className="text-right">
              <div className={`text-3xl font-bold ${profileCompletion === 100 ? 'text-green-600' : 'text-blue-600'}`}>
                {profileCompletion}%
              </div>
              <p className="text-xs text-gray-500">{completionMessage}</p>
            </div>
          </div>
          <div className="mt-4 bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${profileCompletion === 100 ? 'bg-green-600' : 'bg-blue-600'}`}
              style={{ width: `${profileCompletion}%` }}
            ></div>
          </div>
        </Card>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('profile')}
              className={`pb-4 px-2 font-semibold transition-colors border-b-2 ${
                activeTab === 'profile'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <User className="w-5 h-5 inline mr-2" />
              Profile Info
            </button>
            <button
              onClick={() => setActiveTab('portfolio')}
              className={`pb-4 px-2 font-semibold transition-colors border-b-2 ${
                activeTab === 'portfolio'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Briefcase className="w-5 h-5 inline mr-2" />
              Portfolio
            </button>
            <button
              onClick={() => setActiveTab('experience')}
              className={`pb-4 px-2 font-semibold transition-colors border-b-2 ${
                activeTab === 'experience'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FileText className="w-5 h-5 inline mr-2" />
              Experience
            </button>
            <button
              onClick={() => setActiveTab('certifications')}
              className={`pb-4 px-2 font-semibold transition-colors border-b-2 ${
                activeTab === 'certifications'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Award className="w-5 h-5 inline mr-2" />
              Certifications
            </button>
          </div>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* Profile Photo */}
            <Card>
              <h2 className="text-2xl font-bold mb-4">Profile Photo</h2>
              <div className="flex items-center gap-6">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  {profileImage || (user?.avatar && !user.avatar.includes('🔧')) ? (
                    <img 
                      src={profileImage || uploadApi.getImageUrl(user?.avatar || '')} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : null}
                  {(!profileImage && (!user?.avatar || user.avatar.includes('🔧'))) && (
                    <div className="text-white text-5xl font-bold">
                      {profileForm.name.charAt(0) || 'U'}
                    </div>
                  )}
                </div>
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button 
                    variant="secondary" 
                    className="mb-2"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    {uploading ? 'Uploading...' : 'Upload Photo'}
                  </Button>
                  <p className="text-sm text-gray-500">JPG, PNG or GIF. Max size 5MB.</p>
                </div>
              </div>
            </Card>

            {/* Basic Info */}
            <Card>
              <h2 className="text-2xl font-bold mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}

                />
                <Input
                  label="Email"
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}

                />
                <Input
                  label="Phone"
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}

                />
                <Input
                  label="Trade/Profession"
                  type="text"
                  value={profileForm.trade}
                  onChange={(e) => setProfileForm({ ...profileForm, trade: e.target.value })}

                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Professional Bio
                </label>
                <textarea
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400 bg-white"
                  placeholder="Tell clients about yourself, your experience, and what makes you unique..."
                />
                <p className="text-sm text-gray-500 mt-1">
                  {profileForm.bio.length}/500 characters
                </p>
              </div>

              {/* Contact Preferences */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Contact Preferences
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <label htmlFor="phoneVisible" className="text-sm font-medium text-gray-900">
                      Show Phone Number to Clients
                    </label>
                    <p className="text-xs text-gray-600 mt-1">
                      Allow clients to see and call your phone number on your profile
                    </p>
                  </div>
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => setProfileForm({ ...profileForm, phoneVisible: !profileForm.phoneVisible })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        profileForm.phoneVisible ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          profileForm.phoneVisible ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Location */}
            <Card>
              <h2 className="text-2xl font-bold mb-4">Location</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Input
                    label="Street Address"
                    type="text"
                    value={profileForm.location.street}
                    onChange={(e) => setProfileForm({ 
                      ...profileForm, 
                      location: { ...profileForm.location, street: e.target.value }
                    })}

                  />
                </div>
                <Input
                  label="City"
                  type="text"
                  value={profileForm.location.city}
                  onChange={(e) => setProfileForm({ 
                    ...profileForm, 
                    location: { ...profileForm.location, city: e.target.value }
                  })}
                />
                <Input
                  label="State"
                  type="text"
                  value={profileForm.location.state}
                  onChange={(e) => setProfileForm({ 
                    ...profileForm, 
                    location: { ...profileForm.location, state: e.target.value }
                  })}
                />
                <Input
                  label="ZIP Code"
                  type="text"
                  value={profileForm.location.zipCode}
                  onChange={(e) => setProfileForm({ 
                    ...profileForm, 
                    location: { ...profileForm.location, zipCode: e.target.value }
                  })}
                />
              </div>
            </Card>

            {/* Professional Details */}
            <Card>
              <h2 className="text-2xl font-bold mb-4">Professional Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <Input
                  label="Years of Experience"
                  type="number"
                  value={profileForm.yearsExperience}
                  onChange={(e) => setProfileForm({ ...profileForm, yearsExperience: parseInt(e.target.value) })}
                />
                <Input
                  label="Hourly Rate (Min)"
                  type="number"
                  value={profileForm.hourlyRateMin}
                  onChange={(e) => setProfileForm({ ...profileForm, hourlyRateMin: parseFloat(e.target.value) })}

                />
                <Input
                  label="Hourly Rate (Max)"
                  type="number"
                  value={profileForm.hourlyRateMax}
                  onChange={(e) => setProfileForm({ ...profileForm, hourlyRateMax: parseFloat(e.target.value) })}

                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Availability Status
                </label>
                <select
                  value={profileForm.availability}
                  onChange={(e) => setProfileForm({ ...profileForm, availability: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                >
                  <option value="Available">Available Now</option>
                  <option value="Busy">Busy - Limited Availability</option>
                  <option value="Unavailable">Not Available</option>
                </select>
              </div>

              {/* Specialties */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Specialties & Skills
                </label>
                <div className="flex gap-2 mb-2">
                  <Input
                    type="text"
                    value={newSpecialty}
                    onChange={(e) => setNewSpecialty(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialty())}
                    placeholder="e.g., Residential Wiring, Circuit Installation"
                  />
                  <Button onClick={addSpecialty} variant="secondary">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profileForm.specialties.map((specialty, index) => (
                    <Badge key={index} variant="info" className="flex items-center gap-1">
                      {specialty}
                      <button onClick={() => removeSpecialty(specialty)}>
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Languages */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Languages
                </label>
                <div className="flex gap-2 mb-2">
                  <Input
                    type="text"
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
                    placeholder="e.g., English, Spanish"
                  />
                  <Button onClick={addLanguage} variant="secondary">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profileForm.languages.map((language, index) => (
                    <Badge key={index} className="flex items-center gap-1">
                      {language}
                      <button onClick={() => removeLanguage(language)}>
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>

            {/* Social Links */}
            <Card>
              <h2 className="text-2xl font-bold mb-4">Social & Web Links</h2>
              <div className="space-y-4">
                <Input
                  label="Website"
                  type="url"
                  value={profileForm.website}
                  onChange={(e) => setProfileForm({ ...profileForm, website: e.target.value })}

                  placeholder="https://yourwebsite.com"
                />
                <Input
                  label="LinkedIn"
                  type="url"
                  value={profileForm.linkedin}
                  onChange={(e) => setProfileForm({ ...profileForm, linkedin: e.target.value })}
                  placeholder="https://linkedin.com/in/yourprofile"
                />
                <Input
                  label="Twitter"
                  type="url"
                  value={profileForm.twitter}
                  onChange={(e) => setProfileForm({ ...profileForm, twitter: e.target.value })}
                  placeholder="https://twitter.com/yourhandle"
                />
              </div>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end gap-4">
              <Button variant="secondary" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button onClick={handleSaveProfile} disabled={saving}>
                {saving ? <Spinner size="sm" /> : 'Save Profile'}
              </Button>
            </div>
          </div>
        )}

        {/* Portfolio Tab */}
        {activeTab === 'portfolio' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold">Portfolio</h2>
                <p className="text-gray-600">Showcase your best work to attract clients</p>
              </div>
              <Button onClick={() => setShowPortfolioModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Project
              </Button>
            </div>

            {portfolioItems.length === 0 ? (
              <Card className="text-center py-12">
                <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No portfolio items yet</h3>
                <p className="text-gray-600 mb-4">Add your projects to showcase your work</p>
                <Button onClick={() => setShowPortfolioModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Project
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {portfolioItems.map((item) => (
                  <Card key={item.id} className="hover:shadow-lg transition-shadow">
                    {item.imageUrl && (
                      <div className="w-full h-48 bg-gray-200 rounded-lg mb-4 overflow-hidden">
                        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-3">{item.description}</p>
                    {item.clientName && (
                      <p className="text-sm text-gray-500 mb-2">Client: {item.clientName}</p>
                    )}
                    {item.budget && (
                      <p className="text-sm font-semibold text-green-600 mb-2">${item.budget}</p>
                    )}
                    {item.completedDate && (
                      <p className="text-xs text-gray-400 mb-3">
                        <Calendar className="w-3 h-3 inline mr-1" />
                        {item.completedDate}
                      </p>
                    )}
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => item.id && deletePortfolioItem(item.id)}
                      className="w-full text-red-600 hover:bg-red-50"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Remove
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Experience Tab */}
        {activeTab === 'experience' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold">Work Experience</h2>
                <p className="text-gray-600">Add your work history and achievements</p>
              </div>
              <Button onClick={() => setShowExpModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Experience
              </Button>
            </div>

            {workExperience.length === 0 ? (
              <Card className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No work experience added</h3>
                <p className="text-gray-600 mb-4">Add your work history to build credibility</p>
                <Button onClick={() => setShowExpModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Experience
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {workExperience.map((exp) => (
                  <Card key={exp.id}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900">{exp.title}</h3>
                        <p className="text-lg text-blue-600 font-semibold">{exp.company}</p>
                        <p className="text-gray-600 flex items-center gap-1 mt-1">
                          <MapPin className="w-4 h-4" />
                          {exp.location}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {exp.startDate} - {exp.currentlyWorking ? 'Present' : exp.endDate}
                        </p>
                        <p className="text-gray-700 mt-3">{exp.description}</p>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => exp.id && deleteWorkExperience(exp.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Certifications Tab */}
        {activeTab === 'certifications' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold">Certifications & Licenses</h2>
                <p className="text-gray-600">Add your professional certifications and licenses</p>
              </div>
              <Button onClick={() => setShowCertModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Certification
              </Button>
            </div>

            {certifications.length === 0 ? (
              <Card className="text-center py-12">
                <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No certifications added</h3>
                <p className="text-gray-600 mb-4">Add certifications to boost your credibility</p>
                <Button onClick={() => setShowCertModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Certification
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {certifications.map((cert) => (
                  <Card key={cert.id} className="border-l-4 border-blue-500">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          <Award className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">{cert.name}</h3>
                            <p className="text-blue-600 font-semibold">{cert.issuingOrganization}</p>
                            <p className="text-sm text-gray-500 mt-1">
                              Issued: {cert.issueDate}
                            </p>
                            {cert.expiryDate && (
                              <p className="text-sm text-gray-500">
                                Expires: {cert.expiryDate}
                              </p>
                            )}
                            {cert.credentialId && (
                              <p className="text-xs text-gray-400 mt-2">
                                ID: {cert.credentialId}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => cert.id && deleteCertification(cert.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Portfolio Modal */}
      {showPortfolioModal && (
        <PortfolioModal
          onClose={() => setShowPortfolioModal(false)}
          onSave={addPortfolioItem}
        />
      )}

      {/* Certification Modal */}
      {showCertModal && (
        <CertificationModal
          onClose={() => setShowCertModal(false)}
          onSave={addCertification}
        />
      )}

      {/* Experience Modal */}
      {showExpModal && (
        <ExperienceModal
          onClose={() => setShowExpModal(false)}
          onSave={addWorkExperience}
        />
      )}
    </div>
  );
}

// Portfolio Modal Component
function PortfolioModal({ onClose, onSave }: { onClose: () => void; onSave: (item: PortfolioItem) => void }) {
  const [form, setForm] = useState<PortfolioItem>({
    title: '',
    description: '',
    imageUrl: '',
    completedDate: '',
    clientName: '',
    budget: 0
  });
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const response: any = await uploadApi.uploadImage(file, 'portfolio');
      if (response.success) {
        setForm({ ...form, imageUrl: response.imageUrl });
        setImagePreview(uploadApi.getImageUrl(response.imageUrl));
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Add Portfolio Project</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Project Title"
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Project Image
              </label>
              <div className="space-y-3">
                {imagePreview || form.imageUrl ? (
                  <div className="relative">
                    <img 
                      src={imagePreview || form.imageUrl} 
                      alt="Portfolio preview" 
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setForm({ ...form, imageUrl: '' });
                        setImagePreview('');
                      }}
                      className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : null}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading ? 'Uploading...' : 'Upload Image'}
                </Button>
                <p className="text-xs text-gray-500">
                  Or enter image URL below (optional if uploaded)
                </p>
              </div>
            </div>
            <Input
              label="Image URL (Optional)"
              type="url"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
            <Input
              label="Client Name"
              type="text"
              value={form.clientName}
              onChange={(e) => setForm({ ...form, clientName: e.target.value })}
            />
            <Input
              label="Budget ($)"
              type="number"
              value={form.budget}
              onChange={(e) => setForm({ ...form, budget: parseFloat(e.target.value) })}
            />
            <Input
              label="Completion Date"
              type="date"
              value={form.completedDate}
              onChange={(e) => setForm({ ...form, completedDate: e.target.value })}
            />

            <div className="flex gap-4 pt-4">
              <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Add Project
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Certification Modal Component
function CertificationModal({ onClose, onSave }: { onClose: () => void; onSave: (cert: Certification) => void }) {
  const [form, setForm] = useState<Certification>({
    name: '',
    issuingOrganization: '',
    issueDate: '',
    expiryDate: '',
    credentialId: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Add Certification</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Certification Name"
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <Input
              label="Issuing Organization"
              type="text"
              value={form.issuingOrganization}
              onChange={(e) => setForm({ ...form, issuingOrganization: e.target.value })}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Issue Date"
                type="date"
                value={form.issueDate}
                onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
                required
              />
              <Input
                label="Expiry Date (Optional)"
                type="date"
                value={form.expiryDate}
                onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
              />
            </div>
            <Input
              label="Credential ID (Optional)"
              type="text"
              value={form.credentialId}
              onChange={(e) => setForm({ ...form, credentialId: e.target.value })}
            />

            <div className="flex gap-4 pt-4">
              <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Add Certification
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Experience Modal Component
function ExperienceModal({ onClose, onSave }: { onClose: () => void; onSave: (exp: WorkExperience) => void }) {
  const [form, setForm] = useState<WorkExperience>({
    title: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    description: '',
    currentlyWorking: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Add Work Experience</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Job Title"
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
            <Input
              label="Company"
              type="text"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              required
            />
            <Input
              label="Location"
              type="text"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Start Date"
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                required
              />
              <Input
                label="End Date"
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                disabled={form.currentlyWorking}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="currentlyWorking"
                checked={form.currentlyWorking}
                onChange={(e) => setForm({ ...form, currentlyWorking: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label htmlFor="currentlyWorking" className="text-sm text-gray-700">
                I currently work here
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Add Experience
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
