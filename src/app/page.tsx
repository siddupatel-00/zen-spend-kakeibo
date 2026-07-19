import { getKakeiboData } from './actions';
import KakeiboDashboard from './KakeiboDashboard';
import DbFallback from './DbFallback';

interface PageProps {
  searchParams: Promise<{ month?: string }>;
}

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams;
  
  const now = new Date();
  const currentMonth = params.month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  try {
    const data = await getKakeiboData(currentMonth);
    return (
      <main>
        <KakeiboDashboard initialData={data} currentMonth={currentMonth} />
      </main>
    );
  } catch (err: any) {
    return <DbFallback error={err} />;
  }
}
