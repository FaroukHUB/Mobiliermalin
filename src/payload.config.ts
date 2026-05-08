import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Categories } from './collections/Categories'
import { Brands } from './collections/Brands'
import { Products } from './collections/Products'
import { HeroSlides } from './collections/HeroSlides'
import { Pages } from './collections/Pages'
import { BlogPosts } from './collections/BlogPosts'
import { Orders } from './collections/Orders'
import { Customers } from './collections/Customers'
import { Redirects } from './collections/Redirects'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: ' — Mobilier Malin',
    },
    components: {
      // graphics: {
      //   Logo: '@/components/admin/Logo',
      //   Icon: '@/components/admin/Icon',
      // },
    },
  },
  collections: [
    Users,
    Media,
    Categories,
    Brands,
    Products,
    HeroSlides,
    Pages,
    BlogPosts,
    Orders,
    Customers,
    Redirects,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
      // Supabase impose SSL ; on l'active si l'URI pointe vers Supabase.
      ssl:
        process.env.DATABASE_URI?.includes('supabase.')
          ? { rejectUnauthorized: false }
          : undefined,
    },
    // Auto-push du schéma : les tables sont créées/mises à jour
    // automatiquement à chaque déploiement. Pratique pour démarrer
    // sans avoir à gérer les migrations à la main.
    push: true,
  }),
  upload: {
    limits: {
      fileSize: 10000000, // 10 Mo
    },
  },
})
