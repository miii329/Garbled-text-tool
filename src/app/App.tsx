import { TextGarbler } from './components/TextGarbler';
import { Toaster } from './components/ui/sonner';

export default function App() {
  return (
    <div className="size-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <TextGarbler />
      <Toaster />
    </div>
  );
}
