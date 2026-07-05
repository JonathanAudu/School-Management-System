import Link from "next/link";
import PublicHeader from "@/components/PublicHeader";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PublicHeader />

      {/* Main Content */}
      <main className="flex-grow pt-20">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-16 border-t border-slate-800">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <span className="text-3xl">🏛️</span>
              <div>
                <span className="block font-serif font-bold text-xl leading-tight text-white">St. Augustine</span>
                <span className="block text-xs uppercase tracking-widest text-sky-400 font-semibold">Academy</span>
              </div>
            </Link>
            <p className="text-slate-400 max-w-sm">
              Empowering the next generation of leaders through excellence in education, rooted in compassion and innovation.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/about" className="hover:text-sky-400 transition-colors">About Us</Link></li>
              <li><Link href="/admissions" className="hover:text-sky-400 transition-colors">Admissions</Link></li>
              <li><Link href="/academics" className="hover:text-sky-400 transition-colors">Academics</Link></li>

            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-6">Contact Us</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li>123 Education Blvd</li>
              <li>Cityville, ST 12345</li>
              <li>contact@staugustine.edu</li>
              <li>+1 (555) 123-4567</li>
            </ul>
          </div>
        </div>
        
        <div className="container mx-auto px-6 mt-16 pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} St. Augustine Academy. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
