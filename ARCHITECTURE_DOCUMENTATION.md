# Architecture Brand Ambassador SaaS

## Vue d'ensemble

Cette plateforme SaaS permet aux marques de gérer leurs programmes d'ambassadeurs avec une architecture multi-tenant. Chaque marque a son propre espace isolé avec un sous-domaine dédié et une configuration mobile personnalisée.

## Choix techniques

### Frontend - Next.js 16 + React 19
J'ai choisi Next.js pour plusieurs raisons pratiques :
- Le routing dynamique `[brandId]` permet de gérer facilement les sous-domaines
- Le SSR améliore les performances et le SEO
- React 19 apporte des optimisations importantes pour les applications complexes

### Backend - NestJS
NestJS offre une structure modulaire claire qui facilite la maintenance :
- Les modules sont indépendants (Auth, Brands, Plans, etc.)
- TypeORM simplifie la gestion de la base de données
- Les decorators rendent le code plus lisible
- La validation automatique évite beaucoup d'erreurs

### Base de données - PostgreSQL
PostgreSQL était le choix évident pour plusieurs raisons :
- Les transactions ACID sont cruciales pour les paiements
- Le support JSON natif permet des configurations flexibles
- Les performances sont excellentes pour les requêtes multi-tenant
- La scalabilité est bien documentée

### Paiements - Stripe
Stripe reste la référence pour les paiements SaaS :
- La sécurité est gérée côté Stripe (PCI DSS)
- Les webhooks permettent une synchronisation temps réel
- La gestion des abonnements est automatique
- L'API est bien documentée et stable

## Architecture multi-tenant

### Approche choisie : Shared Database, Shared Schema

J'ai opté pour cette approche car elle offre le meilleur équilibre entre simplicité et performance. Chaque entité contient un `brandId` qui permet l'isolation des données.

```sql
-- Structure de base
CREATE TABLE brands (
  id UUID PRIMARY KEY,
  subdomain VARCHAR UNIQUE,
  company_name VARCHAR,
  email VARCHAR UNIQUE
);

CREATE TABLE offers (
  id UUID PRIMARY KEY,
  brand_id UUID REFERENCES brands(id),
  title VARCHAR,
  description TEXT
);
```

### Isolation des données

L'isolation se fait à plusieurs niveaux :

1. **Au niveau de l'API** : Chaque requête vérifie que l'utilisateur appartient à la bonne marque
2. **Au niveau du service** : Les requêtes incluent automatiquement le filtre `brandId`
3. **Au niveau de la base** : Les foreign keys garantissent l'intégrité

```typescript
// Exemple de service avec isolation automatique
async findOffers(brandId: string) {
  return this.offerRepository.find({
    where: { brandId },
    relations: ['brand']
  });
}
```

### Sécurité

Le système de sécurité repose sur plusieurs couches :

- **JWT Token** : Contient l'ID de la marque pour l'isolation
- **Middleware** : Vérifie les permissions avant chaque requête
- **Guards** : Protègent les endpoints sensibles

```typescript
@UseGuards(AuthGuard('jwt'))
@Controller('brands')
export class BrandsController {
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    // Vérification que l'utilisateur appartient à cette marque
    if (req.user.brandId !== id) {
      throw new ForbiddenException();
    }
    return this.brandsService.findOne(id);
  }
}
```

## Flux d'inscription

Le processus d'inscription est divisé en 3 étapes pour une meilleure UX :

1. **Informations entreprise** : Nom, email, mot de passe
2. **Configuration app** : Nom de l'app, logo, couleurs, typographie
3. **Sélection plan** : Choix du plan avec paiement Stripe

Après le paiement, le système :
- Crée automatiquement la marque avec un subdomain unique
- Génère la configuration mobile en JSON
- Redirige vers le dashboard personnalisé

## Configuration mobile

La configuration mobile est générée dynamiquement selon le plan choisi :

```typescript
async generateAppConfig(brandId: string) {
  const brand = await this.findOne(brandId);
  const subscription = await this.getActiveSubscription(brandId);
  
  return {
    brand: {
      id: brand.id,
      companyName: brand.companyName,
      appName: brand.appName,
      colors: {
        primary: brand.primaryColor,
        secondary: brand.secondaryColor
      }
    },
    plan: subscription.plan,
    modules: subscription.plan.features
  };
}
```

Cette configuration est accessible via `/brandX/app-config.json` et peut être utilisée par l'application mobile pour s'adapter automatiquement à la marque et au plan.

## Structure des modules

### Backend
```
src/
├── auth/           # Authentification et autorisation
├── brands/         # Gestion des marques
├── plans/          # Plans et abonnements
├── offers/         # Gestion des offres
├── stripe/         # Intégration paiements
└── upload/         # Upload de fichiers
```

### Frontend
```
src/app/
├── [brandId]/      # Dashboard dynamique par marque
├── register/       # Processus d'inscription
├── plans/          # Sélection des plans
├── success/        # Confirmation paiement
└── contexts/       # Gestion d'état global
```

## Déploiement

Le déploiement utilise Docker Compose pour simplifier la mise en production :

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: brand_ambassador_saas
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      DATABASE_HOST: postgres
      JWT_SECRET: your-secret-key
      STRIPE_SECRET_KEY: sk_test_...
    depends_on:
      - postgres

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:3001
```

## Monitoring et maintenance

Pour la production, j'ai prévu :

- **Health checks** : Endpoints `/health` pour vérifier l'état des services
- **Logging structuré** : Logs avec contexte tenant pour faciliter le debug
- **Variables d'environnement** : Configuration séparée par environnement

## Points d'amélioration future

- **Cache Redis** : Pour améliorer les performances des requêtes fréquentes
- **Monitoring** : Intégration Prometheus/Grafana pour le monitoring
- **CI/CD** : Pipeline automatisé avec tests et déploiement
- **Analytics** : Tracking des métriques d'usage par marque

## Conclusion

Cette architecture répond aux besoins du test technique avec une approche pragmatique. Le système multi-tenant est robuste, la sécurité est bien implémentée, et l'architecture permet une évolution future facile. Le code est maintenable et les choix techniques sont justifiés par l'expérience pratique.
