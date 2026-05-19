import type { SchemaTypeDefinition } from 'sanity'
import { product } from './product'
import { category } from './category'
import { siteSettings } from './siteSettings'
import { heroSlide } from './heroSlide'
import { quote } from './quote'

export const schemaTypes: SchemaTypeDefinition[] = [
  product as unknown as SchemaTypeDefinition,
  category as unknown as SchemaTypeDefinition,
  siteSettings as unknown as SchemaTypeDefinition,
  heroSlide as unknown as SchemaTypeDefinition,
  quote as unknown as SchemaTypeDefinition,
]
