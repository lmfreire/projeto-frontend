"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FiLogOut } from "react-icons/fi";


export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token_project");
    router.push("/");
  };

  if (pathname === "/") {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 h-screen bg-gray-800 text-white flex flex-col">
        <div className="p-4 text-lg font-bold border-b border-gray-700">
          Menu
        </div>

        <div className="flex-1 flex flex-col justify-between overflow-hidden">
          <nav className="p-4 space-y-2 overflow-y-auto">
            <Link
              href="/home"
              className="block px-4 py-2 rounded hover:bg-gray-700"
            >
              Página Inicial
            </Link>
            <Link
              href="/produtos"
              className="block px-4 py-2 rounded hover:bg-gray-700"
            >
              Produtos
            </Link>
            <Link
              href="/fabricantes"
              className="block px-4 py-2 rounded hover:bg-gray-700"
            >
              Fabricantes
            </Link>
          </nav>

          <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="cursor-pointer w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white font-semibold rounded-md shadow transition duration-200"
          >
            <FiLogOut className="text-lg" />
            Sair
          </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-8 bg-gray-100 overflow-y-auto">{children}</main>
    </div>
  );
}
