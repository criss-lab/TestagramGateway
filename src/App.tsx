import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import Dashboard from '@/pages/Dashboard';
import Instances from '@/pages/Instances';
import ImportFeed from '@/pages/ImportFeed';
import ExportQueue from '@/pages/ExportQueue';
import SyncStatus from '@/pages/SyncStatus';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchInterval: 30_000,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="flex h-screen bg-background overflow-hidden">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
            <TopBar />
            <main className="flex-1 overflow-y-auto p-6">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/instances" element={<Instances />} />
                <Route path="/import" element={<ImportFeed />} />
                <Route path="/export" element={<ExportQueue />} />
                <Route path="/sync" element={<SyncStatus />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </div>
        <Toaster theme="dark" position="bottom-right" />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
