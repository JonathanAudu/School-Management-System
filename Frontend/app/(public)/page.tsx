import Image from "next/image";
import Link from "next/link";
import HeroSlider from "@/components/HeroSlider";
import { getImageUrl } from "@/lib/utils";

async function getHomepageData() {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        const [settingsRes, slidesRes, statsRes, newsRes, eventsRes] = await Promise.all([
            fetch(`${baseUrl}/api/website/settings?group=homepage`, { next: { revalidate: 60 } }),
            fetch(`${baseUrl}/api/website/hero-slides`, { next: { revalidate: 60 } }),
            fetch(`${baseUrl}/api/website/quick-stats`, { next: { revalidate: 60 } }),
            fetch(`${baseUrl}/api/website/news`, { next: { revalidate: 60 } }),
            fetch(`${baseUrl}/api/website/events`, { next: { revalidate: 60 } })
        ]);

        const settingsData = await settingsRes.json();
        const slidesData = await slidesRes.json();
        const statsData = await statsRes.json();
        const newsData = await newsRes.json();
        const eventsData = await eventsRes.json();

        const settings: any = {};
        if (settingsData.settings) {
            Object.values(settingsData.settings).forEach((s: any) => {
                settings[s.key] = s.value;
            });
        }

        return {
            settings,
            slides: slidesData.slides?.filter((s: any) => s.is_active) || [],
            stats: statsData.stats || [],
            news: newsData.news || [],
            events: eventsData.events || []
        };
    } catch (e) {
        console.error("Failed to fetch homepage data", e);
        return { settings: {}, slides: [], stats: [], news: [], events: [] };
    }
}

