import { useEffect, useState } from "react";
import {
    FaNewspaper,
    FaExternalLinkAlt,
    FaYoutube,
    FaFacebook,
    FaInstagram,
    FaGlobe,
    FaBookOpen,
    FaSpinner,
    FaMosque,
} from "react-icons/fa";
import { FaTwitter as FaXTwitter } from "react-icons/fa";

/* ─── Static fallback for the latest sermon ─── */
const FALLBACK_SERMON = {
    title: "The Exemplary Generosity of The Prophet (sa): Lessons from His Life",
    date: "June 19, 2026",
    summary:
        "His Holiness Hazrat Mirza Masroor Ahmad (aba) continued presenting narrations regarding the Holy Prophet's (sa) unparalleled generosity. The Holy Prophet (sa) would give away all his wealth to those who asked, never turning anyone away empty-handed. He taught that one who refrains from begging and seeks independence through reliance on Allah will be granted freedom by God. This sermon reminds us that true generosity springs from complete trust in the Divine.",
    url: "https://www.alislam.org/friday-sermon/",
    watchUrl: "https://www.mta.tv",
};

/* ─── Nigeria news cards (sourced from ahmadiyya.ng & press.ahmadiyya.ng) ─── */
const NIGERIA_NEWS = [
    {
        title: "Ahmadiyya Nigeria Calls for Global Peace Through Love",
        date: "March 2026",
        summary:
            "The Amir of Ahmadiyya Muslim Jama'at Nigeria, Barrister Azeez Alatoye, delivered an Eid-ul-Fitr message urging members to seek the love of Allah and uphold the dignity of mankind to achieve lasting world peace.",
        url: "https://ahmadiyya.ng",
        tag: "Nigeria",
    },
    {
        title: "Jamia Ahmadiyya Nigeria — Upcoming Academic Session",
        date: "2026",
        summary:
            "Jamia Ahmadiyya Nigeria continues to train missionaries in Islamic studies, Arabic language and theology. Applications for the new academic session are being processed at the Sagamu campus.",
        url: "https://jamiaahmadiyya.ng",
        tag: "Education",
    },
    {
        title: "Majlis Khuddam-ul-Ahmadiyya Nigeria Activities",
        date: "2026",
        summary:
            "The youth auxiliary of AMJN continues its community service projects across Nigeria, including medical outreach, blood donation drives, and tree-planting campaigns.",
        url: "https://www.facebook.com/khuddamnigeria/",
        tag: "Community",
    },
];

/* ─── World news cards (sourced from alislam.org & reviewofreligions.org) ─── */
const WORLD_NEWS = [
    {
        title: "MTA Ghana TV Channel Launched by Khalifa",
        date: "2025",
        summary:
            "His Holiness Hazrat Mirza Masroor Ahmad (aba) officially launched MTA Ghana TV, extending the reach of Ahmadiyya broadcasting across West Africa with local-language programming.",
        url: "https://www.alislam.org/press-release/head-of-ahmadiyya-muslim-community-launches-mta-ghana-tv-channel/",
        tag: "Media",
    },
    {
        title: "Ahmadiyya Community Spans 200+ Nations",
        date: "2025",
        summary:
            "The Ahmadiyya Muslim Community now operates in over 200 countries with more than 16,000 mosques, 600 schools, and 30 hospitals worldwide under the leadership of Khalifatul Masih V.",
        url: "https://www.alislam.org/ahmadiyya-muslim-community/",
        tag: "Global",
    },
    {
        title: "Alahmadiyya.org Updates — June 2026",
        date: "June 2026",
        summary:
            "Multiple Ahmadiyya publications have been updated including translations of the Holy Quran into Spanish, French and Hindi, and the latest issue of The Islamic View magazine.",
        url: "https://alahmadiyya.org/updates-at-alahmadiyya-org-in-june-2026/",
        tag: "Publications",
    },
];

