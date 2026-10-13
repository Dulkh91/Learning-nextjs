## POS Coffee

### 1 បង្កើត project

```bash
npx create-next-app@latest my-pos --typescript --tailwind --app
cd my-pos
npx shadcn@latest init
npm install prisma @prisma/client zustand
npx prisma init
```

### 2. Design Database
យើងបង្កើត folder ឈ្មោះ prisma/schema.prisma ដើម្បីបង្កើត database ដោយយើង copy code នេះទៅដាក់នៅក្នុង shema.prisma
```bash
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

generator client {
  provider = "prisma-client-js"
}

model Product {
  id       String  @id @default(cuid())
  name     String
  price    Float
  category String
  image    String?
  stock    Int     @default(100)
}
```
រួចរត់ Command បង្កើត Database
```bash
npx prisma db push
npx prisma generate
```
ពេលរត់រួច នឹងឃើញ file ថ្មី prisma/dev.db កើតឡើង នោះគឺ Database របស់អ្នក។

### 3 បញ្ចូលមុខកាហ្វេ 8 មុខ
ដោយបង្កើត file មួយឈ្មោះថា seed.js នៅក្នុង folder prisma 
```js
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  await prisma.product.createMany({
    data: [
      { name: 'Espresso', price: 1.5, category: 'Hot Coffee' },
      { name: 'Americano', price: 2.0, category: 'Hot Coffee' },
      { name: 'Latte', price: 2.5, category: 'Hot Coffee' },
      { name: 'Cappuccino', price: 2.5, category: 'Hot Coffee' },
      { name: 'Iced Latte', price: 3.0, category: 'Iced Coffee' },
      { name: 'Mocha', price: 3.5, category: 'Iced Coffee' },
      { name: 'Green Tea', price: 2.0, category: 'Tea' },
      { name: 'Croissant', price: 1.8, category: 'Pastry' },
    ]
  })
  console.log('Seeded 8 products!')
}

main()
```
យើង run វា
```bash
node prisma/seed.js
```
បើឃើញ Seeded 8 products! = ជោគជ័យ។


### 4: បង្កើត API (បេះដូង POS)
ឥឡូវ POS ត្រូវហៅយកមុខម្ហូបពី Database។ យើងបង្កើត API។

1. បង្កើត folder app/api/products
2. បង្កើត file app/api/products/route.ts ហើយ copy នេះដាក់:

```bash
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  const products = await prisma.product.findMany()
  return NextResponse.json(products)
}
```
3. សាកល្បង:

រត់:

```Bash
npm run dev
```
ហើយបើក browser:


```Code
http://localhost:3000/api/products
```
អ្នកនឹងឃើញកាហ្វេ 8 មុខដែលយើងបញ្ចូលជា JSON។ បើឃើញ = API ដំណើរការ។

### 5: បង្កើត POS អោយចុចលក់បាន (UI)
យើងនឹងប្តូរ app/page.tsx អោយក្លាយเป็น POS ស្អាតៗ។

បើក app/page.tsx លុបអស់ ហើយ copy នេះដាក់ជំនួសទាំងអស់:

### 6: រក្សាទុកការលក់

1. បើក prisma/schema.prisma បន្ថែម Model Sale នៅក្រោម Product:
```bash
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

generator client {
  provider = "prisma-client-js"
}

model Product {
  id       String  @id @default(cuid())
  name     String
  price    Float
  category String
  image    String?
  stock    Int     @default(100)
}

model Sale {
  id        String   @id @default(cuid())
  total     Float
  items     String   // នឹងរក្សាទុក JSON
  createdAt DateTime @default(now())
}
```
2. រត់:
```Bash
npx prisma db push
```
3. បង្កើត API សម្រាប់លក់: app/api/sales/route.ts
បង្កើត folder app/api/sales ហើយបង្កើត file route.ts:


4. ប្តូរ function checkout ក្នុង app/page.tsx:
រកកន្លែងនេះ:

```TSX
<button onClick={() => { alert(`លក់បាន $${total.toFixed(2)}`); setCart([]) }}
```
ប្តូរទៅ:

