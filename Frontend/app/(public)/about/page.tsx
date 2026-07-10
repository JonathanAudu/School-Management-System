import Image from "next/image";
import { getImageUrl } from "@/lib/utils";

async function getAboutData() {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        const [settingsRes, leadershipRes] = await Promise.all([
            fetch(`${baseUrl}/api/website/settings?group=about`, { next: { revalidate: 60 } }),
            fetch(`${baseUrl}/api/website/leadership-members`, { next: { revalidate: 60 } })
        ]);

        const settingsData = await settingsRes.json();
        const leadershipData = await leadershipRes.json();

        const settings: any = {};
        if (settingsData.settings) {
            Object.values(settingsData.settings).forEach((s: any) => {
                settings[s.key] = s.value;
            });
        }

        return {
            settings,
            leaders: leadershipData.members || []
        };
    } catch (e) {
        console.error("Failed to fetch about data", e);
        return { settings: {}, leaders: [] };
    }
}

export default async function About() {
    const { settings, leaders } = await getAboutData();

    return (
        <div className="flex flex-col w-full">
            {/* Page Header */}
            <section className="relative py-24 md:py-32 bg-slate-900 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-40">
                    <Image src="/hero.png" alt="Campus" fill className="object-cover" />
                    <div className="absolute inset-0 bg-slate-900/60"></div>
                </div>
                <div className="container mx-auto px-6 relative z-10 text-center text-white">
                    <h1 className="text-4xl md:text-6xl font-bold mb-4 font-serif text-white">About Us</h1>
                    <p className="text-xl text-white max-w-2xl mx-auto">Discover our history, mission, and the people behind our success.</p>
                </div>
            </section>

            {/* Main Content */}
            <section className="section-padding bg-white">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-24">
                        <div>
                            <h2 className="text-3xl font-bold mb-6 font-serif">Our History</h2>
                            {settings.school_history ? (
                                <div 
                                    className="space-y-4 text-slate-600 leading-relaxed prose prose-sky max-w-none"
                                    dangerouslySetInnerHTML={{ __html: settings.school_history }}
                                />
                            ) : (
                                <div className="space-y-4 text-slate-600 leading-relaxed">
                                    <p>Our school history has not been updated yet.</p>
                                </div>
                            )}
                        </div>
                        
                        <div className="bg-sky-50 rounded-3xl p-10 border border-sky-100 shadow-sm h-fit">
                            <h2 className="text-3xl font-bold mb-6 text-sky-800 font-serif">Mission & Vision</h2>
                            
                            <h4 className="text-xl font-bold text-slate-900 mb-2">Our Mission</h4>
                            <p className="text-slate-600 mb-8 leading-relaxed">
                                {settings.mission_statement || "Mission statement pending."}
                            </p>
                            
                            <h4 className="text-xl font-bold text-slate-900 mb-2">Our Vision</h4>
                            <p className="text-slate-600 mb-8 leading-relaxed">
                                {settings.vision_statement || "Vision statement pending."}
                            </p>

                            {settings.core_values && (
                                <>
                                    <h4 className="text-xl font-bold text-slate-900 mb-2">Core Values</h4>
                                    <div 
                                        className="text-slate-600 leading-relaxed prose prose-sm prose-sky max-w-none"
                                        dangerouslySetInnerHTML={{ __html: settings.core_values }}
                                    />
                                </>
                            )}
                        </div>
                    </div>

                    <div className="border-t border-slate-100 pt-20">
                        <div className="text-center max-w-2xl mx-auto mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-serif">School Leadership</h2>
                            <p className="text-slate-600 text-lg">Meet the dedicated individuals guiding our institution.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {leaders.map((leader: any) => (
                                <div key={leader.id} className="text-center group">
                                    <div className="relative w-48 h-48 mx-auto mb-6 rounded-full overflow-hidden bg-slate-100 border-4 border-white shadow-lg group-hover:shadow-xl transition-shadow">
                                        {leader.photo ? (
                                            <Image src={getImageUrl(leader.photo)} alt={leader.name} fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-5xl font-bold text-slate-300">
                                                {leader.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900">{leader.name}</h3>
                                    <p className="text-sky-600 font-medium mb-3">{leader.position}</p>
                                    <p className="text-sm text-slate-500 leading-relaxed">{leader.bio}</p>
                                </div>
                            ))}
                            {leaders.length === 0 && (
                                <div className="col-span-full text-center py-10 text-slate-500">
                                    Leadership profiles are being updated.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
