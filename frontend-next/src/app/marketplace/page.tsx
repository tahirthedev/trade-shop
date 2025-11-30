'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus } from 'lucide-react';
import { professionalsApi } from '@/lib/api/professionals';
import { ProfessionalCard } from '@/components/marketplace/ProfessionalCard';
import { PostJobWizard } from '@/components/marketplace/PostJobWizard';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/LanguageContext';
import type { Professional } from '@/types';

export default function MarketplacePage() {
  const { t } = useTranslation();
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProfession, setSelectedProfession] = useState('');
  const [minRate, setMinRate] = useState('');
  const [maxRate, setMaxRate] = useState('');
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [showPostJobWizard, setShowPostJobWizard] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const router = useRouter();
  const { user } = useAuth();

  const professionOptions = [
    { value: 'Electrician', label: t('common.trades.electrician') },
    { value: 'Plumber', label: t('common.trades.plumber') },
    { value: 'HVAC', label: t('common.trades.hvac') },
    { value: 'Carpenter', label: t('common.trades.carpenter') },
    { value: 'Painter', label: t('common.trades.painter') },
    { value: 'Mason', label: t('common.trades.mason') },
  ];

  useEffect(() => {
    loadProfessionals();
  }, [currentPage]);

  const loadProfessionals = async () => {
    try {
      setLoading(true);
      setError('');
      
      const filters: any = {
        page: currentPage,
        limit: 9
      };
      if (selectedProfession) filters.trade = selectedProfession;
      if (minRate) filters.minRate = parseFloat(minRate);
      if (maxRate) filters.maxRate = parseFloat(maxRate);
      if (searchTerm) filters.search = searchTerm;

      const response = await professionalsApi.getAll(filters);
      
      if (response.success) {
        setProfessionals(response.professionals);
        setTotalPages(response.totalPages);
        setTotalResults(response.total);
      } else {
        setError(t('errors.loadProfessionals'));
      }
    } catch (err: any) {
      setError(err.message || t('errors.loadProfessionals'));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadProfessionals();
  };

  const handleContact = (professional: Professional) => {
    setSelectedProfessional(professional);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedProfession('');
    setMinRate('');
    setMaxRate('');
    setCurrentPage(1);
    setTimeout(loadProfessionals, 0);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            {t('marketplace.title')}
          </h1>
          
          {user && (
            <Button onClick={() => setShowPostJobWizard(true)}>
              <Plus className="w-4 h-4 mr-2" />
              {t('marketplace.postJob')}
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <form onSubmit={handleSearch}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <Input
                label={t('marketplace.filters.search')}
                type="text"
                placeholder={t('marketplace.filters.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {t('marketplace.filters.profession')}
                </label>
                <select
                  value={selectedProfession}
                  onChange={(e) => setSelectedProfession(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                >
                  <option value="">{t('marketplace.filters.allProfessions')}</option>
                  {professionOptions.map((prof) => (
                    <option key={prof.value} value={prof.value}>
                      {prof.label}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label={t('marketplace.filters.minRate')}
                type="number"
                placeholder={t('marketplace.filters.ratePlaceholder')}
                value={minRate}
                onChange={(e) => setMinRate(e.target.value)}
              />

              <Input
                label={t('marketplace.filters.maxRate')}
                type="number"
                placeholder={t('marketplace.filters.ratePlaceholder')}
                value={maxRate}
                onChange={(e) => setMaxRate(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit">
                {t('marketplace.filters.searchBtn')}
              </Button>
              <Button type="button" variant="ghost" onClick={handleClearFilters}>
                {t('marketplace.filters.clearFilters')}
              </Button>
            </div>
          </form>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : professionals.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600 text-lg mb-4">
              {t('marketplace.noResults')}
            </p>
            <Button onClick={handleClearFilters}>
              {t('marketplace.filters.clearFilters')}
            </Button>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">
                {totalResults} {t('marketplace.professionalsFound')}
              </p>
              {totalPages > 1 && (
                <p className="text-gray-600">
                  {t('common.page')} {currentPage} {t('common.of')} {totalPages}
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {professionals.map((professional) => (
                <ProfessionalCard
                  key={professional._id}
                  professional={professional}
                  onContact={handleContact}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center items-center gap-2">
                <Button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  variant="secondary"
                >
                  {t('common.previous')}
                </Button>
                
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      variant={currentPage === page ? 'primary' : 'ghost'}
                      className={currentPage === page ? '' : 'hover:bg-gray-100'}
                    >
                      {page}
                    </Button>
                  ))}
                </div>

                <Button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  variant="secondary"
                >
                  {t('common.next')}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Contact Modal */}
      {selectedProfessional && (() => {
        const user = typeof selectedProfessional.user === 'object' ? selectedProfessional.user : null;
        return (
          <Modal
            isOpen={true}
            onClose={() => setSelectedProfessional(null)}
            title={`${t('marketplace.contact.title')} ${user?.name || t('marketplace.contact.professional')}`}
          >
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">{t('marketplace.contact.profession')}</p>
                <p className="text-gray-900">{selectedProfessional.trade}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">{t('marketplace.contact.email')}</p>
                <p className="text-gray-900">{user?.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">{t('marketplace.contact.phone')}</p>
                <p className="text-gray-900">{user?.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">{t('marketplace.contact.rate')}</p>
                <p className="text-gray-900">
                  ${selectedProfessional.hourlyRate?.min}-${selectedProfessional.hourlyRate?.max}/{t('common.hour')}
                </p>
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600 mb-4">
                  {t('marketplace.contact.hint')}
                </p>
                <Button
                  onClick={() => router.push('/control-panel')}
                  className="w-full"
                >
                  {t('marketplace.contact.createProject')}
                </Button>
              </div>
            </div>
          </Modal>
        );
      })()}

      {/* Post Job Wizard */}
      {showPostJobWizard && (
        <PostJobWizard
          onClose={() => setShowPostJobWizard(false)}
          onSuccess={() => {
            setShowPostJobWizard(false);
            router.push('/jobs');
          }}
        />
      )}
    </div>
  );
}