```TSX
const checkout = async () => {
  if (cart.length === 0) return
  await fetch('/api/sales', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cart, total })
  })
  alert(`លក់បាន $${total.toFixed(2)} - បានរក្សាទុក!`)
  setCart([])
}
```
5 lines hidden
ហើយប៊ូតុង:

```TSX
<button onClick={checkout}
```
5. សាក:
```Bash
npm run dev
```
ចុចលក់ 2-3 ដង ហើយចូល:

```Code
http://localhost:3000/api/sales
```
អ្នកនឹងឃើញប្រវត្តិលក់ដែលរក្សាទុក!

### 7: បោះពុម្ពវិក្កយបត្រ (Receipt)
យើងនឹងធ្វើអោយពេល Checkout រួច វាចេញ Bill ស្អាតៗ អោយចុច Print បាន។

1. បង្កើត Component app/components/Receipt.tsx:


2. ក្នុង app/page.tsx បន្ថែម:
លើគេ import:

```TSX
import Receipt from './components/Receipt'
```
ក្នុង POS() បន្ថែម state:

```TSX
const [showReceipt, setShowReceipt] = useState(false)
const [lastSale, setLastSale] = useState<{cart: CartItem[], total: number} | null>(null)
```
ប្តូរ checkout function ទៅ:

```TSX
const checkout = async () => {
  if (cart.length === 0) return
  await fetch('/api/sales', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cart, total })
  })
  setLastSale({ cart: [...cart], total })
  setShowReceipt(true)
  setCart([])
}
```
6 lines hidden
នៅចុង return មុន </div> បិទ បន្ថែម:

```TSX
{showReceipt && lastSale && (
  <Receipt
    cart={lastSale.cart}
    total={lastSale.total}
    onClose={() => setShowReceipt(false)}
  />
)}
```

2 lines hidden
3. សាក:
```Bash
npm run dev
```
ចុច Checkout -> នឹងចេញ Bill -> ចុច បោះពុម្ព



###  8: Dashboard មើលលុយ

នេះនឹងអោយអ្នកដឹងថា ថ្ងៃនេះលក់បានប៉ុន្មាន លក់បានប៉ុន្មានកែវ។

1. បង្កើត app/dashboard/page.tsx:

2. បន្ថែម Link ក្នុង app/page.tsx ដើម្បីចូល Dashboard:
ក្នុង app/page.tsx នៅកន្លែង <h1>☕ COFFEE POS</h1> ប្តូរទៅ:

```TSX
<div className="flex justify-between items-center mb-4">
  <h1 className="text-3xl font-bold">☕ COFFEE POS</h1>
  <Link href="/dashboard" className="bg-white border px-3 py-1 rounded-full text-sm">Dashboard</Link>
</div>
```
ហើយលើគេបន្ថែម:

```TSX
import Link from 'next/link'
```
3. រត់:
```Bash
npm run dev
```




# កាភ្ជាប់ជាមួយ DB ជាមួយ vercel

ចុះឈ្មោះប្រើប្រាស់ Cloud Database ឥតគិតថ្លៃ (Free Tier):

<p>
<li>1. <a href="https://console.neon.tech/">Neon.tech:</a>  Serverless PostgreSQL លឿន និងងាយស្រួលបំផុតជាមួយ Vercel។
</li>
<li>
2. <a href="https://supabase.com/">Supabase:</a>   PostgreSQL ឥតគិតថ្លៃ មាន Dashboard មើលទិន្នន័យស្រួល។
</li>
<li>
3.  <a href="https://www.prisma.io/postgres">Prisma Postgres:</a>  ប្រព័ន្ធ Postgres របស់ Prisma ផ្ទាល់។
</li>
</p>

