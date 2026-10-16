import { useCallback, useEffect, useRef, useState } from "react";
import { FaEdit, FaNewspaper, FaPlus, FaTrash } from "react-icons/fa";
import { NewsService } from "../Api/NewsService";

const EMPTY_FORM = { category: "Friday Sermon", title: "", displayDate: "", summary: "", url: "", tag: "", watchUrl: "" };
const CATEGORIES = ["Friday Sermon", "Nigeria", "World"];

function NewsAdmin() {
    const [items, setItems] = useState([]);
    const [form, setForm] = useState(EMPTY_FORM);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const formRef = useRef(null);

    const loadItems = useCallback(async () => {
        setError("");
        try {
            setItems(await NewsService.getAll());
        } catch (err) {
            setError(err.message || "Could not load news items.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadItems(); }, [loadItems]);

    const changeField = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

    const resetForm = () => {
        setForm(EMPTY_FORM);
        setEditingId(null);
    };

    const editItem = (item) => {
        setEditingId(item.id);
        setForm({
            category: item.category,
            title: item.title,
            displayDate: item.displayDate || "",
            summary: item.summary,
            url: item.url,
            tag: item.tag || "",
            watchUrl: item.watchUrl || "",
        });
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const submit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError("");
        const payload = {
            ...form,
            tag: form.tag.trim() || null,
            watchUrl: form.category === "Friday Sermon" ? (form.watchUrl.trim() || null) : null,
        };
        try {
            if (editingId) await NewsService.update(editingId, payload);
            else await NewsService.create(payload);
            resetForm();
            await loadItems();
        } catch (err) {
            setError(err.message || "The news item could not be saved.");
        } finally {
            setSaving(false);
        }
    };

    const deleteItem = async (item) => {
        if (!window.confirm(`Delete "${item.title}"?`)) return;
        setError("");
        try {
            await NewsService.remove(item.id);
            if (editingId === item.id) resetForm();
            await loadItems();
        } catch (err) {
            setError(err.message || "The news item could not be deleted.");
        }
    };

    const sortedItems = [...items].sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated));

    return (
        <div className="news-admin-page">
            <div className="page-header">
                <h1><FaNewspaper /> Manage News &amp; Updates</h1>
                <p>Write and manage Friday sermon summaries, Nigeria news, and world news.</p>
            </div>

            {error && <div className="news-admin-error" role="alert">{error}</div>}

            <section className="news-admin-form-card" ref={formRef}>
                <h2>{editingId ? <><FaEdit /> Edit post</> : <><FaPlus /> Create a post</>}</h2>
                <form onSubmit={submit} className="news-admin-form">
                    <label>Section
                        <select name="category" value={form.category} onChange={changeField}>
                            {CATEGORIES.map((category) => <option key={category}>{category}</option>)}
                        </select>
                    </label>
                    <label>Title
                        <input name="title" value={form.title} onChange={changeField} maxLength="250" required />
                    </label>
                    <label>Date shown on the page
                        <input name="displayDate" value={form.displayDate} onChange={changeField} maxLength="80" placeholder="e.g. 16 October 2026" required />
                    </label>
                    <label>Summary
                        <textarea name="summary" value={form.summary} onChange={changeField} maxLength="3000" rows="5" required />
                    </label>
                    <label>{form.category === "Friday Sermon" ? "Full sermon link" : "Read more link"}
                        <input type="url" name="url" value={form.url} onChange={changeField} placeholder="https://..." maxLength="1000" required />
                    </label>
                    {form.category === "Friday Sermon" ? (
                        <label>Watch on MTA link (optional)
                            <input type="url" name="watchUrl" value={form.watchUrl} onChange={changeField} placeholder="https://..." maxLength="1000" />
                        </label>
                    ) : (
                        <label>Tag (optional)
                            <input name="tag" value={form.tag} onChange={changeField} maxLength="100" placeholder="e.g. Community, Education, Global" />
                        </label>
                    )}
                    <div className="news-admin-form-actions">
                        <button className="btn-primary" type="submit" disabled={saving}>{saving ? "Saving..." : editingId ? "Save changes" : "Publish post"}</button>
                        {editingId && <button className="btn-secondary" type="button" onClick={resetForm} disabled={saving}>Cancel edit</button>}
                    </div>
                </form>
            </section>

            <section className="news-admin-list">
                <h2>Existing posts</h2>
                {loading ? <p>Loading posts...</p> : sortedItems.length === 0 ? <p>No posts yet.</p> : sortedItems.map((item) => (
                    <article className="news-admin-row" key={item.id}>
                        <div>
                            <span className="news-admin-category">{item.category}{item.tag ? ` | ${item.tag}` : ""}</span>
                            <h3>{item.title}</h3>
                            <p>{item.displayDate}{item.summary ? ` | ${item.summary}` : ""}</p>
                        </div>
                        <div className="news-admin-row-actions">
                            <button type="button" className="btn-outline" onClick={() => editItem(item)}><FaEdit /> Edit</button>
                            <button type="button" className="btn-danger" onClick={() => deleteItem(item)}><FaTrash /> Delete</button>
                        </div>
                    </article>
                ))}
            </section>
        </div>
    );
}

export default NewsAdmin;
