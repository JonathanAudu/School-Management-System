'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function GalleryView({ albums }: { albums: any[] }) {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {albums.map((album: any) => {
                    const coverImageUrl = album.cover_image 
                        ? `${baseUrl}/storage/${album.cover_image}` 
                        : (album.photos && album.photos.length > 0 ? `${baseUrl}/storage/${album.photos[0].image}` : null);
                        
                    const photoCount = album.photos?.length || 0;

                    return (
                        <div key={album.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 group cursor-pointer" onClick={() => coverImageUrl && setSelectedImage(coverImageUrl)}>
                            <div className="aspect-[4/3] bg-slate-200 relative overflow-hidden">
                                {coverImageUrl ? (
                                    <Image src={coverImageUrl} alt={album.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-4xl">📁</div>
                                )}
                                
                                {photoCount > 0 && (
                                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full z-10">
                                        {photoCount} {photoCount === 1 ? 'Photo' : 'Photos'}
                                    </div>
                                )}
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold mb-2">{album.name}</h3>
                                {album.description && <p className="text-slate-600 text-sm line-clamp-2">{album.description}</p>}
                            </div>
                        </div>
                    );
                })}
                {albums.length === 0 && (
                    <div className="col-span-full text-center py-20 text-slate-500">
                        No albums have been published yet.
                    </div>
                )}
            </div>

            {/* Modal */}
            {selectedImage && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
                    onClick={() => setSelectedImage(null)}
                >
                    <button 
                        className="absolute top-6 right-6 text-white text-4xl hover:text-slate-300 transition-colors z-50"
                        onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
                    >
                        &times;
                    </button>
                    <div className="relative w-full max-w-5xl aspect-[4/3] sm:aspect-video flex items-center justify-center">
                        <Image 
                            src={selectedImage} 
                            alt="Gallery view" 
                            fill 
                            className="object-contain" 
                        />
                    </div>
                </div>
            )}
        </>
    );
}
