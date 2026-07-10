import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getImageUrl } from "@/lib/utils";

async function getNewsArticle(id: string) {
    try {
        // Technically our current API doesn't have a show route yet, but we can fetch all and find. 
        // In a real app we'd add `Route::get('/website/news/{id}')`.
        // Let's just fetch all and find it for now since we haven't added the show route.
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        const res = await fetch(`${baseUrl}/api/website/news`, { next: { revalidate: 60 } });
        const data = await res.json();
        const article = data.news?.find((n: any) => n.id.toString() === id);
        return article;
    } catch (e) {
        console.error("Failed to fetch news article", e);
        return null;
    }
}

export default async function NewsDetail({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const article = await getNewsArticle(resolvedParams.id);

    if (!article) {
        notFound();
    }

    return (
        <div className="flex flex-col w-full min-h-screen bg-slate-50">
            <section className="pt-32 pb-16 bg-white border-b border-slate-100">
                <div className="container mx-auto px-6 max-w-4xl">
                    
                    {article.category && (
                        <span className="text-sm font-bold text-sky-600 uppercase tracking-wider mb-4 block">
                            {article.category}
                        </span>
                    )}
                    
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 font-serif leading-tight">
                        {article.title}
                    </h1>
                    
                    <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
                        <span>Published: {article.published_at || new Date(article.created_at).toISOString().split('T')[0]}</span>
                    </div>
                </div>
            </section>

            {article.image && (
                <section className="bg-slate-50 -mt-10">
                    <div className="container mx-auto px-6 max-w-5xl">
                        <div className="relative aspect-video rounded-3xl overflow-hidden shadow-xl border-4 border-white">
                            <Image src={getImageUrl(article.image)} alt={article.title} fill className="object-cover" priority />
                        </div>
                    </div>
                </section>
            )}

            <section className="py-16">
                <div className="container mx-auto px-6 max-w-3xl">
                    {article.content ? (
                        <div 
                            className="prose prose-lg prose-sky max-w-none text-slate-700 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: article.content }}
                        />
                    ) : (
                        <p className="text-slate-500 italic">No content provided.</p>
                    )}
                </div>
            </section>
        </div>
    );
}