```bash
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

## ការប្រើជាមួយ Neon.tech: Serverless PostgreSQL 

<a href="https://console.neon.tech/">neon.tech</a>


### 1.បង្កើត Database 
លើ Neon.tech:ឥតគិតថ្លៃ (Free Tier) និងមិនបាច់ប្រើក្រេឌីតកាត.
1. ចូលទៅកាន់គេហទំព័រ Neon.tech រួចចុះឈ្មោះ (Sign Up) ដោយប្រើ GitHub Account របស់អ្នក។
2. បន្ទាប់ពី Sign in ចូលហើយ ចុច Create Project។
3. ដាក់ឈ្មោះ Project (ឧ. pos-app-db) រួចចុច Create Project។
4. ពេលបង្កើតរួច វានឹងបង្ហាញផ្ទាំង Connection Details។
5. នៅត្រង់ផ្នែក Connection String ត្រូវប្រាកដថាបានជ្រើសរើស Prisma រួច Copy យក Connection String នោះទុក (វាមានរាងដូចជា 
```bash 
postgresql://neondb_owner:xxxxxx@ep-xyz.neon.tech/neondb?sslmode=require)។
```
### 2.រៀបចំ Environment Variables ក្នុង Next.js (Local):
កំណត់ DATABASE_URL ក្នុង .env
1. បើក Project Next.js របស់អ្នកនៅលើ VS Code។
2. បើក File .env (ឬបង្កើតមួយប្រសិនបើតំបន់ local មិនទាន់មាន)។
3. ជំនួស ឬបន្ថែម DATABASE_URL ដោយយក Connection String ពី Neon មកដាក់៖
env
```bash
DATABASE_URL="postgresql://neondb_owner:xxxxxx@ep-xyz.neon.tech/neondb?sslmode=require"
```
### 3.កែប្រែ schema.prisma:
ប្តូរ Provider ពី sqlite ទៅ postgresql.
1. បើក File prisma/schema.prisma។
2. ប្តូរត្រង់ provider ពី "sqlite" ទៅជា "postgresql" ដូចខាងក្រោម៖

```bash
prismadatasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}
```
### 4.Push Schema ទៅកាន់ Neon Cloud Database:
បង្កើត Tables ក្នុង Database ថ្មី
1. បើក Terminal ក្នុង VS Code រួចរត់ Command ខាងក្រោមដើម្បី Push Tables របស់អ្នកទៅ Neon៖
```Bash
npx prisma db push
```
បន្ទាប់មក រត់ Command នេះដើម្បី Generate Prisma Client ឡើងវិញ៖
```Bash
npx prisma generate
```
(អ្នកអាចចូលទៅមើលផ្ទាំង Dashboard លើ Neon.tech ត្រង់ផ្នែក Tables អ្នកនឹងឃើញ Tables របស់អ្នកបង្កើតឡើងនៅទីនោះ)
### 5.កំណត់ Environment Variable លើ Vercel:
ដើម្បីឱ្យ Vercel ស្គាល់ Cloud Database.
1. ចូលទៅកាន់ Vercel Dashboard របស់អ្នក។
2. ចុចលើ Project POS របស់អ្នក រួចចូលទៅ Settings -> Environment Variables។
3. ត្រង់ Key វាយពាក្យ៖ DATABASE_URL
4. ត្រង់ Value ផុស (Paste) Connection String របស់ Neon ចូល។
5. ចុច Save។
6. ជាចុងក្រោយ ចូលទៅ Deployments ចុច Redeploy លើ Build ចុងក្រោយគេ ដើម្បីឱ្យ Vercel ចាប់យក Config ថ្មីនេះ។


# prisma migrate dev ជាអ្វី?

ពេលអ្នកកែ schema.prisma ឧទាហរណ៍ដើមមាន៖
```bash
model Sale {
  id        String   @id @default(cuid())
  total     Float
  items     String
  createdAt DateTime @default(now())
}
```
ហើយអ្នកចង់បន្ថែម Invoice៖
```bash
model Invoice {
  id        String   @id @default(uuid())
  invoiceNo String   @unique
  saleId    String   @unique
  sale      Sale     @relation(fields: [saleId], references: [id])
  createdAt DateTime @default(now())
}
```
អ្នកបាន កែផែនទី Database។

ប៉ុន្តែ Database ពិតប្រាកដ (dev.db) មិនទាន់មានតារាង Invoice ទេ។

ដូច្នេះយើងប្រើ៖
```bash
npx prisma migrate dev
```

ដើម្បីប្រាប់ Prisma៖

"យកការផ្លាស់ប្តូរពី schema.prisma ទៅកែ Database ឱ្យដូច schema។"

2. ចុះ --name ជាអ្វី?

ឧទាហរណ៍៖
```bash
npx prisma migrate dev --name add_invoice_counter
```
add_invoice_counter គ្រាន់តែជា ឈ្មោះដែលយើងដាក់ឱ្យ migration នោះ។

វាមិនមែនជា command ផ្សេងទេ។

ឧទាហរណ៍៖
```bash
--name add_invoice_counter
```

មានន័យថា៖

Migration នេះខ្ញុំដាក់ឈ្មោះថា add_invoice_counter ព្រោះខ្ញុំកំពុងបន្ថែម Invoice Counter។

Prisma នឹងបង្កើត folder ប្រហែលជា៖
```bash
prisma/
└── migrations/
    └── 20260927080000_add_invoice_counter/
        └── migration.sql
