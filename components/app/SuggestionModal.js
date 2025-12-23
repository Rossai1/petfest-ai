'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Send, Loader2, MessageSquare } from 'lucide-react';
import { getApiUrl } from '@/config/api';

export default function SuggestionModal({ isOpen, onClose }) {
  const [suggestion, setSuggestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!suggestion.trim()) {
      setError('Por favor, escreva sua sugestão');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(getApiUrl('/api/suggestions'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ suggestion: suggestion.trim() }),
      });

      if (response.ok) {
        setSuccess(true);
        setSuggestion('');
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 2000);
      } else {
        const data = await response.json();
        setError(data.error || 'Erro ao enviar sugestão. Tente novamente.');
      }
    } catch (err) {
      console.error('Erro ao enviar sugestão:', err);
      setError('Erro ao enviar sugestão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setSuggestion('');
      setError(null);
      setSuccess(false);
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/95 sm:bg-black/60 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div 
        className="organic-card w-full max-w-2xl relative max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 sm:top-4 sm:right-4 rounded-full hover:bg-secondary min-h-[44px] min-w-[44px] sm:min-h-[auto] sm:min-w-[auto] touch-manipulation"
          onClick={handleClose}
          disabled={loading}
          aria-label="Fechar modal"
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="pr-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-accent/30 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Dar Sugestão</h2>
          </div>
          <p className="text-muted-foreground mb-6">
            Compartilhe suas ideias para melhorar o PetFest! Sua sugestão será enviada para nossa equipe.
          </p>

          {success ? (
            <div className="py-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/30 mb-4">
                <Send className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">Sugestão enviada com sucesso!</h3>
              <p className="text-muted-foreground">
                Obrigado por contribuir com o PetFest!
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="suggestion" className="block text-sm font-semibold text-foreground mb-2">
                  Sua Sugestão
                </label>
                <textarea
                  id="suggestion"
                  value={suggestion}
                  onChange={(e) => setSuggestion(e.target.value)}
                  placeholder="Descreva sua sugestão de melhoria, novo tema, funcionalidade ou qualquer ideia que você tenha..."
                  className="w-full min-h-[180px] px-4 py-3 rounded-[16px] border border-border bg-white text-foreground text-base sm:text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all placeholder:text-muted-foreground touch-manipulation"
                  disabled={loading}
                  required
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {suggestion.length} caracteres
                </p>
              </div>

              {error && (
                <div className="rounded-[12px] bg-soft-pink/50 border border-terracotta/30 p-3">
                  <p className="text-sm text-terracotta">{error}</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-end pt-2">
                <Button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="btn-outline w-full sm:w-auto min-h-[44px]"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading || !suggestion.trim()}
                  className="btn-primary w-full sm:w-auto min-h-[44px]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Enviar Sugestão
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
