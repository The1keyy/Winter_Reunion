import { NavBar } from "@/components/layout/nav-bar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col bg-charcoal">
      <NavBar />
      <main className="flex flex-1 flex-col px-4 py-6 md:px-8">
        {children}
      </main>
    </div>
  );
}
