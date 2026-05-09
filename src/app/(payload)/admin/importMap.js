// Import map manuel avec les composants par defaut que Payload utilise dans
// l'admin (dashboard, navigation, etc.). Pour des composants custom (ex:
// dashboard widgets, champs sur-mesure), on regenerera ce fichier via
// `pnpm payload generate:importmap` une fois que les composants existeront.

import {
  CollectionCards,
  DocumentHeader,
  FolderField,
  FolderTableCell,
  Logo,
  DefaultNav,
} from '@payloadcms/next/rsc'

import {
  DefaultNavClient,
  FolderTypeField,
  NavHamburger,
  NavWrapper,
  QueryPresetsAccessCell,
  QueryPresetsColumnField,
  QueryPresetsColumnsCell,
  QueryPresetsGroupByCell,
  QueryPresetsGroupByField,
  QueryPresetsWhereCell,
  QueryPresetsWhereField,
  SlugField,
} from '@payloadcms/next/client'

import { S3ClientUploadHandler } from '@payloadcms/storage-s3/client'

// Composants custom Mobilier Malin
import MMLogo from '@/components/admin/Logo'
import MMIcon from '@/components/admin/Icon'
import MMBeforeLogin from '@/components/admin/BeforeLogin'
import MMDashboard from '@/components/admin/Dashboard'

export const importMap = {
  // RSC (Server Components)
  '@payloadcms/next/rsc#CollectionCards': CollectionCards,
  '@payloadcms/next/rsc#DocumentHeader': DocumentHeader,
  '@payloadcms/next/rsc#FolderField': FolderField,
  '@payloadcms/next/rsc#FolderTableCell': FolderTableCell,
  '@payloadcms/next/rsc#Logo': Logo,
  '@payloadcms/next/rsc#DefaultNav': DefaultNav,

  // Client components
  '@payloadcms/next/client#DefaultNavClient': DefaultNavClient,
  '@payloadcms/next/client#NavHamburger': NavHamburger,
  '@payloadcms/next/client#NavWrapper': NavWrapper,
  '@payloadcms/next/client#FolderTypeField': FolderTypeField,
  '@payloadcms/next/client#QueryPresetsAccessCell': QueryPresetsAccessCell,
  '@payloadcms/next/client#QueryPresetsColumnField': QueryPresetsColumnField,
  '@payloadcms/next/client#QueryPresetsColumnsCell': QueryPresetsColumnsCell,
  '@payloadcms/next/client#QueryPresetsGroupByCell': QueryPresetsGroupByCell,
  '@payloadcms/next/client#QueryPresetsGroupByField': QueryPresetsGroupByField,
  '@payloadcms/next/client#QueryPresetsWhereCell': QueryPresetsWhereCell,
  '@payloadcms/next/client#QueryPresetsWhereField': QueryPresetsWhereField,
  '@payloadcms/next/client#SlugField': SlugField,

  // Plugin S3 / Supabase Storage — handler d'upload cote client
  '@payloadcms/storage-s3/client#S3ClientUploadHandler': S3ClientUploadHandler,

  // Composants custom Mobilier Malin
  '@/components/admin/Logo#default': MMLogo,
  '@/components/admin/Icon#default': MMIcon,
  '@/components/admin/BeforeLogin#default': MMBeforeLogin,
  '@/components/admin/Dashboard#default': MMDashboard,
}
