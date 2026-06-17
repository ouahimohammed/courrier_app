import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, orderBy, where, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

export const useCourriers = () => {
  const [courriers, setCourriers] = useState([]);
  const [loading, setLoading] = useState(true);

  const generateNumero = async (type) => {
    const year = new Date().getFullYear();
    const prefix = type === 'arrivee' ? 'ARR' : 'DEP';
    
    const q = query(
      collection(db, 'courriers'),
      where('numero', '>=', `${prefix}/${year}/`),
      where('numero', '<=', `${prefix}/${year}/999`)
    );
    
    const snapshot = await getDocs(q);
    const count = snapshot.size;
    const sequence = String(count + 1).padStart(3, '0');
    
    return `${prefix}/${year}/${sequence}`;
  };

  const addCourrier = async (courrierData) => {
    try {
      const numero = await generateNumero(courrierData.type);
      const courrier = {
        ...courrierData,
        numero,
        createdAt: Timestamp.now(),
        date: courrierData.date || new Date().toISOString().split('T')[0],
        status: courrierData.status || 'envoyé'
      };
      
      const docRef = await addDoc(collection(db, 'courriers'), courrier);
      return { success: true, id: docRef.id, numero };
    } catch (error) {
      console.error('Erreur:', error);
      return { success: false, error: error.message };
    }
  };

  const fetchCourriers = async (filters = {}) => {
    setLoading(true);
    try {
      let q = query(collection(db, 'courriers'), orderBy('createdAt', 'desc'));
      
      if (filters.type && filters.type !== 'tous') {
        q = query(q, where('type', '==', filters.type));
      }
      
      if (filters.dateDebut && filters.dateFin) {
        q = query(q, 
          where('date', '>=', filters.dateDebut),
          where('date', '<=', filters.dateFin)
        );
      }
      
      const snapshot = await getDocs(q);
      const courriersList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      let filteredList = courriersList;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredList = courriersList.filter(c => 
          c.numero?.toLowerCase().includes(searchLower) ||
          c.objet?.toLowerCase().includes(searchLower) ||
          c.ville?.toLowerCase().includes(searchLower) ||
          c.destinataire?.toLowerCase().includes(searchLower)
        );
      }
      
      setCourriers(filteredList);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  return { courriers, loading, addCourrier, fetchCourriers };
};
