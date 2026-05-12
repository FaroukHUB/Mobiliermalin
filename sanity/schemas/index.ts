import type { SchemaTypeDefinition } from 'sanity'
import { product } from './product'
import { category } from './category'
import { siteSettings } from './siteSettings'

export const schemaTypes: SchemaTypeDefinition[] = [
  product as unknown as SchemaTypeDefinition,
  category as unknown as SchemaTypeDefinition,
  siteSettings as unknown as SchemaTypeDefinition,
]
