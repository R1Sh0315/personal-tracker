import { useEffect, useState } from 'react';

const defaultForm = {
  title: '',
  category: 'general',
  amount: 0,
  type: 'expense',
  notes: '',
};

function App() {
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/entries');
      const data = await response.json();
      setEntries(data);
    } catch (err) {
      setError('Unable to load entries.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error('Create failed');
      }

      const newEntry = await response.json();
      setEntries((prev) => [newEntry, ...prev]);
      setForm(defaultForm);
    } catch (err) {
      setError('Unable to create entry.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`/api/entries/${id}`, { method: 'DELETE' });
      setEntries((prev) => prev.filter((entry) => entry._id !== id));
    } catch {
      setError('Unable to delete entry.');
    }
  };

  return (
    <div className="app-shell">
      <header>
        <h1>Personal Tracker</h1>
        <p>Track income, expenses, and health metrics with a simple dashboard.</p>
      </header>

      <main>
        <section className="panel form-panel">
          <h2>Add new entry</h2>
          <form onSubmit={handleSubmit}>
            <label>
              Title
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </label>

            <label>
              Category
              <input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </label>

            <label>
              Amount
              <input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
              />
            </label>

            <label>
              Type
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
                <option value="health">Health</option>
                <option value="other">Other</option>
              </select>
            </label>

            <label>
              Notes
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </label>

            <button type="submit">Save entry</button>
          </form>
          {error && <p className="error-message">{error}</p>}
        </section>

        <section className="panel list-panel">
          <div className="panel-header">
            <h2>Entries</h2>
            {loading && <span>Loading…</span>}
          </div>

          {entries.length === 0 && !loading ? (
            <p className="empty-state">No entries yet. Add one to get started.</p>
          ) : (
            <ul className="entry-list">
              {entries.map((entry) => (
                <li key={entry._id} className="entry-item">
                  <div>
                    <strong>{entry.title}</strong>
                    <p>{entry.category} · {entry.type} · ${entry.amount}</p>
                    <p className="notes">{entry.notes}</p>
                  </div>
                  <button onClick={() => handleDelete(entry._id)}>Delete</button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
