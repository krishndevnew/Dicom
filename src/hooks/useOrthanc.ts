import { useState, useEffect } from 'react';
import { orthancService, GroupedPatientStudy } from '../services/orthancService';

export function useOrthanc() {
  const [groupedStudies, setGroupedStudies] = useState<GroupedPatientStudy[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOrthancAvailable, setIsOrthancAvailable] = useState(false);

  useEffect(() => {
    checkOrthancStatus();
  }, []);

  const checkOrthancStatus = async () => {
    const available = await orthancService.checkOrthancAvailability();
    setIsOrthancAvailable(available);
  };

  const loadStudies = async () => {
    if (!isOrthancAvailable) return;

    setIsLoading(true);
    setError(null);

    try {
      const studies = await orthancService.getGroupedStudies();
      setGroupedStudies(studies);
    } catch (err) {
      setError('Failed to load studies from Orthanc');
      console.error('Error loading studies:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshStudies = () => {
    loadStudies();
  };

  return {
    groupedStudies,
    isLoading,
    error,
    isOrthancAvailable,
    refreshStudies
  };
}