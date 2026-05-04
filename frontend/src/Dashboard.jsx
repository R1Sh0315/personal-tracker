import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, subDays, subWeeks, subMonths, subYears, isAfter, getWeek, addDays, isSameDay } from 'date-fns';

const defaultForm = {
  title: '',
  category: 'general',
  amount: 0,
  type: 'expense',
  notes: '',
  date: new Date().toISOString().split('T')[0],
};

function Dashboard() {
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editEntryId, setEditEntryId] = useState(null);
  const [editForm, setEditForm] = useState(defaultForm);
  const [timeFilter, setTimeFilter] = useState('1m');
  const [collapsedDates, setCollapsedDates] = useState({});
  const [activeTab, setActiveTab] = useState('habits'); // Default to habits
  const [habits, setHabits] = useState([]);
  const [collapsedHabits, setCollapsedHabits] = useState({}); // To track expanded/collapsed subtasks
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [habitForm, setHabitForm] = useState({ title: '', hasSubtasks: false, subtasks: [{ title: '' }] });
  const habitScrollRef = React.useRef(null);
  const navigate = useNavigate();

  const slugify = (text) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove non-word characters (emojis, etc)
      .replace(/[\s_-]+/g, '-') // Replace spaces/underscores with -
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing -
  };

  const toggleDate = (dateString, isCurrentlyCollapsed) => {
    setCollapsedDates(prev => ({
      ...prev,
      [dateString]: !isCurrentlyCollapsed
    }));
  };

  const handleEdit = (entry) => {
    setEditEntryId(entry._id);
    setEditForm({
      title: entry.title,
      category: entry.category,
      amount: entry.amount,
      type: entry.type,
      notes: entry.notes || '',
      date: new Date(entry.date).toISOString().split('T')[0],
    });
  };

  const handleCancelEdit = () => {
    setEditEntryId(null);
    setEditForm(defaultForm);
  };

  const handleSaveEdit = async (id) => {
    try {
      const response = await fetch(`/api/entries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        throw new Error('Update failed');
      }

      const updatedEntry = await response.json();
      setEntries((prev) => prev.map((entry) => (entry._id === id ? updatedEntry : entry)));
      setEditEntryId(null);
    } catch (err) {
      setError('Unable to update entry.');
    }
  };

  useEffect(() => {
    fetchEntries();
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    try {
      const response = await fetch('/api/habits');
      const data = await response.json();
      setHabits(data);
    } catch (err) {
      console.error('Failed to fetch habits');
    }
  };

  const handleHabitSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(habitForm),
      });
      if (response.ok) {
        const newHabit = await response.json();
        setHabits([...habits, newHabit]);
        setIsHabitModalOpen(false);
        setHabitForm({ title: '', hasSubtasks: false, subtasks: [{ title: '' }] });
      }
    } catch (err) {
      console.error('Failed to create habit');
    }
  };

  const toggleHabitCompletion = async (habitId, date, subtaskIndex) => {
    try {
      const response = await fetch(`/api/habits/${habitId}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, subtaskIndex }),
      });
      if (response.ok) {
        const updatedHabit = await response.json();
        setHabits(habits.map(h => h._id === habitId ? updatedHabit : h));
      }
    } catch (err) {
      console.error('Failed to toggle completion');
    }
  };

  const addSubtaskInput = () => {
    setHabitForm({ ...habitForm, subtasks: [...habitForm.subtasks, { title: '' }] });
  };

  const removeSubtaskInput = (index) => {
    const newSubtasks = habitForm.subtasks.filter((_, i) => i !== index);
    setHabitForm({ ...habitForm, subtasks: newSubtasks });
  };

  const handleSubtaskInputChange = (index, value) => {
    const newSubtasks = habitForm.subtasks.map((st, i) => i === index ? { ...st, title: value } : st);
    setHabitForm({ ...habitForm, subtasks: newSubtasks });
  };

  const deleteHabit = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await fetch(`/api/habits/${id}`, { method: 'DELETE' });
      setHabits(habits.filter(h => h._id !== id));
    } catch (err) {
      console.error('Failed to delete habit');
    }
  };

  const toggleHabitGroup = (habitId) => {
    setCollapsedHabits(prev => ({
      ...prev,
      [habitId]: !prev[habitId]
    }));
  };

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
      setIsModalOpen(false);
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

  const handleLogout = () => {
    navigate('/signin');
  };

  const getFilteredData = () => {
    const now = new Date();
    let cutoffDate;

    switch (timeFilter) {
      case '1d': cutoffDate = subDays(now, 1); break;
      case '1w': cutoffDate = subWeeks(now, 1); break;
      case '1m': cutoffDate = subMonths(now, 1); break;
      case '1y': cutoffDate = subYears(now, 1); break;
      default: cutoffDate = new Date(0); // all time
    }

    const filtered = entries.filter(e => isAfter(new Date(e.date), cutoffDate));

    // Sort entries chronologically to calculate running balance
    const sortedEntries = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date));

    let runningBalance = 0;
    const allGrouped = sortedEntries.reduce((acc, entry) => {
      const dayKey = format(new Date(entry.date), 'yyyy-MM-dd');
      if (!acc[dayKey]) {
        acc[dayKey] = { date: new Date(entry.date), expense: 0, invest: 0, income: 0, balance: 0 };
      }

      if (entry.type === 'income') runningBalance += entry.amount;
      else runningBalance -= entry.amount; // expense and investment subtract from liquid balance

      if (entry.type === 'expense') acc[dayKey].expense += entry.amount;
      else if (entry.type === 'investment') acc[dayKey].invest += entry.amount;
      else if (entry.type === 'income') acc[dayKey].income += entry.amount;

      acc[dayKey].balance = runningBalance;
      return acc;
    }, {});

    const results = Object.values(allGrouped)
      .filter(group => isAfter(group.date, cutoffDate))
      .map(group => {
        let dateFormat = 'MMM dd';
        if (timeFilter === '1y' || timeFilter === 'all') dateFormat = 'MMM yyyy';
        return {
          ...group,
          name: format(group.date, dateFormat)
        };
      });

    return results;
  };

  const chartData = getFilteredData();

  const renderTableRows = () => {
    let lastDate = null;
    let firstDate = null;
    const rows = [];

    if (entries.length > 0) {
      firstDate = format(new Date(entries[0].date), 'MMMM dd, yyyy');
    }

    entries.forEach((entry, index) => {
      const currentDate = format(new Date(entry.date), 'MMMM dd, yyyy');
      const nextEntry = entries[index + 1];
      const isLastInGroup = !nextEntry || format(new Date(nextEntry.date), 'MMMM dd, yyyy') !== currentDate;

      const isCollapsed = collapsedDates[currentDate] === undefined
        ? currentDate !== firstDate
        : collapsedDates[currentDate];

      if (currentDate !== lastDate) {
        rows.push(
          <tr
            key={`header-${currentDate}`}
            className="date-group-header"
            onClick={() => toggleDate(currentDate, isCollapsed)}
            style={{ cursor: 'pointer' }}
          >
            <td className="tree-cell" style={{ width: '40px', padding: '0', position: 'relative' }}>
              <div className="toggle-btn-circle">{isCollapsed ? '+' : '-'}</div>
              {!isCollapsed && <div className="tree-line-vertical" style={{ top: '50%' }}></div>}
            </td>
            <td colSpan="7" style={{ background: 'transparent', fontWeight: 'bold', padding: '12px', color: '#334155' }}>
              {currentDate}
            </td>
          </tr>
        );
        lastDate = currentDate;
      }

      if (!isCollapsed) {
        rows.push(
          <tr key={entry._id} className="entry-row">
            <td className="tree-cell" style={{ width: '40px', padding: '0', position: 'relative' }}>
              <div className={`tree-line-vertical ${isLastInGroup ? 'last-item' : ''}`}></div>
              <div className="tree-line-branch"></div>
            </td>
            {editEntryId === entry._id ? (
              <>
                <td><input type="date" value={editForm.date} onChange={(e) => setEditForm({ ...editForm, date: e.target.value })} /></td>
                <td><input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} /></td>
                <td><input value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} /></td>
                <td>
                  <select value={editForm.type} onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}>
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                    <option value="investment">Investment</option>
                    <option value="health">Health</option>
                    <option value="other">Other</option>
                  </select>
                </td>
                <td><input type="number" value={editForm.amount} onChange={(e) => setEditForm({ ...editForm, amount: Number(e.target.value) })} /></td>
                <td><input value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} /></td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-small" onClick={() => handleSaveEdit(entry._id)}>Save</button>
                    <button className="btn-small btn-secondary" onClick={handleCancelEdit}>Cancel</button>
                  </div>
                </td>
              </>
            ) : (
              <>
                <td style={{ whiteSpace: 'nowrap', color: '#64748b', fontSize: '0.85rem' }}>{format(new Date(entry.date), 'MM/dd/yyyy')}</td>
                <td><strong>{entry.title}</strong></td>
                <td>{entry.category}</td>
                <td style={{ textTransform: 'capitalize' }}>{entry.type}</td>
                <td>
                  <span
                    style={{
                      color: entry.type === 'expense' ? '#dc2626' : (entry.type === 'income' || entry.type === 'investment' ? '#16a34a' : 'inherit'),
                      fontWeight: 'bold'
                    }}
                  >
                    {entry.type === 'expense' ? '-' : (entry.type === 'income' || entry.type === 'investment' ? '+' : '')}₹{entry.amount}
                  </span>
                </td>
                <td className="notes" style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{entry.notes}</td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-small" onClick={() => handleEdit(entry)}>Edit</button>
                    <button className="btn-small btn-danger" onClick={() => handleDelete(entry._id)}>Delete</button>
                  </div>
                </td>
              </>
            )}
          </tr>
        );
      }
    });
    return rows;
  };

  const totalBalance = entries.reduce((acc, entry) => {
    if (entry.type === 'income') return acc + entry.amount;
    return acc - entry.amount;
  }, 0);

  const visibleDays = Array.from({ length: 30 }, (_, i) => {
    const d = addDays(subDays(new Date(), 15), i);
    return {
      date: d,
      dateStr: format(d, 'yyyy-MM-dd'),
      label: format(d, 'EEE'),
      dayNum: format(d, 'd'),
      weekNum: getWeek(d),
      isToday: isSameDay(d, new Date())
    };
  });

  // Scroll to today on mount or when habits tab becomes active
  useEffect(() => {
    if (activeTab === 'habits' && habitScrollRef.current) {
      const todayEl = habitScrollRef.current.querySelector('.today-col');
      if (todayEl) {
        todayEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [activeTab]);

  // Group days by week for header
  const weeks = visibleDays.reduce((acc, day) => {
    const lastWeek = acc[acc.length - 1];
    if (!lastWeek || lastWeek.weekNum !== day.weekNum) {
      acc.push({ weekNum: day.weekNum, days: [day] });
    } else {
      lastWeek.days.push(day);
    }
    return acc;
  }, []);

  const completionData = visibleDays.map(day => {
    let total = 0;
    let done = 0;
    habits.forEach(h => {
      if (h.hasSubtasks) {
        total += h.subtasks.length;
        done += (h.completions[day.dateStr] || []).length;
      } else {
        total += 1;
        if ((h.completions[day.dateStr] || []).includes(-1)) done += 1;
      }
    });
    return {
      name: day.dayNum,
      percentage: total > 0 ? Math.round((done / total) * 100) : 0,
      fullDate: day.dateStr
    };
  });

  return (
    <div className="app-shell">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1>Personal Dashboard</h1>
          <nav className="main-nav">
            <button className={`nav-link ${activeTab === 'habits' ? 'active' : ''}`} onClick={() => setActiveTab('habits')}>Habits</button>
            <button className={`nav-link ${activeTab === 'finance' ? 'active' : ''}`} onClick={() => setActiveTab('finance')}>Finance</button>
            <button className={`nav-link ${activeTab === 'journal' ? 'active' : ''}`} onClick={() => setActiveTab('journal')}>Journal</button>
          </nav>
        </div>
        <div style={{ textAlign: 'right' }}>
          {activeTab === 'finance' && (
            <p style={{ margin: '0 0 8px' }}>Balance: <span style={{ fontWeight: 'bold', color: totalBalance >= 0 ? '#16a34a' : '#dc2626' }}>₹{totalBalance.toLocaleString()}</span></p>
          )}
          <button className="btn-secondary btn-small" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <main>
        {activeTab === 'habits' && (
          <section className="panel" style={{ display: 'grid', gridTemplateColumns:'1fr' }}>
            <div className="panel-header" style={{ marginBottom: '24px' }}>
              <div>
                <h2>Weekly Habits</h2>
                <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.9rem' }}>Track your daily progress</p>
              </div>
              <button onClick={() => setIsHabitModalOpen(true)}>Add Habit</button>
            </div>

            <div className="habit-scroll-container" ref={habitScrollRef}>
              <table className="habit-grid">
                <thead>
                  <tr className="week-header-row">
                    <th className="sticky-col header-cell">Habit</th>
                    {weeks.map(week => (
                      <th
                        key={week.weekNum}
                        colSpan={week.days.length}
                        style={{ textAlign: 'center', borderBottom: '2px solid #e2e8f0', padding: '8px 0', backgroundColor: '#f8fafc', color: '#64748b', fontSize: '0.8rem' }}
                      >
                        Week {week.weekNum}
                      </th>
                    ))}
                  </tr>
                  <tr>
                    <th className="sticky-col header-cell"></th>
                    {visibleDays.map(day => (
                      <th key={day.dateStr} className={`day-header-cell ${day.isToday ? 'today-col' : ''}`}>
                        <div className="day-label">{day.label}</div>
                        <div className="day-number">{day.dayNum}</div>
                        {day.isToday && <div className="today-indicator">Today</div>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {habits.map(habit => {
                    const isExpanded = !!collapsedHabits[habit._id];
                    const habitClass = `task-${slugify(habit.title)}`;
                    return (
                      <React.Fragment key={habit._id}>
                        {/* Main Habit Row */}
                        <tr className={`habit-row-main ${habitClass}`}>
                          <td className="sticky-col habit-title-cell">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {habit.hasSubtasks && (
                                <div
                                  className="toggle-btn-circle"
                                  style={{ width: '18px', height: '18px', fontSize: '12px', cursor: 'pointer', margin: 0, zIndex: 2 }}
                                  onClick={() => toggleHabitGroup(habit._id)}
                                >
                                  {isExpanded ? '-' : '+'}
                                </div>
                              )}
                              {habit.hasSubtasks && isExpanded && (
                                <div className="tree-line-vertical" style={{ left: '9px', top: '50%' }}></div>
                              )}
                              {!habit.hasSubtasks && <div style={{ width: '18px' }}></div>}
                              <span>{habit.title}</span>
                              <button className="delete-habit-btn" onClick={() => deleteHabit(habit._id)}>&times;</button>
                            </div>
                          </td>
                          {!habit.hasSubtasks && visibleDays.map(day => {
                            const isDone = (habit.completions[day.dateStr] || []).includes(-1);
                            return (
                              <td key={day.dateStr} className={`checkbox-cell ${day.isToday ? 'today-col' : ''}`}>
                                <input
                                  type="checkbox"
                                  checked={isDone}
                                  onChange={() => toggleHabitCompletion(habit._id, day.dateStr, -1)}
                                  className="habit-checkbox"
                                />
                              </td>
                            );
                          })}
                          {habit.hasSubtasks && visibleDays.map(day => (
                            <td key={day.dateStr} className={day.isToday ? 'today-col' : ''}></td>
                          ))}
                        </tr>

                        {/* Subtask Rows - Only show if expanded */}
                        {habit.hasSubtasks && isExpanded && habit.subtasks.map((st, stIdx) => {
                          const subtaskClass = `subtask-${slugify(st.title)}`;
                          const isLast = stIdx === habit.subtasks.length - 1;
                          return (
                            <tr key={`${habit._id}-${stIdx}`} className={`habit-row-sub ${subtaskClass}`}>
                              <td className="sticky-col subtask-title-cell">
                                <div className={`tree-line-vertical ${isLast ? 'last-item' : ''}`} style={{ left: '9px' }}></div>
                                <div className="tree-line-branch" style={{ left: '9px', width: '20px' }}></div>
                                {st.title}
                              </td>
                              {visibleDays.map(day => {
                                const isDone = (habit.completions[day.dateStr] || []).includes(stIdx);
                                return (
                                  <td key={day.dateStr} className={`checkbox-cell ${day.isToday ? 'today-col' : ''}`}>
                                    <input
                                      type="checkbox"
                                      checked={isDone}
                                      onChange={() => toggleHabitCompletion(habit._id, day.dateStr, stIdx)}
                                      className="habit-checkbox"
                                    />
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>

              {/* Completion Trend Graph */}
              <div style={{ 
                marginTop: '32px', 
                paddingLeft: '200px', // Matches sticky column width
                width: 'max-content',
                minWidth: '100%'
              }}>
                <div style={{ marginBottom: '16px', color: '#475569', fontSize: '0.9rem', fontWeight: '600' }}>Completion Trend (%)</div>
                <LineChart width={visibleDays.length * 60} height={150} data={completionData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" hide />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="custom-tooltip" style={{ backgroundColor: 'white', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>{payload[0].payload.fullDate}</p>
                            <p style={{ margin: 0, fontWeight: 'bold', color: '#2563eb' }}>{payload[0].value}% Done</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="percentage" 
                    stroke="#2563eb" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }} 
                    activeDot={{ r: 6 }} 
                  />
                </LineChart>
              </div>
            </div>
            {habits.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                <p>No habits added yet. Start by adding your first habit!</p>
              </div>
            )}
          </section>
        )}

        {activeTab === 'journal' && (
          <section className="panel">
            <div className="panel-header">
              <h2>My Journal</h2>
              <button>New Entry</button>
            </div>
            <div style={{ marginTop: '20px', textAlign: 'center', padding: '40px', color: '#64748b' }}>
              <p>Write your thoughts here. (Implementation coming soon...)</p>
            </div>
          </section>
        )}

        {activeTab === 'finance' && (
          <>
            <section className="panel chart-panel">
              <div className="panel-header" style={{ marginBottom: '16px' }}>
                <h2>Finance Overview</h2>
                <div className="action-buttons">
                  <button className={`btn-small ${timeFilter === '1d' ? 'btn-active' : 'btn-secondary'}`} onClick={() => setTimeFilter('1d')}>1D</button>
                  <button className={`btn-small ${timeFilter === '1w' ? 'btn-active' : 'btn-secondary'}`} onClick={() => setTimeFilter('1w')}>1W</button>
                  <button className={`btn-small ${timeFilter === '1m' ? 'btn-active' : 'btn-secondary'}`} onClick={() => setTimeFilter('1m')}>1M</button>
                  <button className={`btn-small ${timeFilter === '1y' ? 'btn-active' : 'btn-secondary'}`} onClick={() => setTimeFilter('1y')}>1Y</button>
                  <button className={`btn-small ${timeFilter === 'all' ? 'btn-active' : 'btn-secondary'}`} onClick={() => setTimeFilter('all')}>All</button>
                </div>
              </div>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} tickFormatter={(value) => `₹${value}`} />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value) => [`₹${value}`, '']}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="balance" name="Net Balance" stroke="#8b5cf6" strokeWidth={3} dot={{ strokeWidth: 2, r: 4 }} activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="income" name="Income" stroke="#16a34a" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="invest" name="Investment" stroke="#3b82f6" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="expense" name="Expense" stroke="#dc2626" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="panel list-panel">
              <div className="panel-header">
                <h2>Finance Entries</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {loading && <span>Loading…</span>}
                  <button onClick={() => setIsModalOpen(true)}>Add new entry</button>
                </div>
              </div>

              {entries.length === 0 && !loading ? (
                <p className="empty-state">No entries yet. Add one to get started.</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="entries-table">
                    <tbody>
                      {renderTableRows()}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {isModalOpen && activeTab === 'finance' && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add new entry</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <label>
                Date
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  required
                />
              </label>

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
                  <option value="investment">Investment</option>
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
          </div>
        </div>
      )}
      {isHabitModalOpen && (
        <div className="modal-overlay" onClick={() => setIsHabitModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Habit</h2>
              <button className="close-btn" onClick={() => setIsHabitModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleHabitSubmit}>
              <label>
                Habit Title
                <input
                  placeholder="e.g. Morning Routine"
                  value={habitForm.title}
                  onChange={(e) => setHabitForm({ ...habitForm, title: e.target.value })}
                  required
                />
              </label>

              <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  id="hasSubtasks"
                  checked={habitForm.hasSubtasks}
                  onChange={(e) => setHabitForm({ ...habitForm, hasSubtasks: e.target.checked })}
                  style={{ width: 'auto', marginTop: '0' }}
                />
                <label htmlFor="hasSubtasks" style={{ marginBottom: '0' }}>Add sub-tasks?</label>
              </div>

              {habitForm.hasSubtasks && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h4 style={{ margin: '0' }}>Sub-tasks</h4>
                    <button type="button" className="btn-small btn-secondary" onClick={addSubtaskInput}>+ Add</button>
                  </div>
                  {habitForm.subtasks.map((st, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <input
                        placeholder={`Sub-task ${idx + 1}`}
                        value={st.title}
                        onChange={(e) => handleSubtaskInputChange(idx, e.target.value)}
                        required
                      />
                      {habitForm.subtasks.length > 1 && (
                        <button type="button" className="btn-danger btn-small" onClick={() => removeSubtaskInput(idx)}>&times;</button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <button type="submit" style={{ width: '100%' }}>Create Habit</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
