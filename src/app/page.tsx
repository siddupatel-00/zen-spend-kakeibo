import { getKakeiboData } from './actions';
import KakeiboDashboard from './KakeiboDashboard';

interface PageProps {
  searchParams: Promise<{ month?: string }>;
}

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams;
  
  const now = new Date();
  const currentMonth = params.month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const data = await getKakeiboData(currentMonth);

  return (
    <main>
      <KakeiboDashboard initialData={data} currentMonth={currentMonth} />
    </main>
  );
}
