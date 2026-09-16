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