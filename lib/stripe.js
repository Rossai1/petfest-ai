import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY não está configurada nas variáveis de ambiente');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
});

// IDs dos preços no Stripe (devem ser criados no Stripe Dashboard)
// Esses são placeholders - você precisa criar os produtos/preços no Stripe
export const STRIPE_PRICE_IDS = {
  ESSENTIAL: process.env.STRIPE_PRICE_ID_ESSENTIAL || 'price_essential',
  PRO: process.env.STRIPE_PRICE_ID_PRO || 'price_pro',
};

/**
 * Cria ou obtém um cliente Stripe para o usuário
 * @param {string} email - Email do usuário
 * @param {string} clerkId - ID do Clerk
 * @returns {Promise<Stripe.Customer>}
 */
export async function getOrCreateStripeCustomer(email, clerkId) {
  // Buscar cliente existente por email
  const existingCustomers = await stripe.customers.list({
    email: email,
    limit: 1,
  });

  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0];
  }

  // Criar novo cliente
  const customer = await stripe.customers.create({
    email: email,
    metadata: {
      clerkId: clerkId,
    },
  });

  return customer;
}

/**
 * Cria uma sessão de checkout para assinatura
 * @param {string} priceId - ID do preço no Stripe
 * @param {string} customerId - ID do cliente Stripe
 * @param {string} userId - ID do usuário no banco
 * @returns {Promise<Stripe.Checkout.Session>}
 */
export async function createCheckoutSession(priceId, customerId, userId) {
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing?canceled=true`,
    metadata: {
      userId: userId,
    },
  });

  return session;
}


