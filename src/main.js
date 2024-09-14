import { Client, Users } from 'node-appwrite';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_TEST_SECRET); // Use your test secret key here

export default async ({ req, res, log, error }) => {
  // Initialize Appwrite client
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(req.headers['x-appwrite-key'] ?? '');

  const users = new Users(client);

  try {
    const response = await users.list();
    log(`Total users: ${response.total}`);
  } catch(err) {
    error("Could not list users: " + err.message);
  }

  // Check if the route is for creating a payment intent
  if (req.path === "/create-payment-intent") {
    try {
      // Create a payment intent with Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: 5000, // e.g., $50.00 (in cents)
        currency: 'usd',
        payment_method_types: ['card'],
      });

      return res.json({
        clientSecret: paymentIntent.client_secret,
      });
    } catch (err) {
      error("Payment intent creation failed: " + err.message);
      return res.status(500).json({ error: err.message });
    }
  }

  // Return a default response for other paths
  return res.json({
    message: "This is a default response from the Appwrite function."
  });
};
