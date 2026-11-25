import { useEffect, useMemo, useState } from "react";

const API = import.meta.env.VITE_API_URL|| "http://127.0.0.1:8000";
const OPTIONS = {
  gender: ["Male", "Female", "Other"],
  ward: ["General", "ICU", "Emergency", "Pediatrics", "Maternity"],
  department: ["Cardiology", "Neurology", "Orthopedics", "Pediatrics", "General Medicine"],
  doctor: ["Dr. Sharma", "Dr. Patel", "Dr. Rao", "Dr. Singh", "Dr. Kumar"],
};
const emptyForm = () => ({
  name: "", age: "", gender: "", ward: "", department: "", doctor: "",
  admission_date: new Date().toISOString().slice(0, 10), status: "Admitted",
});

async function request(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = data.detail;
    const message = Array.isArray(detail) ? detail.map(x => x.msg).join(" ") : (detail || "Request failed.");
    throw new Error(message);
  }
  return data;
}

export default function App() {
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState(emptyForm());
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ ward: "", department: "", doctor: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    Object.entries(filters).forEach(([key, value]) => value && params.set(key, value));
    return params.toString();
  }, [search, filters]);

  async function loadPatients() {
    try {
      setLoading(true);
      setPatients(await request(`/api/patients${query ? `?${query}` : ""}`));
      setError("");
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadPatients(); }, [query]);

  function change(key, value) { setForm(current => ({ ...current, [key]: value })); }

  function validate() {
    if (!form.name.trim()) return "Name is required.";
    if (!/^[A-Za-z ]+$/.test(form.name.trim())) return "Name must contain letters only.";
    if (form.age === "" || !Number.isInteger(Number(form.age)) || Number(form.age) < 0 || Number(form.age) > 120) return "Age must be a number between 0 and 120.";
    for (const key of ["gender", "ward", "department", "doctor"]) if (!form[key]) return `Please select ${key}.`;
    if (!form.admission_date) return "Admission date is required.";
    if (form.admission_date > new Date().toISOString().slice(0, 10)) return "Admission date cannot be in the future.";
    return "";
  }

  async function submit(e) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    const payload = { ...form, name: form.name.trim(), age: Number(form.age) };
    try {
      setError("");
      await request(editingId ? `/api/patients/${editingId}` : "/api/patients", {
        method: editingId ? "PUT" : "POST", body: JSON.stringify(payload),
      });
      resetForm();
      await loadPatients();
    } catch (e) { setError(e.message); }
  }

  function resetForm() { setForm(emptyForm()); setEditingId(null); }

  function edit(patient) {
    setEditingId(patient.id);
    setForm({ ...patient, age: String(patient.age) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function remove(patient) {
    if (!window.confirm(`Delete ${patient.name}? This action cannot be undone.`)) return;
    try { await request(`/api/patients/${patient.id}`, { method: "DELETE" }); await loadPatients(); }
    catch (e) { setError(e.message); }
  }

  async function discharge(patient) {
    if (!window.confirm(`Mark ${patient.name} as discharged?`)) return;
    try { await request(`/api/patients/${patient.id}/discharge`, { method: "PATCH" }); await loadPatients(); }
    catch (e) { setError(e.message); }
  }

  return <main className="shell">
    <header className="topbar">
      <div className="brand"><div className="brand-icon">+</div><div><strong>CareTrack</strong><span>Patient admission management</span></div></div>
      <div className="live"><i /> Hospital workspace</div>
    </header>

    <section className="intro">
      <div><p className="eyebrow">HOSPITAL OPERATIONS</p><h1>Patient management</h1><p className="sub">Keep admissions organized and patient information up to date.</p></div>
      <div className="total"><span>Total matching patients</span><strong>{patients.length}</strong></div>
    </section>

    {error && <div className="alert" role="alert"><span>{error}</span><button onClick={() => setError("")}>×</button></div>}

    <section className="panel form-panel">
      <div className="panel-heading"><div><p className="eyebrow">{editingId ? "UPDATE RECORD" : "NEW RECORD"}</p><h2>{editingId ? "Edit patient" : "Add a patient"}</h2></div>{editingId && <button className="btn ghost" onClick={resetForm}>Cancel edit</button>}</div>
      <form onSubmit={submit}>
        <div className="form-grid">
          <label className="wide">Patient name<input value={form.name} onChange={e => change("name", e.target.value)} placeholder="Enter full name" /></label>
          <label>Age<input type="number" min="0" max="120" value={form.age} onChange={e => change("age", e.target.value)} placeholder="Age" /></label>
          <label>Gender<select value={form.gender} onChange={e => change("gender", e.target.value)}><option value="">Select gender</option>{OPTIONS.gender.map(x => <option key={x}>{x}</option>)}</select></label>
          <label>Ward<select value={form.ward} onChange={e => change("ward", e.target.value)}><option value="">Select ward</option>{OPTIONS.ward.map(x => <option key={x}>{x}</option>)}</select></label>
          <label>Department<select value={form.department} onChange={e => change("department", e.target.value)}><option value="">Select department</option>{OPTIONS.department.map(x => <option key={x}>{x}</option>)}</select></label>
          <label>Doctor<select value={form.doctor} onChange={e => change("doctor", e.target.value)}><option value="">Select doctor</option>{OPTIONS.doctor.map(x => <option key={x}>{x}</option>)}</select></label>
          <label>Admission date<input type="date" max={new Date().toISOString().slice(0, 10)} value={form.admission_date} onChange={e => change("admission_date", e.target.value)} /></label>
          <label>Status<select value={form.status} onChange={e => change("status", e.target.value)}><option>Admitted</option><option>Discharged</option></select></label>
        </div>
        <div className="form-actions"><button className="btn primary" type="submit">{editingId ? "Save changes" : "Add patient"}</button><button className="btn ghost" type="button" onClick={resetForm}>Clear form</button></div>
      </form>
    </section>

    <section className="panel list-panel">
      <div className="panel-heading list-heading"><div><p className="eyebrow">PATIENT DIRECTORY</p><h2>All patients</h2></div><span className="count">{patients.length} records</span></div>
      <div className="filters">
        <div className="search-wrap"><span>⌕</span><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by patient name..." /></div>
        {["ward", "department", "doctor"].map(key => <select key={key} aria-label={`Filter by ${key}`} value={filters[key]} onChange={e => setFilters(f => ({ ...f, [key]: e.target.value }))}><option value="">All {key}s</option>{OPTIONS[key].map(x => <option key={x}>{x}</option>)}</select>)}
        <button className="btn ghost reset" onClick={() => { setSearch(""); setFilters({ ward: "", department: "", doctor: "" }); }}>Reset</button>
      </div>
      <div className="table-wrap">
        <table><thead><tr><th>Patient</th><th>Age / Gender</th><th>Ward</th><th>Department</th><th>Doctor</th><th>Admitted</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>{patients.map(p => <tr key={p.id}>
            <td><strong>{p.name}</strong><small>Patient #{String(p.id).padStart(4, "0")}</small></td>
            <td>{p.age} / {p.gender}</td><td>{p.ward}</td><td>{p.department}</td><td>{p.doctor}</td><td>{p.admission_date}</td>
            <td><span className={`status ${p.status.toLowerCase()}`}>{p.status}</span></td>
            <td><div className="actions"><button title="Edit patient" onClick={() => edit(p)}>Edit</button>{p.status === "Admitted" && <button title="Mark as discharged" onClick={() => discharge(p)}>Discharge</button>}<button className="danger" title="Delete patient" onClick={() => remove(p)}>Delete</button></div></td>
          </tr>)}
          {!patients.length && <tr><td colSpan="8" className="empty">{loading ? "Loading patients..." : "No patients found. Add a patient or change your filters."}</td></tr>}
          </tbody></table>
      </div>
      <p className="table-note">Patient records are stored in the backend database.</p>
    </section>
    <footer>CareTrack · Patient Admission Management</footer>
  </main>;
}
