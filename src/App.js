import React, { useEffect, useState } from 'react';
import { useCourriers } from './hooks/useCourriers';
import CourrierForm from './components/CourrierForm';
import CourrierTable from './components/CourrierTable';
import SearchFilters from './components/SearchFilters';

function App() {
  const { courriers, loading, addCourrier, fetchCourriers } = useCourriers();
  const [filters, setFilters] = useState({
    search: '',
    type: 'tous',
    dateDebut: '',
    dateFin: ''
  });

  useEffect(() => {
    fetchCourriers(filters);
  }, []);

  const handleSearch = () => {
    fetchCourriers(filters);
  };

  const handleAddCourrier = async (courrierData) => {
    const result = await addCourrier(courrierData);
    if (result.success) {
      await fetchCourriers(filters);
    }
    return result;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Gestion de Courrier Administratif
          </h1>
          <p className="text-gray-600">
            Suivi des courriers entrants et sortants
          </p>
        </div>

        <CourrierForm onAddCourrier={handleAddCourrier} />

        <SearchFilters
          filters={filters}
          onFilterChange={setFilters}
          onSearch={handleSearch}
        />

        <CourrierTable courriers={courriers} loading={loading} />
      </div>

      <footer className="bg-white border-t border-gray-200 mt-8">
        <div className="container mx-auto px-4 py-4 text-center text-gray-600">
          Développé par Mohamed Ouahi
        </div>
      </footer>
    </div>
  );
}

export default App;
