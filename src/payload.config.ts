import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { resendAdapter } from '@payloadcms/email-resend'
import sharp from 'sharp'

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

// ───────────────────────── Storage (Supabase) ─────────────────────────
// Supabase Storage est compatible S3. On le branche si les variables sont
// renseignees, sinon on tombe sur le stockage local (dev uniquement).
const supabaseStorageEnabled =
  Boolean(process.env.SUPABASE_STORAGE_ENDPOINT) &&
  Boolean(process.env.SUPABASE_STORAGE_ACCESS_KEY_ID) &&
  Boolean(process.env.SUPABASE_STORAGE_SECRET_ACCESS_KEY) &&
  Boolean(process.env.SUPABASE_STORAGE_BUCKET)

const storagePlugin = supabaseStorageEnabled
  ? s3Storage({
      collections: {
        media: { prefix: 'media' },
      },
      bucket: process.env.SUPABASE_STORAGE_BUCKET as string,
      config: {
        endpoint: process.env.SUPABASE_STORAGE_ENDPOINT as string,
        region: process.env.SUPABASE_STORAGE_REGION || 'eu-west-3',
        credentials: {
          accessKeyId: process.env.SUPABASE_STORAGE_ACCESS_KEY_ID as string,
          secretAccessKey: process.env.SUPABASE_STORAGE_SECRET_ACCESS_KEY as string,
        },
        forcePathStyle: true,
      },
    })
  : null

// ───────────────────────── Email (Resend) ─────────────────────────
// Si RESEND_API_KEY n'est pas defini, Payload tombe sur l'adapter par defaut
// (logs en console) — utile en dev, a ne pas utiliser en prod.
const emailAdapter = process.env.RESEND_API_KEY
  ? resendAdapter({
      defaultFromAddress:
        process.env.EMAIL_FROM_ADDRESS || 'noreply@mobiliermalin.com',
      defaultFromName: process.env.EMAIL_FROM_NAME || 'Mobilier Malin',
      apiKey: process.env.RESEND_API_KEY,
    })
  : undefined

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: ' — Mobilier Malin',
    },
    components: {
      graphics: {
        Logo: '@/components/admin/Logo',
        Icon: '@/components/admin/Icon',
      },
      beforeLogin: ['@/components/admin/BeforeLogin'],
      views: {
        dashboard: {
          Component: '@/components/admin/Dashboard',
        },
      },
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
  // Sharp doit etre passe explicitement pour activer le redimensionnement
  // d'images des collections upload (Media). Sans ca, les sizes definies
  // dans Media.upload.imageSizes ne sont pas generees.
  sharp,
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
      // Supabase impose SSL.
      ssl:
        process.env.DATABASE_URI?.includes('supabase.')
          ? { rejectUnauthorized: false }
          : undefined,
    },
    // Auto-push du schema : Payload synchronise les tables a chaque cold start.
    // L'overhead est negligeable et ca nous evite de devoir gerer les migrations
    // manuellement quand on ajoute un plugin (Storage, Email...) qui ajoute des
    // colonnes. Pour des projets a fort trafic on basculera sur de vraies
    // migrations Drizzle plus tard.
    push: true,
  }),
  upload: {
    limits: {
      fileSize: 10000000, // 10 Mo
    },
  },
  // Force le francais en langue par defaut + ajout de traductions custom
  // pour les libelles que Payload n'a pas encore traduits.
  i18n: {
    fallbackLanguage: 'fr',
    translations: {
      fr: {
        general: {
          dashboard: 'Tableau de bord',
          createNew: 'Créer',
          createNewLabel: 'Créer {{label}}',
          save: 'Enregistrer',
          saving: 'Enregistrement…',
          delete: 'Supprimer',
          edit: 'Modifier',
          cancel: 'Annuler',
          confirm: 'Confirmer',
          close: 'Fermer',
        },
      },
    },
  },
  email: emailAdapter,
  plugins: [storagePlugin].filter((p): p is NonNullable<typeof p> => p !== null),
})