/* ─── Social media quick links ─── */
const SOCIALS = [
    {
        label: "alislam.org",
        sub: "Official Ahmadiyya website",
        icon: <FaGlobe />,
        url: "https://www.alislam.org",
        color: "#16a34a",
    },
    {
        label: "MTA International",
        sub: "Watch live — mta.tv",
        icon: <FaYoutube />,
        url: "https://www.youtube.com/@mtaOnline1",
        color: "#dc2626",
    },
    {
        label: "@alislam",
        sub: "Official Ahmadiyya on X",
        icon: <FaXTwitter />,
        url: "https://x.com/alislam",
        color: "#111827",
    },
    {
        label: "Ahmadiyya Nigeria",
        sub: "Facebook — @ahmadiyyang",
        icon: <FaFacebook />,
        url: "https://www.facebook.com/ahmadiyyang/",
        color: "#1877f2",
    },
    {
        label: "@mta_international",
        sub: "MTA on Instagram",
        icon: <FaInstagram />,
        url: "https://www.instagram.com/mta_international/",
        color: "#c13584",
    },
    {
        label: "@JamatMuslim",
        sub: "AMJN Nigeria on X",
        icon: <FaXTwitter />,
        url: "https://x.com/jamatmuslim",
        color: "#111827",
    },
    {
        label: "ahmadiyya.ng",
        sub: "Nigeria official site",
        icon: <FaGlobe />,
        url: "https://ahmadiyya.ng",
        color: "#16a34a",
    },
    {
        label: "Press AMJN Nigeria",
        sub: "press.ahmadiyya.ng",
        icon: <FaNewspaper />,
        url: "https://press.ahmadiyya.ng",
        color: "#0369a1",
    },
];

/* ─── Try to fetch the latest sermon from alislam.org via CORS proxy ─── */
async function fetchLatestSermon() {
    const PROXY = "https://api.allorigins.win/raw?url=";
    const FEED = encodeURIComponent("https://www.alislam.org/friday-sermon/rss.xml");
    const res = await fetch(`${PROXY}${FEED}`, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error("Feed unavailable");
    const text = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "application/xml");
    const items = doc.querySelectorAll("item");
    if (!items.length) throw new Error("No items");
    const first = items[0];
    const title = first.querySelector("title")?.textContent?.trim() || "";
    const link = first.querySelector("link")?.textContent?.trim() || FALLBACK_SERMON.url;
    const pubDate = first.querySelector("pubDate")?.textContent?.trim() || "";
    const description = first.querySelector("description")?.textContent?.trim() || "";
    const date = pubDate
        ? new Date(pubDate).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
          })
        : "";
    // Strip HTML tags from description
    const div = document.createElement("div");
    div.innerHTML = description;
    const summary = div.textContent?.slice(0, 600) || "";
    return { title, date, summary, url: link, watchUrl: FALLBACK_SERMON.watchUrl };
}

function NewsTag({ label }) {
    return <span className="news-tag">{label}</span>;
}

function NewsCard({ title, date, summary, url, tag }) {
    return (
        <article className="news-card">
            {tag && <NewsTag label={tag} />}
            <h3 className="news-card-title">{title}</h3>
            {date && <p className="news-card-date">{date}</p>}
            <p className="news-card-summary">{summary}</p>
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="news-card-link"
            >
                Read more <FaExternalLinkAlt style={{ fontSize: "11px" }} />
            </a>
        </article>
    );
}

