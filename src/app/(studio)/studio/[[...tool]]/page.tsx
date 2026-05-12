/**
 * Studio Sanity intégré dans Next.js sur la route /studio.
 * Le client édite ses produits ici : https://mobiliermalin.com/studio
 */

'use client'

import { NextStudio } from 'next-sanity/studio'
import config from '../../../../../sanity.config'

export default function StudioPage() {
  return <NextStudio config={config} />
}
