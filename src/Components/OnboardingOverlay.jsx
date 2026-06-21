import { useState, useEffect } from "react";
import { FaMosque } from "react-icons/fa";

const STORAGE_KEY = "amjn_onboarded_v1";

/* Official AMJN logo — white image on green, with mosque icon fallback */
function AhmadiyyaLogoImg() {
    const [err, setErr] = useState(false);
    if (err) {
        return <FaMosque style={{ color: "#fff", fontSize: 48 }} />;
    }
    return (
        <img
            src="https://ahmadiyya.ng/wp-content/uploads/2020/04/amjnlogowhite-01-mobile.png"
            alt="Ahmadiyya Muslim Jama'at Nigeria"
            className="onb-logo-img"
            onError={() => setErr(true)}
        />
    );
}

const FEATURES = [
    {
        emoji: "🕌",
        emojiLabel: "mosque",
        title: "Find Your Nearest Mosque",
        body: "We detect your location and instantly show the nearest Ahmadiyya mosque — from our Nigeria database and Google Maps.",
        highlight: "Works anywhere in Nigeria",
        color: "#dcfce7",
        iconColor: "#16a34a",
    },
    {
        emoji: "🗺️",
        emojiLabel: "map",
        title: "Interactive Map View",
        body: "Browse every Ahmadiyya mosque on a live map, search by name or state, and get one-tap directions — fast.",
        highlight: "100% Ahmadiyya-specific search",
        color: "#dbeafe",
        iconColor: "#1d4ed8",
    },
    {
        emoji: "📰",
        emojiLabel: "news",
        title: "News & Updates",
        body: "Read live Friday sermon summaries by Hazrat Mirza Masroor Ahmad (aba) plus Nigeria and world Ahmadiyya news.",
        highlight: "Live feed from alislam.org",
        color: "#fef9c3",
        iconColor: "#a16207",
    },
];

function OnboardingOverlay() {
    const [visible, setVisible] = useState(false);
    const [step, setStep] = useState(0);   // 0 = welcome, 1/2/3 = features
    const [exiting, setExiting] = useState(false);
    const [animKey, setAnimKey] = useState(0);

    useEffect(() => {
        if (!localStorage.getItem(STORAGE_KEY)) {
            const t = setTimeout(() => setVisible(true), 250);
            return () => clearTimeout(t);
        }
    }, []);

    const totalSteps = 1 + FEATURES.length; // 4
    const isLast = step === totalSteps - 1;

    const dismiss = () => {
        setExiting(true);
        localStorage.setItem(STORAGE_KEY, "1");
        setTimeout(() => setVisible(false), 400);
    };

    const next = () => {
        if (isLast) { dismiss(); return; }
        setAnimKey((k) => k + 1);
        setStep((s) => s + 1);
    };

    const prev = () => {
        if (step === 0) return;
        setAnimKey((k) => k + 1);
        setStep((s) => s - 1);
    };

    const jumpTo = (i) => {
        if (i === step) return;
        setAnimKey((k) => k + 1);
        setStep(i);
    };

    if (!visible) return null;

    const feature = step > 0 ? FEATURES[step - 1] : null;

    return (
        <div className={`onb-overlay${exiting ? " onb-overlay--exit" : ""}`}
            role="dialog" aria-modal="true" aria-label="Welcome">
            <div className={`onb-card${exiting ? " onb-card--exit" : ""}`}>

                {/* WELCOME SLIDE */}
                {step === 0 && (
                    <div className="onb-welcome-slide" key="welcome">
                        {/* Green header */}
                        <div className="onb-header">
                            <div className="onb-logo-circle">
                                <AhmadiyyaLogoImg />
                            </div>
                            <h1 className="onb-app-name">AMJN Mosque Locator</h1>
                            <p className="onb-org-name">Ahmadiyya Muslim Jama&lsquo;at Nigeria</p>
                        </div>

                        {/* White body */}
                        <div className="onb-welcome-body">
                            <p className="onb-welcome-desc">
                                Your complete guide to finding Ahmadiyya mosques across Nigeria —
                                quickly, accurately, and with ease.
                            </p>
                            <p className="onb-tagline">&ldquo;Love for All, Hatred for None&rdquo;</p>
                        </div>
                    </div>
                )}

                {/* FEATURE SLIDES */}
                {step > 0 && feature && (
                    <div className="onb-feature-slide" key={`feature-${step}`} style={{ "--feat-color": feature.color, "--feat-icon": feature.iconColor }}>
                        {/* Skip */}
                        {!isLast && (
                            <button className="onb-skip" onClick={dismiss}>Skip</button>
                        )}

                        <div
                            className="onb-emoji-box"
                            style={{ background: feature.color }}
                        >
                            <span className="onb-emoji" role="img" aria-label={feature.emojiLabel}>
                                {feature.emoji}
                            </span>
                        </div>

                        <h2 className="onb-feat-title">{feature.title}</h2>
                        <p className="onb-feat-body">{feature.body}</p>

                        <div className="onb-feat-highlight" style={{ background: feature.color, color: feature.iconColor }}>
                            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" style={{ flexShrink: 0 }}>
                                <circle cx="8" cy="8" r="8" fill={feature.iconColor} />
                                <path d="M4.5 8l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.8"
                                    strokeLinecap="round" strokeLinejoin="round" fill="none" />
                            </svg>
                            {feature.highlight}
                        </div>
                    </div>
                )}

                {/* DOT INDICATORS */}
                <div className="onb-dots">
                    {Array.from({ length: totalSteps }).map((_, i) => (
                        <button
                            key={i}
                            className={`onb-dot${i === step ? " onb-dot--active" : ""}`}
                            onClick={() => jumpTo(i)}
                            aria-label={`Go to step ${i + 1}`}
                        />
                    ))}
                </div>

                {/* NAVIGATION */}
                <div className="onb-nav">
                    {step > 0 ? (
                        <button className="onb-btn-prev" onClick={prev}>← Back</button>
                    ) : (
                        <span />
                    )}
                    <button
                        className={`onb-btn-next${isLast ? " onb-btn-get-started" : ""}`}
                        onClick={next}
                    >
                        {isLast ? "Get Started 🙌" : "Next →"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default OnboardingOverlay;