```
3. ហេតុអ្វីខ្ញុំបាននិយាយពី command ពីរ?

ព្រោះខ្ញុំកំពុងពន្យល់ពី ការផ្លាស់ប្តូរ 2 ដំណាក់កាល ដែលយើងបានធ្វើក្នុង schema។

ដំណាក់កាលទី 1

យើងបន្ថែម៖
```bash
model InvoiceCounter {
  date    String @id
  current Int    @default(0)
}
```
ដូច្នេះអាច run៖
```bash
npx prisma migrate dev --name add_invoice_counter
```
មានន័យថា៖

បង្កើត migration ដើម្បីបន្ថែម InvoiceCounter table។

ដំណាក់កាលទី 2

បន្ទាប់មកយើងបន្ថែម relation៖
```bash
model Sale {
  ...
  invoice Invoice?
}
```
និង៖
```bash
model Invoice {
  ...
  sale Sale @relation(fields: [saleId], references: [id])
}
```
បើអ្នក បាន migrate ដំណាក់កាលទី 1 រួចហើយ ហើយទើបបន្ថែម relation នេះ អាច run៖
```bash
npx prisma migrate dev --name add_invoice_relation
```
វាមានន័យថា៖

បង្កើត migration ថ្មី ដើម្បីបន្ថែម/កែ relation រវាង Sale និង Invoice។

4. ប៉ុន្តែសម្រាប់អ្នកឥឡូវនេះ មានចំណុចសំខាន់

អ្នកមិនចាំបាច់ run command ទាំងពីរទេ។

បើអ្នកកំពុងរៀន ហើយយើងកំពុងរៀបចំ Schema ម្តងនេះ ឱ្យសរសេរ Schema ចុងក្រោយឱ្យបានត្រឹមត្រូវសិន។

ឧទាហរណ៍៖
```bash
model Sale {
  id        String   @id @default(cuid())
  total     Float
  items     String
  createdAt DateTime @default(now())

  invoice   Invoice?
}

model Invoice {
  id        String   @id @default(uuid())
  invoiceNo String   @unique
  saleId    String   @unique
  sale      Sale     @relation(fields: [saleId], references: [id])
  createdAt DateTime @default(now())
}

model InvoiceCounter {
  date    String @id
  current Int    @default(0)
}
```
បើនេះជា ការកែ Schema ទាំងអស់ដែលអ្នកចង់បាន ហើយមិនទាន់បាន migrate ទេ អ្នកអាច runតែម្តង៖
```bash
npx prisma migrate dev --name add_invoice_system
```
ខ្ញុំចូលចិត្តឱ្យអ្នកប្រើឈ្មោះនេះជាង ព្រោះយើងកំពុងបន្ថែមប្រព័ន្ធ Invoice ទាំងមូល៖

add_invoice_system
5. តើ migrate ខុសពី generate យ៉ាងដូចម្តេច?

នេះសំខាន់ណាស់៖

migrate
```bash
npx prisma migrate dev --name add_invoice_system
```
👉 កែ Database
```bash
schema.prisma
      ↓
   migrate
      ↓
