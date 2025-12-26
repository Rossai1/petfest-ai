'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/auth/client';
import { getApiUrl } from '@/config/api';
import { toast } from 'sonner';

const UserDataContext = createContext(null);

export function UserDataProvider({ children }) {
  const supabase = createClient();
  const [user, setUser] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Estados para dados do usuário
  const [results, setResults] = useState([]);
  const [credits, setCredits] = useState(0);
  const [plan, setPlan] = useState('free');
  const [isLoading, setIsLoading] = useState(true);

  // Verificar autenticação ao montar
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setIsLoaded(true);
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoaded(true);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  // Função para carregar todos os dados do usuário a partir da API
  const loadUserData = useCallback(async () => {
    if (!isLoaded || !user) {
      // Não tenta carregar se não estiver pronto ou não houver usuário
      if (isLoaded && !user) setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch(getApiUrl('/api/user-data'));
      
      if (response.ok) {
        const data = await response.json();
        
        setResults(data.results || []);
        setCredits(data.credits !== null ? data.credits : 0);
        setPlan(data.plan || 'free');

        // Exibir toasts para eventos específicos
        if (data.linkedCredits) {
          toast.success('Assinatura e créditos vinculados com sucesso!');
        }
        if (data.wasReset) {
          toast.info('Seus créditos gratuitos foram renovados!');
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        toast.error(errorData.error || 'Não foi possível carregar os dados do usuário.');
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      toast.error('Ocorreu um erro de rede ao buscar seus dados.');
    } finally {
      setIsLoading(false);
    }
  }, [user, isLoaded]);

  // Carrega os dados quando o estado de autenticação muda
  useEffect(() => {
    if (isLoaded) {
      if (user) {
        loadUserData();
      } else {
        // Limpa os dados se o usuário fizer logout
        setResults([]);
        setCredits(0);
        setPlan('free');
        setIsLoading(false);
      }
    }
  }, [isLoaded, user, loadUserData]);

  /**
   * Função para atualização otimista dos créditos na UI
   * Ex: updateCreditsLocally(prev => prev - 1)
   */
  const updateCreditsLocally = useCallback((updater) => {
    setCredits(updater);
  }, []);

  const value = {
    // Dados
    results,
    credits,
    plan,
    isLoading,
    user, // Adicionar user para compatibilidade
    
    // Funções
    setResults,
    updateCreditsLocally,
    refreshUserData: loadUserData, // Para forçar a recarga de dados
  };

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  );
}

/**
 * Hook para acessar o contexto de dados do usuário
 */
export function useUserData() {
  const context = useContext(UserDataContext);
  if (!context) {
    throw new Error('useUserData deve ser usado dentro de UserDataProvider');
  }
  return context;
}
