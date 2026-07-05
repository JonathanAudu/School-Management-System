import Image from "next/image";
import GalleryView from "@/components/GalleryView";

async function getAlbums() {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        const res = await fetch(`${baseUrl}/api/website/albums`, { next: { revalidate: 60 } });
        const data = await res.json();
        return data.albums || [];
    } catch (e) {
        console.error("Failed to fetch albums", e);
        return [];
    }
}

export default async function Gallery() {
    const albums = await getAlbums();

    return (
        <div className="flex flex-col w-full">
            <section className="relative py-24 md:py-32 bg-slate-900 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-40">
                    <Image src="/hero.png" alt="Campus" fill className="object-cover" />
                    <div className="absolute inset-0 bg-slate-900/60"></div>
                </div>
                <div className="container mx-auto px-6 relative z-10 text-center text-white">
                    <h1 className="text-4xl md:text-6xl font-bold mb-4 font-serif text-white">Photo Gallery</h1>
                    <p className="text-xl text-white max-w-2xl mx-auto">A visual journey through our campus and events.</p>
                </div>
            </section>

            <section className="section-padding bg-slate-50">
                <div className="container mx-auto px-6">
                    <GalleryView albums={albums} />
                </div>
            </section>
        </div>
    );
}