export default async function Home() {
    const { settings, slides, stats, news, events } = await getHomepageData();

    const showNews = settings.show_news === 'true' || settings.show_news === true;
    const showEvents = settings.show_events === 'true' || settings.show_events === true;
    const itemsToDisplay = parseInt(settings.items_to_display || '3');

    const displayNews = news.slice(0, itemsToDisplay);
    const displayEvents = events.slice(0, itemsToDisplay);

    return (
        <div className="flex flex-col w-full">
            {/* Dynamic Hero Section */}
            <HeroSlider slides={slides} />

            {/* About Summary / Welcome Section */}
            <section className="section-padding bg-white relative">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">{settings.welcome_heading || 'Welcome to St. Augustine Academy'}</h2>
                            {settings.welcome_body ? (
                                <div 
                                    className="space-y-4 text-slate-600 mb-8 leading-relaxed prose prose-sky max-w-none"
                                    dangerouslySetInnerHTML={{ __html: settings.welcome_body }}
                                />
                            ) : (
                                <div className="space-y-4 text-slate-600 mb-8 leading-relaxed">
                                    <p>Discover a world-class education where tradition meets innovation. Join a community dedicated to your holistic success and personal growth.</p>
                                </div>
                            )}
                            <Link href="/about" className="text-sky-600 font-semibold hover:text-sky-700 flex items-center gap-2 group mt-6">
                                Read Our Story
                                <span className="transition-transform group-hover:translate-x-1">→</span>
                            </Link>
                        </div>

                        <div className="relative">
                            {/* Decorative background elements */}
                            <div className="absolute -inset-4 bg-slate-100 rounded-3xl transform rotate-3"></div>
                            <div className="absolute -inset-4 bg-sky-50 rounded-3xl transform -rotate-3 opacity-70"></div>
                            {/* Image */}
                            <div className="relative aspect-square md:aspect-[4/3] bg-slate-200 rounded-2xl shadow-lg flex items-center justify-center overflow-hidden">
                                {settings.welcome_image ? (
                                    <Image src={getImageUrl(settings.welcome_image)} alt="Welcome" fill className="object-cover" />
                                ) : (
                                    <Image src="/hero.png" alt="Campus View" fill className="object-cover" />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quick Stats */}
            {stats.length > 0 && (
                <section className="py-20 bg-slate-900 text-white">
                    <div className="container mx-auto px-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-slate-800">
                            {stats.map((stat: any) => (
                                <div key={stat.id} className="text-center px-4">
                                    {stat.icon && <div className="text-3xl mb-3">{stat.icon}</div>}
                                    <div className="text-4xl md:text-5xl font-bold text-sky-400 mb-2 font-serif">
                                        {stat.number}{stat.suffix}
                                    </div>
                                    <div className="text-sm text-slate-400 uppercase tracking-wider font-semibold">{stat.title}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Latest News */}
            {showNews && displayNews.length > 0 && (
                <section className="section-padding bg-slate-50">
                    <div className="container mx-auto px-6">
                        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                            <div className="max-w-2xl">
                                <h2 className="text-3xl md:text-4xl font-bold mb-4">Latest News & Insights</h2>
                                <p className="text-slate-600 text-lg">Stay updated with the latest happenings, achievements, and stories from our campus community.</p>
                            </div>
                            <Link href="/news" className="btn-outline shrink-0">
                                View All News
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {displayNews.map((article: any) => (
                                <Link href={`/news/${article.id}`} key={article.id} className="card group cursor-pointer block">
                                    <div className="aspect-[16/9] bg-slate-200 relative overflow-hidden">
                                        {article.image ? (
                                            <Image src={getImageUrl(article.image)} alt={article.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <div className="absolute inset-0 bg-slate-300 group-hover:scale-105 transition-transform duration-500"></div>
                                        )}
                                    </div>
                                    <div className="p-8">
                                        {article.category && <span className="text-xs font-bold text-sky-600 uppercase tracking-wider mb-2 block">{article.category}</span>}
                                        <h3 className="text-xl font-bold mb-3 group-hover:text-sky-600 transition-colors line-clamp-2">{article.title}</h3>
                                        <div className="text-sm text-slate-400 font-medium">{article.published_at || new Date(article.created_at).toISOString().split('T')[0]}</div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Upcoming Events */}
            {showEvents && displayEvents.length > 0 && (
                <section className="section-padding bg-white">
                    <div className="container mx-auto px-6">
                        <div className="text-center max-w-2xl mx-auto mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">Upcoming Events</h2>
                            <p className="text-slate-600 text-lg">Don't miss out on what's happening on campus. Join us for our upcoming community events.</p>
                        </div>

                        <div className="max-w-4xl mx-auto space-y-6">
                            {displayEvents.map((event: any) => {
                                const eventDate = event.date ? new Date(event.date) : null;
                                return (
                                    <div key={event.id} className="flex flex-col sm:flex-row items-center p-6 border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow gap-6 bg-white">
                                        <div className="flex flex-col items-center justify-center min-w-[100px] border-r border-slate-100 pr-6">
                                            {eventDate ? (
                                                <>
                                                    <span className="text-3xl font-bold text-sky-600">{eventDate.getDate()}</span>
                                                    <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{eventDate.toLocaleString('default', { month: 'short' })}</span>
                                                </>
                                            ) : (
                                                <span className="text-3xl font-bold text-sky-600">-</span>
                                            )}
                                        </div>
                                        <div className="flex-grow text-center sm:text-left">
                                            <h4 className="text-xl font-bold mb-2">{event.title}</h4>
                                            <p className="text-slate-500 text-sm flex flex-wrap items-center justify-center sm:justify-start gap-4">
                                                {event.time && <span>⏱ {event.time}</span>}
                                                {event.venue && <span>📍 {event.venue}</span>}
                                            </p>
                                        </div>
                                        <div className="shrink-0">
                                            {/* Assuming there will be an event details page, otherwise can link to generic events page */}
                                            <Link href={`/events`} className="btn-outline px-6 py-2 text-sm">Details</Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        
                        <div className="text-center mt-12">
                            <Link href="/events" className="text-sky-600 font-semibold hover:text-sky-700 flex items-center justify-center gap-2 group">
                                View Full Calendar
                                <span className="transition-transform group-hover:translate-x-1">→</span>
                            </Link>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}
