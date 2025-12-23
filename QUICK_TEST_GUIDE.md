# Guia Rápido de Testes - PetFest

## 🚀 Início Rápido

### 1. Preparação (5 min)
```bash
# Adicionar no .env.local
echo "ADMIN_EMAIL=wesleykrzyzanovski@gmail.com" >> .env.local

# Reiniciar servidor
npm run dev
```

### 2. Teste Visual Rápido (2 min)
1. Abrir `http://localhost:3000/petfest/app`
2. ✅ Header aparece com logo e botão "Planos"
3. ✅ Fazer login
4. ✅ Créditos aparecem no header (ex: "3 créditos")

### 3. Teste Página de Planos (2 min)
1. Clicar em "Planos" no header
2. ✅ Ver 3 cards: Free, Essential (Popular), Pro
3. ✅ Clicar no toggle "Mensal" / "Avulso (PIX)"
4. ✅ Preços mudam: Essential (R$ 29,90 → R$ 34,90)
5. ✅ Botões mudam: "Assinar Agora" → "Pagar com PIX"

### 4. Teste Fluxo Free (1 min)
1. Logout (se estiver logado)
2. Ir para `/plans`
3. Clicar "Começar Grátis" no Free
4. ✅ Redireciona para login
5. ✅ Após login, está no `/app`
6. ✅ Header mostra "3 créditos"

### 5. Teste Fluxo PIX (5 min)
1. Ir para `/plans`
2. Toggle em "Avulso (PIX)"
3. Clicar "Pagar com PIX" no Essential
4. ✅ Abre popup com formulário
5. Preencher dados e clicar "Criar QR Code PIX"
6. ✅ QR Code aparece
7. ✅ Código PIX pode ser copiado

### 6. Teste Fluxo Assinatura (3 min)
1. Ir para `/plans`
2. Toggle em "Mensal"
3. Clicar "Assinar Agora" no Essential
4. ✅ Abre popup
5. Clicar "Ir para Pagamento"
6. ⚠️ **Esperado**: Erro se Stripe não configurado
7. ✅ **Se configurado**: Redireciona para Stripe

### 7. Teste Área Admin (2 min)
1. Acessar `/admin/prompts`
2. ✅ Página carrega com lista de temas
3. ✅ Pode editar texto dos prompts
4. ✅ Botão "Salvar Todos" funciona

---

## ⚠️ Erros Esperados (Antes de Configurar)

### Stripe não configurado
```
Erro: Plano não configurado corretamente. 
Verifique as variáveis de ambiente.
```
**Solução**: Seguir `STRIPE_SETUP.md`

### Admin não configurado
```
Erro: Acesso negado. Apenas administradores...
```
**Solução**: Adicionar `ADMIN_EMAIL` no `.env.local`

---

## ✅ Checklist Final

- [ ] Header global aparece em todas as páginas
- [ ] Créditos aparecem quando logado
- [ ] Página `/plans` carrega com 3 planos
- [ ] Toggle Mensal/Avulso funciona
- [ ] Botão Free funciona e dá 3 créditos
- [ ] Formulário PIX abre e gera QR Code
- [ ] Área admin acessível com email correto
- [ ] Todos os links funcionam (sem 404)

---

## 🎉 Sucesso!

Se todos os itens acima funcionam, o sistema está pronto para:
1. Configurar Stripe (seguir `STRIPE_SETUP.md`)
2. Fazer deploy no Vercel
3. Testar pagamentos reais

---

## 📝 Próximos Passos

### Antes do Deploy
1. ✅ Verificar todos os testes acima
2. ⏳ Configurar Stripe Products
3. ⏳ Adicionar variáveis no Vercel
4. ⏳ Configurar webhooks Stripe e AbacatePay para produção

### Após Deploy
1. ⏳ Testar todos os fluxos em produção
2. ⏳ Fazer pagamento PIX teste (pode ser R$ 1,00)
3. ⏳ Fazer assinatura teste no Stripe
4. ⏳ Verificar webhooks recebem notificações

---

**Tempo Total de Testes**: ~20 minutos
**Status**: ✅ Todos os 8 Sprints Completos!

