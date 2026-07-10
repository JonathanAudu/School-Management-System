import Image from "next/image";
import { getImageUrl } from "@/lib/utils";

async function getAcademicsData() {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        const res = await fetch(`${baseUrl}/api/website/settings?group=academics`, { next: { revalidate: 60 } });
        const data = await res.json();

        const settings: any = {};
        if (data.settings) {
            Object.values(data.settings).forEach((s: any) => {
                settings[s.key] = s.value;
            });
        }
        return settings;
    } catch (e) {
        console.error("Failed to fetch academics data", e);
        return {};
    }
}

export default async function Academics() {
    const settings = await getAcademicsData();

    return (
        <div className="flex flex-col w-full">
            <section className="relative py-24 md:py-32 bg-slate-900 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-40">
                    <Image src="/hero.png" alt="Campus" fill className="object-cover" />
                    <div className="absolute inset-0 bg-slate-900/60"></div>
                </div>
                <div className="container mx-auto px-6 relative z-10 text-center text-white">
                    <h1 className="text-4xl md:text-6xl font-bold mb-4 font-serif text-white">Academics</h1>
                    <p className="text-xl text-white max-w-2xl mx-auto">Cultivating excellence through a rigorous and dynamic curriculum.</p>
                </div>
            </section>

            <section className="section-padding bg-white">
                <div className="container mx-auto px-6 max-w-4xl">
                    
                    {settings.academics_calendar_pdf && (
                        <div className="bg-sky-50 rounded-2xl p-6 border border-sky-100 flex items-center justify-between mb-16">
                            <div className="flex items-center gap-4">
                                <div className="text-3xl">📅</div>
                                <div>
                                    <h3 className="font-bold text-lg">Academic Calendar</h3>
                                    <p className="text-sm text-slate-600">Download the full schedule for the year.</p>
                                </div>
                            </div>
                            <a href={getImageUrl(settings.academics_calendar_pdf)} target="_blank" rel="noreferrer" className="btn-primary">
                                Download PDF
                            </a>
                        </div>
                    )}

                    <div className="space-y-16">
                        <div>
                            <h2 className="text-3xl font-bold mb-6 font-serif">Academic Overview</h2>
                            {settings.academics_overview ? (
                                <div 
                                    className="prose prose-sky max-w-none text-slate-600"
                                    dangerouslySetInnerHTML={{ __html: settings.academics_overview }}
                                />
                            ) : (
                                <p className="text-slate-500 italic">Information pending.</p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-10 border-t border-slate-100">
                            <div>
                                <h2 className="text-3xl font-bold mb-6 font-serif">Classes Offered</h2>
                                {settings.academics_classes ? (
                                    <div 
                                        className="prose prose-sm prose-sky max-w-none text-slate-600"
                                        dangerouslySetInnerHTML={{ __html: settings.academics_classes }}
                                    />
                                ) : (
                                    <p className="text-slate-500 italic">Information pending.</p>
                                )}
                            </div>
                            
                            <div>
                                <h2 className="text-3xl font-bold mb-6 font-serif">Subjects & Curriculum</h2>
                                {settings.academics_subjects ? (
                                    <div 
                                        className="prose prose-sm prose-sky max-w-none text-slate-600"
                                        dangerouslySetInnerHTML={{ __html: settings.academics_subjects }}
                                    />
                                ) : (
                                    <p className="text-slate-500 italic">Information pending.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
