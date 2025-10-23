# Architecture Technique - Brand Ambassador SaaS

## Diagrammes d'Architecture

### 1. Architecture Générale
```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Landing Page  │  │   Dashboard     │  │   Mobile Config │ │
│  │   /             │  │   /brandX       │  │   /brandX/      │ │
│  │   /register     │  │   /brandX/plans │  │   app-config.json│ │
│  │   /login        │  │   /brandX/offers│  │                 │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ HTTPS/REST API
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        BACKEND (NestJS)                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Auth Module   │  │  Brands Module  │  │  Plans Module   │ │
│  │   - JWT         │  │  - CRUD         │  │  - Subscriptions│ │
│  │   - Passport    │  │  - Subdomain    │  │  - Stripe       │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  Offers Module  │  │ Stripe Module   │  │ Upload Module    │ │
│  │  - CRUD         │  │ - Webhooks      │  │ - File Storage  │ │
│  │  - Validation   │  │ - Checkout      │  │ - Images        │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ TypeORM
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE (PostgreSQL)                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │     brands      │  │     users       │  │    plans        │ │
│  │ - id (UUID)     │  │ - id (UUID)     │  │ - id (UUID)     │ │
│  │ - subdomain     │  │ - brand_id (FK) │  │ - name          │ │
│  │ - company_name  │  │ - email         │  │ - type          │ │
│  │ - app_config    │  │ - password      │  │ - price         │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│  ┌─────────────────┐  ┌─────────────────┐                      │
│  │ subscriptions   │  │     offers      │                      │
│  │ - id (UUID)     │  │ - id (UUID)     │                      │
│  │ - brand_id (FK) │  │ - brand_id (FK) │                      │
│  │ - plan_id (FK)  │  │ - title         │                      │
│  │ - stripe_sub_id │  │ - description   │                      │
│  │ - status        │  │ - external_link │                      │
│  └─────────────────┘  └─────────────────┘                      │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ Webhooks
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        EXTERNAL SERVICES                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │     Stripe      │  │   Docker Hub    │  │   Future:       │ │
│  │ - Payments      │  │ - Images        │  │ - Redis Cache   │ │
│  │ - Subscriptions │  │ - Registry      │  │ - Monitoring    │ │
│  │ - Webhooks      │  │ - CI/CD         │  │ - Analytics     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Flux Multi-Tenant
```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUX D'INSCRIPTION MULTI-TENANT              │
└─────────────────────────────────────────────────────────────────┘

User Registration Request
           │
           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ÉTAPE 1: INFORMATIONS ENTREPRISE           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ Company Name    │  │ Email           │  │ Password        │ │
│  │ First Name      │  │ Last Name       │  │ Confirmation    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ÉTAPE 2: CONFIGURATION APP                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ App Name        │  │ Logo Upload     │  │ Colors          │ │
│  │ Typography      │  │ Primary Color   │  │ Secondary Color │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ÉTAPE 3: SÉLECTION PLAN                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ Starter         │  │ Pro             │  │ Enterprise      │ │
│  │ €29/mois        │  │ €99/mois        │  │ €299/mois       │ │
│  │ Features limitées│  │ Features complètes│ │ Features avancées│ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    STRIPE CHECKOUT                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ Customer Create │  │ Session Create  │  │ Payment Process │ │
│  │ Brand ID        │  │ Plan ID         │  │ Webhook Handle  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CRÉATION AUTOMATIQUE                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ Brand Entity    │  │ User Entity     │  │ Subscription    │ │
│  │ Subdomain Gen   │  │ JWT Token       │  │ Status Active   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    REDIRECTION DASHBOARD                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ /brandX         │  │ App Config      │  │ Plan Features   │ │
│  │ Dashboard       │  │ JSON Generated  │  │ Activated       │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 3. Sécurité Multi-Tenant
```
┌─────────────────────────────────────────────────────────────────┐
│                    SÉCURITÉ MULTI-TENANT                       │
└─────────────────────────────────────────────────────────────────┘

Request with JWT Token
           │
           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    JWT STRATEGY                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ Token Decode    │  │ User Extract    │  │ Brand ID Check  │ │
│  │ Signature Verify│  │ Permissions     │  │ Tenant Isolation│ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    TENANT GUARD                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ Brand ID Match  │  │ Permission Check│  │ Data Filtering  │ │
│  │ Request Params  │  │ User Role       │  │ Row Level Sec   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SERVICE LAYER                                │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ Brand Context   │  │ Data Isolation  │  │ Audit Logging   │ │
│  │ Auto Filter     │  │ Tenant Scope    │  │ Security Events │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ Row Level Sec   │  │ Index on Brand  │  │ Query Filtering │ │
│  │ Brand ID Index  │  │ Foreign Keys    │  │ Performance     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 4. Configuration Mobile Dynamique
```
┌─────────────────────────────────────────────────────────────────┐
│                    GÉNÉRATION CONFIG MOBILE                    │
└─────────────────────────────────────────────────────────────────┘

