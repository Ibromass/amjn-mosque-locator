import { useEffect, useMemo, useState } from "react";
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
import { NewsService } from "../Api/NewsService";

const SOCIALS = [
    { label: "alislam.org", sub: "Official Ahmadiyya website", icon: <FaGlobe />, url: "https://www.alislam.org", color: "#16a34a" },
    { label: "MTA International", sub: "Watch live - mta.tv", icon: <FaYoutube />, url: "https://www.youtube.com/@mtaOnline1", color: "#dc2626" },
    { label: "@alislam", sub: "Official Ahmadiyya on X", icon: <FaXTwitter />, url: "https://x.com/alislam", color: "#111827" },
    { label: "Ahmadiyya Nigeria", sub: "Facebook - @ahmadiyyang", icon: <FaFacebook />, url: "https://www.facebook.com/ahmadiyyang/", color: "#1877f2" },
    { label: "@mta_international", sub: "MTA on Instagram", icon: <FaInstagram />, url: "https://www.instagram.com/mta_international/", color: "#c13584" },
    { label: "@JamatMuslim", sub: "AMJN Nigeria on X", icon: <FaXTwitter />, url: "https://x.com/jamatmuslim", color: "#111827" },
    { label: "ahmadiyya.ng", sub: "Nigeria official site", icon: <FaGlobe />, url: "https://ahmadiyya.ng", color: "#16a34a" },
    { label: "Press AMJN Nigeria", sub: "press.ahmadiyya.ng", icon: <FaNewspaper />, url: "https://press.ahmadiyya.ng", color: "#0369a1" },
];

function NewsTag({ label }) {
    return label ? <span className="news-tag">{label}</span> : null;
}

function NewsCard({ item }) {
    return (
        <article className="news-card">
            <NewsTag label={item.tag} />
            <h3 className="news-card-title">{item.title}</h3>
            {item.displayDate && <p className="news-card-date">{item.displayDate}</p>}
            <p className="news-card-summary">{item.summary}</p>
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="news-card-link">
                Read more <FaExternalLinkAlt style={{ fontSize: "11px" }} />
            </a>
        </article>
    );
}

function News() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        NewsService.getAll()
            .then(setItems)
            .catch((err) => setError(err.message || "News could not be loaded."))
            .finally(() => setLoading(false));
    }, []);

    const byCategory = useMemo(() => {
        const sorted = [...items].sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated));
        return {
            sermon: sorted.find((item) => item.category === "Friday Sermon"),
            nigeria: sorted.filter((item) => item.category === "Nigeria"),
            world: sorted.filter((item) => item.category === "World"),
        };
    }, [items]);

    return (
        <div className="news-page">
            <div className="page-header">
                <h1><FaNewspaper /> News &amp; Updates</h1>
                <p>Friday sermons, Ahmadiyya Nigeria updates and world community news - all in one place.</p>
            </div>

            {error && <div className="news-load-error" role="alert">{error}</div>}
            {loading && <div className="sermon-loading"><FaSpinner className="loading-spinner" /> <p>Loading news...</p></div>}

            {!loading && (
                <>
                    <section className="news-section">
                        <h2 className="section-title"><FaBookOpen /> Latest Friday Sermon - Huzur (aba)</h2>
                        {byCategory.sermon ? (
                            <div className="sermon-card">
                                <div className="sermon-card-icon"><FaMosque /></div>
                                <div className="sermon-card-body">
                                    <p className="sermon-delivered">
                                        Delivered by <strong>Hazrat Mirza Masroor Ahmad (aba)</strong>, Khalifatul Masih V
                                        {byCategory.sermon.displayDate && <> &nbsp;|&nbsp; {byCategory.sermon.displayDate}</>}
                                    </p>
                                    <h3 className="sermon-title">{byCategory.sermon.title}</h3>
                                    <p className="sermon-summary">{byCategory.sermon.summary}</p>
                                    <div className="sermon-actions">
                                        <a href={byCategory.sermon.url} target="_blank" rel="noopener noreferrer" className="btn-primary"><FaBookOpen /> Read Full Sermon</a>
                                        {byCategory.sermon.watchUrl && <a href={byCategory.sermon.watchUrl} target="_blank" rel="noopener noreferrer" className="btn-outline"><FaYoutube /> Watch on MTA</a>}
                                        <a href="https://www.alislam.org/friday-sermon/" target="_blank" rel="noopener noreferrer" className="btn-secondary">All Sermons Archive</a>
                                    </div>
                                </div>
                            </div>
                        ) : <p className="news-empty">No Friday sermon summary has been posted yet.</p>}
                    </section>

                    <section className="news-section">
                        <div className="news-section-header">
                            <h2 className="section-title"><FaNewspaper /> Ahmadiyya Nigeria</h2>
                            <a href="https://press.ahmadiyya.ng" target="_blank" rel="noopener noreferrer" className="news-section-link">Visit press.ahmadiyya.ng <FaExternalLinkAlt /></a>
                        </div>
                        {byCategory.nigeria.length ? <div className="news-grid">{byCategory.nigeria.map((item) => <NewsCard key={item.id} item={item} />)}</div> : <p className="news-empty">No Nigeria news has been posted yet.</p>}
                    </section>

                    <section className="news-section">
                        <div className="news-section-header">
                            <h2 className="section-title"><FaGlobe /> World Ahmadiyya News</h2>
                            <a href="https://www.alislam.org" target="_blank" rel="noopener noreferrer" className="news-section-link">Visit alislam.org <FaExternalLinkAlt /></a>
                        </div>
                        {byCategory.world.length ? <div className="news-grid">{byCategory.world.map((item) => <NewsCard key={item.id} item={item} />)}</div> : <p className="news-empty">No world news has been posted yet.</p>}
                    </section>

                    <section className="news-section">
                        <h2 className="section-title"><FaGlobe /> Official Ahmadiyya Channels</h2>
                        <div className="socials-grid">
                            {SOCIALS.map((social) => (
                                <a key={social.url} href={social.url} target="_blank" rel="noopener noreferrer" className="social-channel-card">
                                    <span className="social-channel-icon" style={{ color: social.color }}>{social.icon}</span>
                                    <span className="social-channel-body"><span className="social-channel-label">{social.label}</span><span className="social-channel-sub">{social.sub}</span></span>
                                    <FaExternalLinkAlt className="social-channel-arrow" />
                                </a>
                            ))}
                        </div>
                    </section>
                </>
            )}
        </div>
    );
}

export default News;
