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
import type { Professional } from '@/types';

export default function MarketplacePage() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProfession, setSelectedProfession] = useState('');
  const [minRate, setMinRate] = useState('');
  const [maxRate, setMaxRate] = useState('');
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [showPostJobWizard, setShowPostJobWizard] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  const professionOptions = [
    'Electricista',
    'Plomero',
    'HVAC',
    'Carpintero',
    'Pintor',
    'Albañil',
  ];

  useEffect(() => {
    loadProfessionals();
  }, []);

  const loadProfessionals = async () => {
    try {
      setLoading(true);
      setError('');
      
      const filters: any = {};
      if (selectedProfession) filters.profession = selectedProfession;
      if (minRate) filters.minRate = parseFloat(minRate);
      if (maxRate) filters.maxRate = parseFloat(maxRate);
      if (searchTerm) filters.search = searchTerm;

      const response = await professionalsApi.getAll(filters);
      
      if (response.success) {
        setProfessionals(response.professionals);
      } else {
        setError('Error al cargar profesionales');
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar profesionales');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
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
    setTimeout(loadProfessionals, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            Encuentra Profesionales
          </h1>
          
          {user && (
            <Button onClick={() => setShowPostJobWizard(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Post a Job
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <form onSubmit={handleSearch}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <Input
                label="Buscar"
                type="text"
                placeholder="Nombre o palabra clave..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Profesión
                </label>
                <select
                  value={selectedProfession}
                  onChange={(e) => setSelectedProfession(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                >
                  <option value="">Todas las profesiones</option>
                  {professionOptions.map((prof) => (
                    <option key={prof} value={prof}>
                      {prof}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Tarifa mínima"
                type="number"
                placeholder="$/hora"
                value={minRate}
                onChange={(e) => setMinRate(e.target.value)}
              />

              <Input
                label="Tarifa máxima"
                type="number"
                placeholder="$/hora"
                value={maxRate}
                onChange={(e) => setMaxRate(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit">
                Buscar
              </Button>
              <Button type="button" variant="ghost" onClick={handleClearFilters}>
                Limpiar Filtros
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
              No se encontraron profesionales con los filtros seleccionados
            </p>
            <Button onClick={handleClearFilters}>
              Limpiar Filtros
            </Button>
          </div>
        ) : (
          <>
            <p className="text-gray-600 mb-6">
              {professionals.length} profesional{professionals.length !== 1 ? 'es' : ''} encontrado{professionals.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {professionals.map((professional) => (
                <ProfessionalCard
                  key={professional._id}
                  professional={professional}
                  onContact={handleContact}
                />
              ))}
            </div>
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
            title={`Contactar a ${user?.name || 'Profesional'}`}
          >
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Profesión</p>
                <p className="text-gray-900">{selectedProfessional.trade}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Email</p>
                <p className="text-gray-900">{user?.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Teléfono</p>
                <p className="text-gray-900">{user?.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Tarifa</p>
                <p className="text-gray-900">
                  ${selectedProfessional.hourlyRate?.min}-${selectedProfessional.hourlyRate?.max}/hora
                </p>
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600 mb-4">
                  Puedes contactar a este profesional directamente por correo o teléfono.
                  También puedes crear un proyecto y esperar propuestas.
                </p>
                <Button
                  onClick={() => router.push('/control-panel')}
                  className="w-full"
                >
                  Crear Proyecto
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
