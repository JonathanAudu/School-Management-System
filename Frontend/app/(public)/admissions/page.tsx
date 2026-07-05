import Image from "next/image";
import Link from "next/link";

async function getAdmissionsData() {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        const res = await fetch(`${baseUrl}/api/website/settings?group=admissions`, { next: { revalidate: 60 } });
        const data = await res.json();

        const settings: any = {};
        if (data.settings) {
            Object.values(data.settings).forEach((s: any) => {
                settings[s.key] = s.value;
            });
        }
        return settings;
    } catch (e) {
        console.error("Failed to fetch admissions data", e);
        return {};
    }
}

export default async function Admissions() {
    const settings = await getAdmissionsData();
    const isOnlineEnabled = settings.admissions_online_enabled === 'true' || settings.admissions_online_enabled === true;

    return (
        <div className="flex flex-col w-full">
            <section className="relative py-24 md:py-32 bg-slate-900 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-40">
                    <Image src="/hero.png" alt="Campus" fill className="object-cover" />
                    <div className="absolute inset-0 bg-slate-900/60"></div>
                </div>
                <div className="container mx-auto px-6 relative z-10 text-center text-white">
                    <h1 className="text-4xl md:text-6xl font-bold mb-4 font-serif text-white">Admissions</h1>
                    <p className="text-xl text-white max-w-2xl mx-auto">Join our community of exceptional learners.</p>
                </div>
            </section>

            <section className="section-padding bg-slate-50">
                <div className="container mx-auto px-6 max-w-5xl">
                    
                    <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100 mb-12 flex flex-col md:flex-row gap-8 items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold mb-2">Ready to Apply?</h2>
                            {settings.admissions_deadline ? (
                                <p className="text-slate-600">The application deadline for the upcoming academic year is <strong className="text-red-600">{settings.admissions_deadline}</strong>.</p>
                            ) : (
                                <p className="text-slate-600">Applications are currently open on a rolling basis.</p>
                            )}
                        </div>
                        {isOnlineEnabled && (
                            <Link href="#" className="btn-primary shrink-0 whitespace-nowrap">
                                Apply Online Now
                            </Link>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="md:col-span-2 space-y-12">
                            <div>
                                <h2 className="text-3xl font-bold mb-6 font-serif border-b border-slate-200 pb-4">Admission Process</h2>
                                {settings.admissions_process ? (
                                    <div 
                                        className="prose prose-sky max-w-none text-slate-600"
                                        dangerouslySetInnerHTML={{ __html: settings.admissions_process }}
                                    />
                                ) : (
                                    <p className="text-slate-500 italic">Information pending.</p>
                                )}
                            </div>

                            <div>
                                <h2 className="text-3xl font-bold mb-6 font-serif border-b border-slate-200 pb-4">Fee Structure</h2>
                                {settings.admissions_fees_format === 'table' && settings.admissions_fees_table ? (
                                    <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-slate-50 text-slate-700">
                                                    <th className="py-4 px-6 border-b border-slate-200 font-semibold">Description</th>
                                                    <th className="py-4 px-6 border-b border-slate-200 font-semibold">Amount</th>
                                                    <th className="py-4 px-6 border-b border-slate-200 font-semibold">Notes</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 bg-white">
                                                {(() => {
                                                    try {
                                                        const tableData = JSON.parse(settings.admissions_fees_table);
                                                        return tableData.map((row: any, i: number) => (
                                                            <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                                                <td className="py-4 px-6 text-slate-800 font-medium">{row.description}</td>
                                                                <td className="py-4 px-6 text-slate-700 font-semibold">{row.amount}</td>
                                                                <td className="py-4 px-6 text-slate-500 text-sm">{row.notes}</td>
                                                            </tr>
                                                        ));
                                                    } catch (e) {
                                                        return <tr><td colSpan={3} className="py-4 px-6 text-red-500">Error loading table data</td></tr>;
                                                    }
                                                })()}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : settings.admissions_fees ? (
                                    <div 
                                        className="prose prose-sky max-w-none text-slate-600"
                                        dangerouslySetInnerHTML={{ __html: settings.admissions_fees }}
                                    />
                                ) : (
                                    <p className="text-slate-500 italic">Information pending.</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="bg-sky-50 rounded-2xl p-8 border border-sky-100">
                                <h3 className="text-xl font-bold text-sky-900 mb-4">Requirements</h3>
                                {settings.admissions_requirements ? (
                                    <div 
                                        className="prose prose-sm prose-sky max-w-none text-slate-700"
                                        dangerouslySetInnerHTML={{ __html: settings.admissions_requirements }}
                                    />
                                ) : (
                                    <p className="text-slate-500 italic text-sm">Information pending.</p>
                                )}
                            </div>

                            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm text-center">
                                <h3 className="text-xl font-bold mb-2">Need Help?</h3>
                                <p className="text-slate-600 text-sm mb-6">Our admissions team is here to guide you through every step.</p>
                                <Link href="/contact" className="btn-outline w-full justify-center">Contact Admissions</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
