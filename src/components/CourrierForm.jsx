import React, { useState } from 'react';

const CourrierForm = ({ onAddCourrier }) => {
  const [formData, setFormData] = useState({
    type: 'depart',
    date: new Date().toISOString().split('T')[0],
    service: '',
    destinataire: '',
    ville: '',
    objet: '',
    status: 'envoyé'
  });
  
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    const result = await onAddCourrier(formData);
    
    if (result.success) {
      setFormData({
        type: 'depart',
        date: new Date().toISOString().split('T')[0],
        service: '',
        destinataire: '',
        ville: '',
        objet: '',
        status: 'envoyé'
      });
      alert(`Courrier ajouté avec succès ! Numéro: ${result.numero}`);
    } else {
      alert(`Erreur: ${result.error}`);
    }
    
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Nouveau Courrier</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type *
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="arrivee">Arrivée</option>
            <option value="depart">Départ</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date *
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Service *
          </label>
          <input
            type="text"
            name="service"
            value={formData.service}
            onChange={handleChange}
            placeholder="Ex: Direction Générale"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Destinataire *
          </label>
          <input
            type="text"
            name="destinataire"
            value={formData.destinataire}
            onChange={handleChange}
            placeholder="Nom du destinataire"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ville *
          </label>
          <input
            type="text"
            name="ville"
            value={formData.ville}
            onChange={handleChange}
            placeholder="Ville"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Statut
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="envoyé">Envoyé</option>
            <option value="en cours">En cours</option>
            <option value="reçu">Reçu</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Objet *
          </label>
          <textarea
            name="objet"
            value={formData.objet}
            onChange={handleChange}
            rows="3"
            placeholder="Objet du courrier"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      <div className="mt-4">
        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
        >
          {submitting ? 'Ajout en cours...' : 'Ajouter le courrier'}
        </button>
      </div>
    </form>
  );
};

export default CourrierForm;
