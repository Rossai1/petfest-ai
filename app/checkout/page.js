'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { getPackageData } from '@/lib/data/packages';
import { QRCodeSVG } from 'qrcode.react';
import { getApiUrl } from '@/lib/config/api';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  
  const plan = searchParams.get('plan');
  const type = searchParams.get('type');
  
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [billingId, setBillingId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isLoaded && !user) {
      router.push(`/sign-in?redirect_url=/checkout?plan=${plan}&type=${type}`);
    }
  }, [isLoaded, user, plan, type, router]);

  const packageData = getPackageData(plan, type);

  if (!packageData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Plano inválido</h2>
          <p className="text-gray-600 mb-4">
            O plano selecionado não foi encontrado.
          </p>
          <button
            onClick={() => router.push('/app')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Voltar ao App
          </button>
        </div>
      </div>
    );
  }

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // #region agent log
      const apiUrl = getApiUrl('/api/abacate/create-billing');
      fetch('http://127.0.0.1:7243/ingest/647110f7-315d-4dcf-9dc7-3ded3b6781fc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'checkout/page.js:55',message:'Calling API',data:{apiUrl,plan,type,origin:window.location.origin,pathname:window.location.pathname},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'C',runId:'initial'})}).catch(()=>{});
      // #endregion
      
      const response = await fetch(getApiUrl('/api/abacate/create-billing'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, type }),
      });
      
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/647110f7-315d-4dcf-9dc7-3ded3b6781fc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'checkout/page.js:62',message:'API Response',data:{status:response.status,ok:response.ok,url:response.url},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A',runId:'initial'})}).catch(()=>{});
      // #endregion
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao processar pagamento');
      }
      
      if (type === 'subscription') {
        // Redirecionar para página de pagamento com cartão
        window.location.href = data.checkoutUrl;
      } else {
        // Exibir QR Code PIX
        setQrCode(data.qrCode);
        setBillingId(data.billingId);
        startPaymentPolling(data.billingId);
      }
    } catch (error) {
      console.error('Erro:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const startPaymentPolling = (id) => {
    const interval = setInterval(async () => {
      try {
        // #region agent log
        const statusUrl = getApiUrl(`/api/abacate/billing-status?id=${id}`);
        fetch('http://127.0.0.1:7243/ingest/647110f7-315d-4dcf-9dc7-3ded3b6781fc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'checkout/page.js:90',message:'Polling status',data:{statusUrl,billingId:id},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'C',runId:'initial'})}).catch(()=>{});
        // #endregion
        
        const response = await fetch(getApiUrl(`/api/abacate/billing-status?id=${id}`));
        
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/647110f7-315d-4dcf-9dc7-3ded3b6781fc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'checkout/page.js:95',message:'Status response',data:{status:response.status,ok:response.ok},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A',runId:'initial'})}).catch(()=>{});
        // #endregion
        
        const data = await response.json();
        
        if (data.status === 'PAID') {
          clearInterval(interval);
          router.push('/app?payment=success');
        }
      } catch (error) {
        console.error('Erro ao verificar status:', error);
      }
    }, 3000); // Verificar a cada 3 segundos

    // Limpar interval após 10 minutos
    setTimeout(() => clearInterval(interval), 600000);
  };

  const copyPixCode = () => {
    if (qrCode) {
      navigator.clipboard.writeText(qrCode);
      alert('Código PIX copiado!');
    }
  };

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {!qrCode ? (
          // Tela de resumo do pedido
          <div className="bg-white rounded-lg shadow-xl p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Finalizar Compra
            </h1>
            <p className="text-gray-600 mb-6">
              Você está prestes a adquirir:
            </p>

            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-6 text-white mb-6">
              <h2 className="text-xl font-bold mb-2">{packageData.name}</h2>
              <p className="text-sm opacity-90 mb-4">{packageData.description}</p>
              <div className="text-3xl font-bold">
                R$ {packageData.price.toFixed(2).replace('.', ',')}
              </div>
              <p className="text-sm opacity-75 mt-1">
                {type === 'subscription' ? 'por mês' : 'pagamento único'}
              </p>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Incluído:</h3>
              <ul className="space-y-2">
                {packageData.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg
                      className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Processando...
                </span>
              ) : (
                `Pagar ${type === 'pix' ? 'com PIX' : 'com Cartão'}`
              )}
            </button>

            <button
              onClick={() => router.push('/app')}
              className="w-full mt-3 text-gray-600 hover:text-gray-900 py-2"
            >
              Cancelar
            </button>
          </div>
        ) : (
          // Tela de QR Code PIX
          <div className="bg-white rounded-lg shadow-xl p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
              Pague com PIX
            </h1>
            <p className="text-gray-600 mb-6 text-center">
              Escaneie o QR Code ou copie o código abaixo
            </p>

            <div className="bg-white p-4 rounded-lg border-2 border-gray-200 mb-4">
              <QRCodeSVG
                value={qrCode}
                size={256}
                level="M"
                className="mx-auto"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código PIX:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={qrCode}
                  readOnly
                  className="flex-1 p-3 border border-gray-300 rounded bg-gray-50 text-sm font-mono"
                />
                <button
                  onClick={copyPixCode}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Copiar
                </button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-sm text-blue-800">
                  Aguardando pagamento... Você será redirecionado automaticamente
                  quando o pagamento for confirmado.
                </p>
              </div>
            </div>

            <div className="text-center">
              <div className="animate-pulse text-gray-600 mb-4">
                <svg
                  className="animate-spin h-8 w-8 mx-auto"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>
              <p className="text-sm text-gray-600">
                Verificando pagamento...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando...</p>
          </div>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}

