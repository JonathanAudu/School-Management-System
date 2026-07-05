import Image from "next/image";

async function getContactData() {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        const res = await fetch(`${baseUrl}/api/website/settings?group=contact`, { next: { revalidate: 60 } });
        const data = await res.json();

        const settings: any = {};
        if (data.settings) {
            Object.values(data.settings).forEach((s: any) => {
                settings[s.key] = s.value;
            });
        }
        return settings;
    } catch (e) {
        console.error("Failed to fetch contact data", e);
        return {};
    }
}

export default async function Contact() {
    const settings = await getContactData();

    return (
        <div className="flex flex-col w-full">
            <section className="relative py-24 md:py-32 bg-slate-900 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-40">
                    <Image src="/hero.png" alt="Campus" fill className="object-cover" />
                    <div className="absolute inset-0 bg-slate-900/60"></div>
                </div>
                <div className="container mx-auto px-6 relative z-10 text-center text-white">
                    <h1 className="text-4xl md:text-6xl font-bold mb-4 font-serif text-white">Contact Us</h1>
                    <p className="text-xl text-white max-w-2xl mx-auto">We'd love to hear from you. Get in touch with our team.</p>
                </div>
            </section>

            <section className="section-padding bg-white">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                        
                        <div>
                            <h2 className="text-3xl font-bold mb-8 font-serif">Get In Touch</h2>
                            
                            <div className="space-y-8 mb-12">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-full flex items-center justify-center shrink-0 text-xl">📍</div>
                                    <div>
                                        <h4 className="font-bold text-lg mb-1">Our Location</h4>
                                        <p className="text-slate-600 whitespace-pre-line">{settings.contact_address || '123 Education Lane\nLearning City, ST 12345'}</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-full flex items-center justify-center shrink-0 text-xl">📞</div>
                                    <div>
                                        <h4 className="font-bold text-lg mb-1">Phone Number</h4>
                                        <p className="text-slate-600">{settings.contact_phone || '+1 (555) 123-4567'}</p>
                                        {settings.contact_phone_alt && <p className="text-slate-600">{settings.contact_phone_alt}</p>}
                                    </div>
                                </div>
                                
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-full flex items-center justify-center shrink-0 text-xl">✉️</div>
                                    <div>
                                        <h4 className="font-bold text-lg mb-1">Email Address</h4>
                                        <a href={`mailto:${settings.contact_email || 'info@school.edu'}`} className="text-sky-600 hover:underline">
                                            {settings.contact_email || 'info@school.edu'}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-2 rounded-3xl border border-slate-100 h-[500px]">
                            {settings.contact_map_embed ? (
                                <div 
                                    className="w-full h-full rounded-2xl overflow-hidden [&>iframe]:w-full [&>iframe]:h-full"
                                    dangerouslySetInnerHTML={{ __html: settings.contact_map_embed }}
                                />
                            ) : (
                                <div className="w-full h-full bg-slate-200 rounded-2xl flex items-center justify-center text-slate-400">
                                    Map not configured.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
