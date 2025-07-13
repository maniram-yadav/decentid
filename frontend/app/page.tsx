import  IdentityForm  from "@/components/IdentityForm";
import { MetaMaskProvider } from '@/context/MetaMaskContext';

export default function Home() {
  return (
    <MetaMaskProvider>
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        
        <IdentityForm />
    </div>
    </MetaMaskProvider>
  );
}
