import { getPages } from '@/app/actions/admin/cms'
import PagesClient from './PagesClient'

export const dynamic = 'force-dynamic'

export default async function PagesPage() {
  const pages = await getPages()
  return <PagesClient initialPages={pages} />
}
