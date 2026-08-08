import { BottomNav } from "@/components/layout/bottom-nav";
import { NavBar } from "@/components/layout/nav-bar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col">
      <NavBar />
      <main className="flex flex-1 flex-col px-4 pt-6 pb-24 md:px-8 md:pb-10">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
