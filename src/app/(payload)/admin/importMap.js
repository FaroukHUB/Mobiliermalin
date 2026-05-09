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
}
