'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Save, Copy, Check } from 'lucide-react';
import { themes } from '@/lib/data/themes-data';
import Link from 'next/link';

export default function AdminPromptsPage() {
  const { isLoaded, user } = useUser();
  const router = useRouter();
  const [prompts, setPrompts] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  useEffect(() => {
    if (isLoaded) {
      checkAdminAndLoadPrompts();
    }
  }, [isLoaded]);

  const checkAdminAndLoadPrompts = async () => {
    try {
      // Verificar se é admin
      const response = await fetch('/api/admin/prompts');
      if (response.status === 403) {
        // Não é admin, redirecionar
        router.push('/');
        return;
      }
      
      if (response.ok) {
        const data = await response.json();
        setPrompts(data.prompts || {});
        setIsAdmin(true);
      }
    } catch (error) {
      console.error('Erro ao verificar admin:', error);
      router.push('/');
    } finally {
      setLoading(false);
      setCheckingAdmin(false);
    }
  };

  const handlePromptChange = (themeId, value) => {
    setPrompts((prev) => ({
      ...prev,
      [themeId]: value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);

    try {
      const response = await fetch('/api/admin/prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompts }),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao salvar prompts');
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar prompts. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = (themeId) => {
    navigator.clipboard.writeText(prompts[themeId]);
    setCopied(themeId);
    setTimeout(() => setCopied(null), 2000);
  };

  const getThemeName = (themeId) => {
    return themes[themeId]?.name || themeId;
  };

  const getThemeIcon = (themeId) => {
    return themes[themeId]?.icon || '🎨';
  };

  if (!isLoaded || loading || checkingAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Será redirecionado
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Gerenciar Prompts</h1>
              <p className="text-muted-foreground">
                Edite os prompts dos temas do PetFest
              </p>
            </div>
            <div className="flex gap-3">
              <Button asChild variant="outline">
                <Link href="/">Voltar para Home</Link>
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Todos
                  </>
                )}
              </Button>
            </div>
          </div>

          {success && (
            <Card className="p-4 bg-green-500/10 border-green-500/20">
              <p className="text-sm font-medium text-green-700 dark:text-green-400">
                ✅ Prompts salvos com sucesso!
              </p>
            </Card>
          )}
        </div>

        {/* Prompts Editor */}
        <div className="space-y-6">
          {Object.keys(themes).map((themeId) => (
            <Card key={themeId} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getThemeIcon(themeId)}</span>
                  <div>
                    <h3 className="text-xl font-semibold">
                      {getThemeName(themeId)}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      ID: {themeId}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(themeId)}
                >
                  {copied === themeId ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copiar
                    </>
                  )}
                </Button>
              </div>

              <div>
                <label
                  htmlFor={`prompt-${themeId}`}
                  className="block text-sm font-medium mb-2"
                >
                  Prompt
                </label>
                <textarea
                  id={`prompt-${themeId}`}
                  value={prompts[themeId] || ''}
                  onChange={(e) => handlePromptChange(themeId, e.target.value)}
                  className="w-full min-h-[300px] px-4 py-3 rounded-md border border-input bg-background text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  placeholder="Cole ou edite o prompt aqui..."
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {prompts[themeId]?.length || 0} caracteres
                </p>
              </div>
            </Card>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="mt-8 flex justify-end gap-3">
          <Button asChild variant="outline">
            <Link href="/">Cancelar</Link>
          </Button>
          <Button onClick={handleSave} disabled={saving} size="lg">
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar Todos os Prompts
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

