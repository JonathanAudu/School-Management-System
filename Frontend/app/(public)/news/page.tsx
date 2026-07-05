import Image from "next/image";
import Link from "next/link";

async function getNews() {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        const res = await fetch(`${baseUrl}/api/website/news`, { next: { revalidate: 60 } });
        const data = await res.json();
        return data.news || [];
    } catch (e) {
        console.error("Failed to fetch news", e);
        return [];
    }
}

export default async function NewsList() {
    const news = await getNews();

    return (
        <div className="flex flex-col w-full">
            <section className="relative py-24 md:py-32 bg-slate-900 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-40">
                    <Image src="/hero.png" alt="Campus" fill className="object-cover" />
                    <div className="absolute inset-0 bg-slate-900/60"></div>
                </div>
                <div className="container mx-auto px-6 relative z-10 text-center text-white">
                    <h1 className="text-4xl md:text-6xl font-bold mb-4 font-serif text-white">News & Insights</h1>
                    <p className="text-xl text-white max-w-2xl mx-auto">Stay updated with the latest happenings from our campus community.</p>
                </div>
            </section>

            <section className="section-padding bg-slate-50">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {news.map((article: any) => (
                            <Link href={`/news/${article.id}`} key={article.id} className="card group cursor-pointer block bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                                <div className="aspect-[16/9] bg-slate-200 relative overflow-hidden">
                                    {article.image ? (
                                        <Image src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${article.image}`} alt={article.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="absolute inset-0 bg-slate-300 group-hover:scale-105 transition-transform duration-500"></div>
                                    )}
                                </div>
                                <div className="p-8 flex flex-col h-full">
                                    {article.category && <span className="text-xs font-bold text-sky-600 uppercase tracking-wider mb-2 block">{article.category}</span>}
                                    <h3 className="text-xl font-bold mb-3 group-hover:text-sky-600 transition-colors line-clamp-2">{article.title}</h3>
                                    
                                    {article.content && (
                                        <div 
                                            className="text-slate-600 mb-6 line-clamp-3 text-sm prose-sm"
                                            dangerouslySetInnerHTML={{ __html: article.content.substring(0, 150) + '...' }}
                                        />
                                    )}
                                    
                                    <div className="mt-auto text-sm text-slate-400 font-medium border-t border-slate-100 pt-4">
                                        {article.published_at || new Date(article.created_at).toISOString().split('T')[0]}
                                    </div>
                                </div>
                            </Link>
                        ))}
                        {news.length === 0 && (
                            <div className="col-span-full text-center py-20 text-slate-500">
                                No news articles have been published yet.
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}
