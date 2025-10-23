import { DataSource } from 'typeorm';
import { Plan, PlanType } from './src/plans/entities/plan.entity';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_DATABASE || 'brand_ambassador_saas',
  entities: [Plan],
  synchronize: false,
});

async function updatePlanStripeIds() {
  try {
    await AppDataSource.initialize();
    console.log('Database connection established');

    const planRepository = AppDataSource.getRepository(Plan);

    // Update plans with Stripe product IDs
    const updates = [
      {
        type: PlanType.STARTER,
        stripeProductId: 'prod_THwojBTNiTW4va',
      },
      {
        type: PlanType.PRO,
        stripeProductId: 'prod_THwqe3k4FRrbgS',
      },
      {
        type: PlanType.ENTERPRISE,
        stripeProductId: 'prod_THwqSUhED0heqx',
      },
    ];

    for (const update of updates) {
      await planRepository.update(
        { type: update.type },
        { stripeProductId: update.stripeProductId }
      );
      console.log(`Updated ${update.type} plan with Stripe ID: ${update.stripeProductId}`);
    }

    console.log('All plans updated successfully');
  } catch (error) {
    console.error('Error updating plans:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

updatePlanStripeIds();