Request: GET /brands/{brandId}/app-config.json
           │
           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BRANDS SERVICE                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ Brand Lookup    │  │ Subscription    │  │ Plan Features   │ │
│  │ Company Info    │  │ Status Check    │  │ Module Access   │ │
│  │ App Config      │  │ Active Plan     │  │ Permissions     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CONFIG GENERATION                            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ Brand Data      │  │ Plan Features   │  │ App Settings    │ │
│  │ Company Name    │  │ Module List     │  │ Colors          │ │
│  │ App Name        │  │ Permissions     │  │ Typography      │ │
│  │ Logo URL        │  │ Access Control  │  │ Theme Config    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    JSON RESPONSE                                │
│  {                                                              │
│    "brand": {                                                   │
│      "id": "uuid",                                              │
│      "companyName": "Acme Corp",                                │
│      "appName": "Acme App",                                     │
│      "logoUrl": "https://...",                                  │
│      "primaryColor": "#FF5733",                                 │
│      "secondaryColor": "#33FF57",                               │
│      "typography": "Roboto"                                     │
│    },                                                           │
│    "plan": {                                                    │
│      "type": "pro",                                             │
│      "name": "Pro",                                             │
│      "features": {                                              │
│        "ambassador": ["Offer consultation", "Chat"],            │
│        "brand": ["Offer creation", "User management"]           │
│      }                                                          │
│    },                                                           │
│    "modules": {                                                 │
│      "ambassador": ["Offer consultation", "Chat"],              │
│      "brand": ["Offer creation", "User management"]            │
│    }                                                            │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
```

## Implémentation Technique

### Backend - Structure des Modules
```
src/
├── app.module.ts                 # Module principal
├── main.ts                       # Point d'entrée
├── auth/                         # Authentification
│   ├── auth.module.ts
│   ├── auth.service.ts
│   ├── auth.controller.ts
│   ├── jwt.strategy.ts
│   ├── local.strategy.ts
│   ├── entities/
│   │   └── user.entity.ts
│   └── dto/
│       ├── login.dto.ts
│       └── register.dto.ts
├── brands/                       # Gestion des marques
│   ├── brands.module.ts
│   ├── brands.service.ts
│   ├── brands.controller.ts
│   ├── entities/
│   │   └── brand.entity.ts
│   └── dto/
│       ├── update-brand-config.dto.ts
│       └── update-brand-app-config.dto.ts
├── plans/                        # Gestion des plans
│   ├── plans.module.ts
│   ├── plans.service.ts
│   ├── plans.controller.ts
│   └── entities/
│       ├── plan.entity.ts
│       └── subscription.entity.ts
├── offers/                       # Gestion des offres
│   ├── offers.module.ts
│   ├── offers.service.ts
│   ├── offers.controller.ts
│   ├── entities/
│   │   └── offer.entity.ts
│   └── dto/
│       ├── create-offer.dto.ts
│       └── update-offer.dto.ts
├── stripe/                       # Intégration Stripe
│   ├── stripe.module.ts
│   ├── stripe.service.ts
│   ├── stripe.controller.ts
│   └── dto/
│       └── create-checkout-session.dto.ts
└── upload/                       # Upload de fichiers
    ├── upload.module.ts
    ├── upload.service.ts
    └── upload.controller.ts
```

### Frontend - Structure des Pages
```
src/app/
├── layout.tsx                    # Layout principal
├── page.tsx                      # Landing page
├── globals.css                   # Styles globaux
├── login/                        # Connexion
│   └── page.tsx
├── register/                     # Inscription
│   └── page.tsx
├── plans/                        # Sélection des plans
│   └── page.tsx
├── success/                      # Succès paiement
│   └── page.tsx
├── [brandId]/                    # Dashboard dynamique
│   ├── page.tsx
│   └── app-config.json/
│       └── page.tsx
├── contexts/                     # Contextes React
│   └── AuthContext.tsx
├── components/                   # Composants réutilisables
│   └── ProtectedRoute.tsx
├── lib/                          # Utilitaires
│   ├── api.ts
│   └── utils.ts
└── types/                        # Types TypeScript
    └── index.ts
```

## Déploiement & Production

### Docker Compose Production
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ${DATABASE_NAME}
      POSTGRES_USER: ${DATABASE_USERNAME}
      POSTGRES_PASSWORD: ${DATABASE_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DATABASE_USERNAME}"]
      interval: 30s
      timeout: 10s
      retries: 3

  backend:
    build: 
      context: ./backend
      dockerfile: Dockerfile
    environment:
      DATABASE_HOST: postgres
      DATABASE_PORT: 5432
      DATABASE_USERNAME: ${DATABASE_USERNAME}
      DATABASE_PASSWORD: ${DATABASE_PASSWORD}
      DATABASE_NAME: ${DATABASE_NAME}
      JWT_SECRET: ${JWT_SECRET}
      STRIPE_SECRET_KEY: ${STRIPE_SECRET_KEY}
      STRIPE_WEBHOOK_SECRET: ${STRIPE_WEBHOOK_SECRET}
      FRONTEND_URL: ${FRONTEND_URL}
      APP_URL: ${APP_URL}
    ports:
      - "3001:3001"
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    environment:
      NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL}
    ports:
      - "3000:3000"
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  postgres_data:
```

### Variables d'Environnement Production
```bash
# Database
DATABASE_NAME=brand_ambassador_saas_prod
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_secure_password

# Security
JWT_SECRET=your_super_secure_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# Stripe
STRIPE_SECRET_KEY=sk_live_your_live_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# URLs
FRONTEND_URL=https://your-domain.com
APP_URL=https://api.your-domain.com
NEXT_PUBLIC_API_URL=https://api.your-domain.com
```

## Métriques & Monitoring

### Health Checks
```typescript
// backend/src/health/health.controller.ts
@Controller('health')
export class HealthController {
  @Get()
  async check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version
    };
  }
}
```

### Logging Structure
```typescript
// backend/src/common/logger.service.ts
@Injectable()
export class LoggerService {
  private logger = new Logger();

  logRequest(req: Request, res: Response, next: NextFunction) {
    const { method, url, ip } = req;
    const userAgent = req.get('User-Agent') || '';
    const brandId = req.user?.brandId || 'anonymous';
    
    this.logger.log(`${method} ${url} - ${ip} - ${brandId} - ${userAgent}`);
    next();
  }
}
```

## Checklist de Validation

### ✅ Architecture Multi-Tenant
- [x] Isolation des données par `brandId`
- [x] Génération automatique de subdomain
- [x] JWT avec contexte tenant
- [x] Middleware de sécurité par tenant

### ✅ Fonctionnalités SaaS
- [x] Inscription en 3 étapes
- [x] Intégration Stripe complète
- [x] Gestion des abonnements
- [x] Dashboard modulaire selon le plan

### ✅ Configuration Mobile
- [x] Génération automatique `app-config.json`
- [x] Configuration dynamique selon le plan
- [x] Accessible via `/brandX/app-config.json`

### ✅ Sécurité
- [x] Authentification JWT
- [x] Autorisation par tenant
- [x] Validation des données
- [x] Protection CSRF

### ✅ Déploiement
- [x] Docker & Docker Compose
- [x] Variables d'environnement
- [x] Health checks
- [x] Logging structuré

## Conclusion

L'architecture implémentée répond parfaitement aux objectifs du test technique :

1. **Architecture SaaS modulaire** avec NestJS et Next.js
2. **Multi-tenant** avec isolation complète des données
3. **Sous-domaines** générés automatiquement
4. **Configuration mobile** en JSON dynamique
5. **Dashboard configuré** selon le plan choisi
6. **Sécurité** robuste avec JWT et isolation tenant
7. **Déploiement** prêt pour la production

La solution est scalable, sécurisée et prête pour la production avec une architecture claire et maintenable.
