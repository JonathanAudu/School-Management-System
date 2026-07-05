import Image from "next/image";

async function getEvents() {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        const res = await fetch(`${baseUrl}/api/website/events`, { next: { revalidate: 60 } });
        const data = await res.json();
        return data.events || [];
    } catch (e) {
        console.error("Failed to fetch events", e);
        return [];
    }
}

export default async function EventsList() {
    const events = await getEvents();

    return (
        <div className="flex flex-col w-full">
            <section className="relative py-24 md:py-32 bg-slate-900 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-40">
                    <Image src="/hero.png" alt="Campus" fill className="object-cover" />
                    <div className="absolute inset-0 bg-slate-900/60"></div>
                </div>
                <div className="container mx-auto px-6 relative z-10 text-center text-white">
                    <h1 className="text-4xl md:text-6xl font-bold mb-4 font-serif text-white">Events Calendar</h1>
                    <p className="text-xl text-white max-w-2xl mx-auto">Join us for upcoming activities and community gatherings.</p>
                </div>
            </section>

            <section className="section-padding bg-slate-50">
                <div className="container mx-auto px-6 max-w-5xl">
                    <div className="space-y-6">
                        {events.map((event: any) => {
                            const eventDate = event.date ? new Date(event.date) : null;
                            return (
                                <div key={event.id} className="flex flex-col md:flex-row bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                    <div className="md:w-64 bg-slate-100 relative shrink-0 min-h-[200px]">
                                        {event.image ? (
                                            <Image src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${event.image}`} alt={event.title} fill className="object-cover" />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-5xl">📅</div>
                                        )}
                                    </div>
                                    <div className="p-8 flex flex-col justify-center flex-grow">
                                        <div className="flex flex-wrap gap-4 mb-4">
                                            {eventDate && (
                                                <div className="flex items-center gap-2 text-sky-700 bg-sky-50 px-3 py-1 rounded-full text-sm font-bold">
                                                    <span>🗓️</span> {eventDate.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}
                                                </div>
                                            )}
                                            {event.time && (
                                                <div className="flex items-center gap-2 text-slate-600 bg-slate-100 px-3 py-1 rounded-full text-sm font-semibold">
                                                    <span>⏰</span> {event.time}
                                                </div>
                                            )}
                                            {event.venue && (
                                                <div className="flex items-center gap-2 text-slate-600 bg-slate-100 px-3 py-1 rounded-full text-sm font-semibold">
                                                    <span>📍</span> {event.venue}
                                                </div>
                                            )}
                                        </div>
                                        
                                        <h3 className="text-2xl font-bold mb-4 font-serif text-slate-900">{event.title}</h3>
                                        
                                        {event.description && (
                                            <div 
                                                className="prose prose-sm max-w-none text-slate-600"
                                                dangerouslySetInnerHTML={{ __html: event.description }}
                                            />
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        
                        {events.length === 0 && (
                            <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 text-slate-500">
                                No upcoming events are scheduled at the moment.
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}
