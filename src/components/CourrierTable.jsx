import React from 'react';

const getStatusBadge = (status) => {
  const styles = {
    'envoyé': 'bg-green-100 text-green-800',
    'en cours': 'bg-yellow-100 text-yellow-800',
    'reçu': 'bg-blue-100 text-blue-800'
  };
  
  return styles[status] || 'bg-gray-100 text-gray-800';
};

const getTypeBadge = (type) => {
  return type === 'arrivee' 
    ? 'bg-purple-100 text-purple-800'
    : 'bg-orange-100 text-orange-800';
};

const CourrierTable = ({ courriers, loading }) => {
  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">Chargement...</p>
      </div>
    );
  }

  if (courriers.length === 0) {
    return (
      <div className="text-center py-8 bg-white rounded-lg shadow">
        <p className="text-gray-500">Aucun courrier trouvé</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Numéro
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Destinataire
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ville
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Objet
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Statut
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {courriers.map((courrier) => (
            <tr key={courrier.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {courrier.numero}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {courrier.date}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {courrier.destinataire}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {courrier.ville}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                {courrier.objet}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 text-xs rounded-full ${getTypeBadge(courrier.type)}`}>
                  {courrier.type === 'arrivee' ? 'Arrivée' : 'Départ'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(courrier.status)}`}>
                  {courrier.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CourrierTable;
