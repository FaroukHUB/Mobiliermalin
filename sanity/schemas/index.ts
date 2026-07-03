import type { SchemaTypeDefinition } from 'sanity'
import { product } from './product'
import { category } from './category'
import { siteSettings } from './siteSettings'
import { heroSlide } from './heroSlide'
import { quote } from './quote'
import { qualityGuide } from './qualityGuide'
import { localPage } from './localPage'
import { order } from './order'

export const schemaTypes: SchemaTypeDefinition[] = [
  product as unknown as SchemaTypeDefinition,
  category as unknown as SchemaTypeDefinition,
  siteSettings as unknown as SchemaTypeDefinition,
  heroSlide as unknown as SchemaTypeDefinition,
  quote as unknown as SchemaTypeDefinition,
  qualityGuide as unknown as SchemaTypeDefinition,
  localPage as unknown as SchemaTypeDefinition,
  order as unknown as SchemaTypeDefinition,
]
