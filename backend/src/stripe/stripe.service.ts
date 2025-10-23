import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { Brand } from '../brands/entities/brand.entity';
import { Plan } from '../plans/entities/plan.entity';
import { Subscription } from '../plans/entities/subscription.entity';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    @InjectRepository(Brand)
    private brandRepository: Repository<Brand>,
    @InjectRepository(Plan)
    private planRepository: Repository<Plan>,
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
  ) {
    const stripeKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    
    this.stripe = new Stripe(stripeKey, {
      apiVersion: '2023-08-16',
    });
  }

  async createCheckoutSession(createCheckoutSessionDto: CreateCheckoutSessionDto) {
    const { brandId, planId } = createCheckoutSessionDto;

    const brand = await this.brandRepository.findOne({ where: { id: brandId } });
    const plan = await this.planRepository.findOne({ where: { id: planId } });

    if (!brand || !plan) {
      throw new BadRequestException('Brand or plan not found');
    }

    let customer;
    try {
      const existingCustomers = await this.stripe.customers.list({
        email: brand.email,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        customer = existingCustomers.data[0];
      } else {
        customer = await this.stripe.customers.create({
          email: brand.email,
          name: brand.companyName,
        });
      }
    } catch (error) {
      console.error('Stripe customer creation error:', error);
      throw new BadRequestException(`Failed to create customer: ${error.message}`);
    }

    const session = await this.stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product: plan.stripeProductId,
            unit_amount: Math.round(plan.price * 100),
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/plans`,
      metadata: {
        brandId,
        planId,
      },
    });

    return { sessionId: session.id, url: session.url };
  }

  async handleWebhook(payload: string, signature: string) {
    const event = this.stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'invoice.payment_succeeded':
        await this.handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
    }

    return { received: true };
  }

  private async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    const { brandId, planId } = session.metadata;
    
    if (!brandId || !planId) {
      throw new BadRequestException('Missing metadata in checkout session');
    }

    const subscription = await this.stripe.subscriptions.retrieve(session.subscription as string);

    // Create subscription record
    const subscriptionEntity = this.subscriptionRepository.create({
      brandId,
      planId,
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: subscription.customer as string,
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    });

    await this.subscriptionRepository.save(subscriptionEntity);
  }

  private async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
    // Handle successful payment
    console.log('Payment succeeded for invoice:', invoice.id);
  }

  async verifySessionAndCreateSubscription(sessionId: string) {
    try {
      const session = await this.stripe.checkout.sessions.retrieve(sessionId);
      
      if (session.payment_status === 'paid' && session.metadata) {
        const { brandId, planId } = session.metadata;
        
        if (brandId && planId) {
          // Check if subscription already exists
          const existingSubscription = await this.subscriptionRepository.findOne({
            where: { 
              brandId,
              planId,
              status: 'active'
            }
          });

          if (!existingSubscription && session.subscription) {
            const subscription = await this.stripe.subscriptions.retrieve(session.subscription as string);
            
            // Create subscription record
            const subscriptionEntity = this.subscriptionRepository.create({
              brandId,
              planId,
              stripeSubscriptionId: subscription.id,
              stripeCustomerId: subscription.customer as string,
              status: subscription.status,
              currentPeriodStart: new Date(subscription.current_period_start * 1000),
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            });

            await this.subscriptionRepository.save(subscriptionEntity);
            return { success: true, subscription: subscriptionEntity };
          }
        }
      }
      
      return { success: false, message: 'Session not found or already processed' };
    } catch (error) {
      console.error('Error verifying session:', error);
      throw new BadRequestException('Failed to verify session');
    }
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const subscriptionEntity = await this.subscriptionRepository.findOne({
      where: { stripeSubscriptionId: subscription.id },
    });

    if (subscriptionEntity) {
      subscriptionEntity.status = 'canceled';
      await this.subscriptionRepository.save(subscriptionEntity);
    }
  }

  async getInvoices(customerId: string) {
    const invoices = await this.stripe.invoices.list({
      customer: customerId,
      limit: 10,
    });

    return invoices.data;
  }

  private getStripePriceId(planType: string): string {
    const priceMap = {
      'starter': 'prod_THwojBTNiTW4va',
      'pro': 'prod_THwqe3k4FRrbgS',
      'enterprise': 'prod_THwqSUhED0heqx',
    };

    return priceMap[planType] || priceMap['starter'];
  }
}
