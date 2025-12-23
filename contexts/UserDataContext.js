'use client';

import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';

const UserDataContext = createContext(null);

/**
 * Provider SIMPLIFICADO - Apenas histórico de resultados
 */
export function UserDataProvider({ children }) {
  const { user, isLoaded } = useUser();
  
  // Estados
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Ref para evitar chamadas duplicadas
  const hasFetchedRef = useRef(false);
  const fetchingRef = useRef(false);

  // Função única para carregar dados
  const loadUserData = useCallback(async (force = false) => {
    // Evitar chamadas duplicadas
    if (fetchingRef.current && !force) return;
    if (hasFetchedRef.current && !force) return;
    
    fetchingRef.current = true;
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/user-data');
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.results) {
          setResults(data.results);
        }
        
        hasFetchedRef.current = true;
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
      fetchingRef.current = false;
    }
  }, []);

  // Função para atualizar após geração
  const refreshAfterGeneration = useCallback(async () => {
    hasFetchedRef.current = false;
    await loadUserData(true);
  }, [loadUserData]);

  // Carregar dados UMA VEZ quando usuário está disponível
  useEffect(() => {
    if (isLoaded && user && !hasFetchedRef.current) {
      loadUserData();
    } else if (isLoaded && !user) {
      // Limpar dados se deslogado
      hasFetchedRef.current = false;
      setResults([]);
      setIsLoading(false);
    }
  }, [isLoaded, user, loadUserData]);

  const value = {
    // Resultados
    results,
    resultsLoading: isLoading,
    setResults,
    
    // Funções
    refreshAfterGeneration,
    loadUserData,
    
    // Estado geral
    isLoading,
  };

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  );
}

/**
 * Hook para acessar dados do usuário
 */
export function useUserData() {
  const context = useContext(UserDataContext);
  if (!context) {
    throw new Error('useUserData deve ser usado dentro de UserDataProvider');
  }
  return context;
}

/**
 * Hook simplificado para acessar apenas resultados
 */
export function useResults() {
  const { results, resultsLoading, setResults } = useUserData();
  return { results, loading: resultsLoading, setResults };
}
