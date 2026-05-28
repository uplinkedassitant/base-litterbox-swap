import { Header } from "@/components/Header";
import { SwapInterface } from "@/components/SwapInterface";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950">
      <Header />
      <SwapInterface />
    </main>
  );
}