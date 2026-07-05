import Image from "next/image";

async function getStudentLifeData() {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        const res = await fetch(`${baseUrl}/api/website/settings?group=student_life`, { next: { revalidate: 60 } });
        const data = await res.json();

        const settings: any = {};
        if (data.settings) {
            Object.values(data.settings).forEach((s: any) => {
                settings[s.key] = s.value;
            });
        }
        return settings;
    } catch (e) {
        console.error("Failed to fetch student life data", e);
        return {};
    }
}

export default async function StudentLife() {
    const settings = await getStudentLifeData();

    return (
        <div className="flex flex-col w-full">
            <section className="relative py-24 md:py-32 bg-slate-900 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-40">
                    <Image src="/hero.png" alt="Campus" fill className="object-cover" />
                    <div className="absolute inset-0 bg-slate-900/60"></div>
                </div>
                <div className="container mx-auto px-6 relative z-10 text-center text-white">
                    <h1 className="text-4xl md:text-6xl font-bold mb-4 font-serif text-white">Student Life</h1>
                    <p className="text-xl text-white max-w-2xl mx-auto">A vibrant community outside the classroom.</p>
                </div>
            </section>

            <section className="section-padding bg-slate-50">
                <div className="container mx-auto px-6 max-w-5xl space-y-16">
                    
                    <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100">
                        <h2 className="text-3xl font-bold mb-6 font-serif text-center">Life on Campus</h2>
                        {settings.student_life_overview ? (
                            <div 
                                className="prose prose-sky max-w-none text-slate-600 mx-auto"
                                dangerouslySetInnerHTML={{ __html: settings.student_life_overview }}
                            />
                        ) : (
                            <p className="text-slate-500 italic text-center">Information pending.</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                            <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-xl flex items-center justify-center text-2xl mb-6">🎭</div>
                            <h3 className="text-2xl font-bold mb-4 font-serif">Clubs & Societies</h3>
                            {settings.student_life_clubs ? (
                                <div 
                                    className="prose prose-sm prose-sky max-w-none text-slate-600"
                                    dangerouslySetInnerHTML={{ __html: settings.student_life_clubs }}
                                />
                            ) : (
                                <p className="text-slate-500 italic text-sm">Information pending.</p>
                            )}
                        </div>

                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                            <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-xl flex items-center justify-center text-2xl mb-6">⚽</div>
                            <h3 className="text-2xl font-bold mb-4 font-serif">Sports & Athletics</h3>
                            {settings.student_life_sports ? (
                                <div 
                                    className="prose prose-sm prose-sky max-w-none text-slate-600"
                                    dangerouslySetInnerHTML={{ __html: settings.student_life_sports }}
                                />
                            ) : (
                                <p className="text-slate-500 italic text-sm">Information pending.</p>
                            )}
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-3xl p-8 md:p-12 text-white">
                        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-2xl mb-6">🏆</div>
                        <h3 className="text-2xl font-bold mb-6 font-serif text-white">Student Achievements</h3>
                        {settings.student_life_achievements ? (
                            <div 
                                className="prose prose-sm prose-invert max-w-none text-slate-300"
                                dangerouslySetInnerHTML={{ __html: settings.student_life_achievements }}
                            />
                        ) : (
                            <p className="text-slate-400 italic">Information pending.</p>
                        )}
                    </div>

                </div>
            </section>
        </div>
    );
}