function News() {
    const [sermon, setSermon] = useState(null);
    const [sermonLoading, setSermonLoading] = useState(true);
    const [sermonLive, setSermonLive] = useState(false);

    useEffect(() => {
        fetchLatestSermon()
            .then((data) => {
                setSermon(data);
                setSermonLive(true);
            })
            .catch(() => {
                setSermon(FALLBACK_SERMON);
                setSermonLive(false);
            })
            .finally(() => setSermonLoading(false));
    }, []);

    return (
        <div className="news-page">
            {/* ── Page header ── */}
            <div className="page-header">
                <h1>
                    <FaNewspaper /> News &amp; Updates
                </h1>
                <p>
                    Latest Huzur sermon summaries, Ahmadiyya Nigeria updates and world
                    community news — all in one place.
                </p>
            </div>

            {/* ── Latest Huzur Sermon ── */}
            <section className="news-section">
                <h2 className="section-title">
                    <FaBookOpen /> Latest Friday Sermon — Huzur (aba)
                    {sermonLive && (
                        <span className="live-badge">LIVE</span>
                    )}
                </h2>

                {sermonLoading ? (
                    <div className="sermon-loading">
                        <FaSpinner className="loading-spinner" style={{ fontSize: "24px", color: "var(--green)" }} />
                        <p>Fetching latest sermon from alislam.org…</p>
                    </div>
                ) : (
                    <div className="sermon-card">
                        <div className="sermon-card-icon">
                            <FaMosque />
                        </div>
                        <div className="sermon-card-body">
                            <p className="sermon-delivered">
                                Delivered by{" "}
                                <strong>Hazrat Mirza Masroor Ahmad (aba)</strong>,
                                Khalifatul Masih V
                                {sermon.date && <> &nbsp;·&nbsp; {sermon.date}</>}
                            </p>
                            <h3 className="sermon-title">{sermon.title}</h3>
                            {sermon.summary && (
                                <p className="sermon-summary">{sermon.summary}</p>
                            )}
                            {!sermonLive && (
                                <p className="sermon-offline-note">
                                    ℹ️ Showing cached summary. Live feed temporarily
                                    unavailable.
                                </p>
                            )}
                            <div className="sermon-actions">
                                <a
                                    href={sermon.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-primary"
                                >
                                    <FaBookOpen /> Read Full Sermon
                                </a>
                                <a
                                    href={sermon.watchUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-outline"
                                >
                                    <FaYoutube /> Watch on MTA
                                </a>
                                <a
                                    href="https://www.alislam.org/friday-sermon/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-secondary"
                                >
                                    All Sermons Archive
                                </a>
                            </div>
                        </div>
                    </div>
                )}
            </section>

            {/* ── Ahmadiyya Nigeria News ── */}
            <section className="news-section">
                <div className="news-section-header">
                    <h2 className="section-title">
                        <FaNewspaper /> Ahmadiyya Nigeria
                    </h2>
                    <a
                        href="https://press.ahmadiyya.ng"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="news-section-link"
                    >
                        Visit press.ahmadiyya.ng <FaExternalLinkAlt style={{ fontSize: "11px" }} />
                    </a>
                </div>
                <div className="news-grid">
                    {NIGERIA_NEWS.map((item) => (
                        <NewsCard key={item.title} {...item} />
                    ))}
                </div>
            </section>

            {/* ── World Ahmadiyya News ── */}
            <section className="news-section">
                <div className="news-section-header">
                    <h2 className="section-title">
                        <FaGlobe /> World Ahmadiyya News
                    </h2>
                    <a
                        href="https://www.alislam.org"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="news-section-link"
                    >
                        Visit alislam.org <FaExternalLinkAlt style={{ fontSize: "11px" }} />
                    </a>
                </div>
                <div className="news-grid">
                    {WORLD_NEWS.map((item) => (
                        <NewsCard key={item.title} {...item} />
                    ))}
                </div>
            </section>

            {/* ── Official Social Channels ── */}
            <section className="news-section">
                <h2 className="section-title">
                    <FaGlobe /> Official Ahmadiyya Channels
                </h2>
                <div className="socials-grid">
                    {SOCIALS.map((s) => (
                        <a
                            key={s.url}
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="social-channel-card"
                        >
                            <span
                                className="social-channel-icon"
                                style={{ color: s.color }}
                            >
                                {s.icon}
                            </span>
                            <span className="social-channel-body">
                                <span className="social-channel-label">{s.label}</span>
                                <span className="social-channel-sub">{s.sub}</span>
                            </span>
                            <FaExternalLinkAlt className="social-channel-arrow" />
                        </a>
                    ))}
                </div>
            </section>
        </div>
    );
}

export default News;
