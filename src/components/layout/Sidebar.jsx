"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Home,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  CreditCard,
} from "lucide-react";
import { clearAuth } from "@/lib/auth";
import { useRouter, usePathname } from "next/navigation";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    clearAuth();
    router.replace("/login");
  };

  const closeSidebar = () => setOpen(false);

  const menuItems = [
    { name: "Dashboard", icon: <Home size={18} />, href: "/dashboard" },
    {
      name: "Data Transaksi",
      icon: <CreditCard size={18} />,
      children: [
        { name: "Tambah Data Transaksi", href: "/transaction/add" },
        { name: "List Data Transaksi", href: "/transaction/list" },
        { name: "Rekap Transaksi", href: "/transaction/recap" },
      ],
    },
  ];

  const [openMenu, setOpenMenu] = useState(null);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="md:hidden fixed top-3 left-3 z-50 p-2 border rounded-lg bg-white shadow-sm"
      >
        <Menu />
      </button>

      <aside
        className={`fixed md:static z-40 top-0 left-0 h-screen bg-white border-r shadow-sm transform 
          ${open ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0 transition-transform duration-200 w-64`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 border-b px-4">
            <span className="font-bold text-lg">Admin Panel</span>
            <button
              onClick={closeSidebar}
              className="md:hidden p-2 rounded hover:bg-gray-100"
            >
              <X />
            </button>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => (
              <div key={item.name}>
                {item.children ? (
                  <>
                    <button
                      onClick={() =>
                        setOpenMenu(openMenu === item.name ? null : item.name)
                      }
                      className="flex items-center justify-between w-full p-2 rounded-md hover:bg-gray-100"
                    >
                      <div className="flex items-center gap-2">
                        {item.icon}
                        <span className="font-medium">{item.name}</span>
                      </div>
                      {openMenu === item.name ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </button>

                    {openMenu === item.name && (
                      <div className="ml-8 mt-1 space-y-1">
                        {item.children.map((sub) => (
                          <Link
                            key={sub.name}
                            href={sub.href}
                            className={`block p-2 rounded-md text-sm hover:bg-gray-100 ${
                              pathname === sub.href
                                ? "bg-gray-200 font-semibold"
                                : ""
                            }`}
                            onClick={() => setOpen(false)}
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 ${
                      pathname === item.href ? "bg-gray-200 font-semibold" : ""
                    }`}
                  >
                    {item.icon}
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 p-3 border-t hover:bg-red-100 hover:text-red-500 hover:cursor-pointer transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={closeSidebar}
        ></div>
      )}
    </>
  );
}