dev.db
```
generate
npx prisma generate

👉 កែ/បង្កើត Prisma Client ដែល Code របស់អ្នកប្រើ។

schema.prisma
      ↓
   generate
      ↓
Prisma Client
      ↓
prisma.invoice
prisma.invoiceCounter
6. ដូច្នេះនៅ Project របស់អ្នក

បន្ទាប់ពីយើងកែ schema.prisma រួច ខ្ញុំណែនាំឱ្យធ្វើ៖
```bash
npx prisma migrate dev --name add_invoice_system
```

ជាទូទៅ migration នេះនឹង update database ហើយ regenerate Prisma Client ផងដែរ។

បើ TypeScript នៅតែមាន error:
```bash
npx prisma generate
```

បន្ទាប់មក restart:

npm run dev
សរុបខ្លី
```bash
schema.prisma
     │
     ├── migrate ──→ កែ Database
     │
     └── generate ─→ កែ Prisma Client
```

ហើយ --name add_invoice_system គ្រាន់តែជា ឈ្មោះសម្រាប់កត់ត្រាការផ្លាស់ប្តូរ ប៉ុណ្ណោះ។





## api analytics:
```js
// /app/api/analytics/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type Period = "today" | "week" | "month" | "custom";
type LabelFormat = "hour" | "dayNumber" | "shortDate";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") as Period | null;
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const now = new Date();
    let startDate: Date;
    let endDate: Date;
    let labelFormat: LabelFormat;

    // TODAY - Group by HOUR
    if (period === "today") {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
      labelFormat = "hour";
    }
    // THIS WEEK
    else if (period === "week") {
      const day = now.getDay();
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (7 - day), 0, 0, 0);
      labelFormat = "shortDate";
    }
    // THIS MONTH
    else if (period === "month") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      labelFormat = "dayNumber";
    }
    // CUSTOM
    else if (period === "custom" && from && to) {
      startDate = new Date(`${from}T00:00:00`);
      endDate = new Date(`${to}T00:00:00`);
      endDate.setDate(endDate.getDate() + 1);

      const diffDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      labelFormat = diffDays <= 1 ? "hour" : diffDays <= 31 ? "dayNumber" : "shortDate";
    }
    // DEFAULT
    else {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
      labelFormat = "hour";
    }

    // GET SALES
    const sales = await prisma.sale.findMany({
      where: {
        createdAt: { gte: startDate, lt: endDate },
      },
      orderBy: { createdAt: "asc" },
    });

    // CALCULATE
    const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
    const totalOrders = sales.length;
    const averageOrder = totalOrders > 0 ? totalSales / totalOrders : 0;

    // GROUP DATA
    const dataMap = new Map<string, number>();

    for (const sale of sales) {
      const date = sale.createdAt;
      let key: string;

      switch (labelFormat) {
        case "hour":
          key = `${String(date.getHours()).padStart(2, "0")}:00`;
          break;
        case "dayNumber":
          key = String(date.getDate());
          break;
        case "shortDate":
          key = `${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
          break;
        default:
          key = String(date.getDate());
      }

      dataMap.set(key, (dataMap.get(key) || 0) + sale.total);
    }

    // BUILD CHART DATA
    const chartData: { label: string; total: number }[] = [];

    if (labelFormat === "hour") {
      // ✅ បង្ហាញតែម៉ោងដែលមានលក់ (ឬម៉ោង 06:00 - ម៉ោងបច្ចុប្បន្ន)
      const currentHour = now.getHours();
      
      // Option 1: បង្ហាញតែម៉ោងដែលមានលក់
      const hoursWithSales = Array.from(dataMap.keys()).sort();
      
      if (hoursWithSales.length === 0) {
        // បើអត់មានលក់ទាល់តែសិន → បង្ហាញម៉ោងបច្ចុប្បន្ន
        chartData.push({ 
          label: `${String(currentHour).padStart(2, "0")}:00`, 
          total: 0 
        });
      } else {
        for (const hour of hoursWithSales) {
          chartData.push({ label: hour, total: dataMap.get(hour) || 0 });
        }
      }
    } else if (labelFormat === "dayNumber") {
      // បង្ហាញថ្ងៃទី 1-31 (ឬតែថ្ងៃដែលមានលក់)
      const daysInMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate();
      for (let i = 1; i <= daysInMonth; i++) {
        const day = String(i);
        chartData.push({ label: day, total: dataMap.get(day) || 0 });
      }
    } else {
      // shortDate
      const current = new Date(startDate);
      while (current < endDate) {
        const key = `${String(current.getMonth() + 1).padStart(2, "0")}-${String(current.getDate()).padStart(2, "0")}`;
        chartData.push({ label: key, total: dataMap.get(key) || 0 });
        current.setDate(current.getDate() + 1);
      }
    }

    return NextResponse.json({
      period,
      labelFormat,
      totalSales,
      totalOrders,
      averageOrder: Math.round(averageOrder * 100) / 100,
      chartData,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ message: "Failed to get analytics" }, { status: 500 });
  }
}
```


## Stock History

ជំហានទី 1៖ បង្កើត StockMovement model

ឥឡូវយើងមិនទាន់ធ្វើ UI ទេ។ យើងចាប់ផ្ដើមពី Database ជាមុនសិន។

បើក prisma/schema.prisma ហើយបន្ថែម Model ខាងក្រោមនៅខាងក្រោមគេ៖

```bash
model StockMovement {
  id        String   @id @default(cuid())
  productId String
  type      String
  quantity  Int
  note      String?
  createdAt DateTime @default(now())

  product   Product  @relation(fields: [productId], references: [id], onDelete: Restrict)

  @@index([productId, createdAt])
}
```
បន្ទាប់មក ក្នុង Product model បន្ថែម field មួយនេះ៖
```bash
stockMovements StockMovement[]
```

ឧទាហរណ៍ Product model របស់អ្នកនឹងមានផ្នែកទំនាក់ទំនងបែបនេះ៖
```bash
model Product {
  id             String          @id @default(cuid())
  name           String
  price          Float
  category       String
  stock          Int             @default(100)
  imageId        String?          @unique
  image          ProductImage?    @relation(fields: [imageId], references: [id])
  createdAt      DateTime         @default(now())

  stockMovements StockMovement[]
}
```

កុំលុប field ដែលមានស្រាប់ក្នុង Product របស់អ្នក គ្រាន់តែបន្ថែម stockMovements ប៉ុណ្ណោះ។

តើ Field នីមួយៗមានន័យអ្វី?

Field | អត្ថន័យ
------|-----
productId | ID របស់ផលិតផលដែលមានចលនា Stock
type | ប្រភេទចលនា ដូចជា IN ឬ OUT
quantity | ចំនួនដែលបានបន្ថែម ឬដកចេញ
note | កំណត់សម្គាល់ ស្រេចចិត្ត
createdAt| កាលបរិច្ឆេទ និងម៉ោង
@@index | ជួយស្វែងរកប្រវត្តិតាមផលិតផល និងកាលបរិច្ឆេទ



យើងរក្សា quantity ជាចំនួនវិជ្ជមាន ហើយប្រើ type ដើម្បីបែងចែក៖

IN — បន្ថែម Stock ចំនួន 50

OUT — លក់ចេញចំនួន 2

វិធីនេះងាយស្រួលអាន និងស្វែងរកប្រវត្តិជាងរក្សាចំនួនអវិជ្ជមាន។

### ជំហានទី 2៖ បង្កើត Migration

Save schema.prisma រួចបើក Terminal នៅក្នុង Project ហើយរត់៖
```bash
npx prisma migrate dev --name add_stock_movement
```

ពាក្យបញ្ជានេះបង្កើតតារាង StockMovement ក្នុង Database និងធ្វើបច្ចុប្បន្នភាព Prisma Client។

បើអ្នកប្រើ Prisma Client ដែលបានបង្កើតពី Schema ថ្មីរួចហើយ វានឹងអាចប្រើ៖

prisma.stockMovement.create(...)

ចំណាំ៖ បើអ្នកកំពុងធ្វើការជាមួយ Neon production database កុំប្រើ migrate dev លើ production។ សម្រាប់ production ប្រើ migration ដែលបានបង្កើតរួចជាមួយ npx prisma migrate deploy។