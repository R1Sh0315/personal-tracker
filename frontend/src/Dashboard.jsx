import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { 
  format, subDays, subWeeks, subMonths, subYears, 
  isAfter, getWeek, addDays, isSameDay, 
  startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth 
} from 'date-fns';

// Material UI Imports
import { 
  Box, Container, Typography, Button, Tabs, Tab, 
  Card, CardContent, IconButton, Dialog, DialogTitle, 
  DialogContent, TextField, Select, MenuItem, 
  FormControl, InputLabel, Chip, Divider, 
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Avatar, Tooltip as MuiTooltip,
  Fab, InputAdornment, Grid
} from '@mui/material';

// Icons
import { 
  Add as AddIcon, 
  Delete as DeleteIcon, 
  TrendingUp as TrendingUpIcon, 
  TrendingDown as TrendingDownIcon,
  Psychology as PsychologyIcon,
  AccountBalanceWallet as WalletIcon,
  Timeline as TimelineIcon,
  MenuBook as JournalIcon,
  Settings as SettingsIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as UncheckedIcon,
  Logout as LogoutIcon,
  Assessment as AssessmentIcon,
  NoteAlt as NoteIcon,
  ShowChart as ShowChartIcon
} from '@mui/icons-material';

import { 
  HiOutlineLibrary, 
  HiChartBar, 
  HiCash, 
  HiCalendar,
  HiOutlineClipboardList
} from 'react-icons/hi';
import { IoDiamondOutline } from "react-icons/io5";

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
  const [activeJournalSubTab, setActiveJournalSubTab] = useState('log');
  const [habits, setHabits] = useState([]);
  const [collapsedHabits, setCollapsedHabits] = useState({}); // To track expanded/collapsed subtasks
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [habitForm, setHabitForm] = useState({ title: '', hasSubtasks: false, subtasks: [{ title: '' }] });
  const habitScrollRef = React.useRef(null);
  const graphScrollRef = React.useRef(null);
  const [journals, setJournals] = useState([]);
  const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);
  const [journalForm, setJournalForm] = useState({
    type: 'note',
    market: 'indian',
    content: '',
    symbol: '',
    pnl: 0,
    netPnl: 0,
    mentalState: '',
    date: new Date().toISOString().split('T')[0],
    assetType: 'options',
    indexName: 'Nifty50',
    optionType: 'CE',
    strikePrice: '',
    charges: {
      brokerage: 0,
      stt: 0,
      stampDuty: 0,
      exchangeTurnover: 0,
      sebiTurnover: 0,
      gst: 0
    },
    leverage: '',
    spread: 0,
    direction: 'long'
  });
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
    fetchJournals();
  }, []);

  const fetchJournals = async () => {
    try {
      const response = await fetch('/api/journals');
      const data = await response.json();
      setJournals(data);
    } catch (err) {
      console.error('Failed to fetch journals');
    }
  };

  const handleJournalSubmit = async (e) => {
    e.preventDefault();
    const totalCharges = Object.values(journalForm.charges).reduce((a, b) => a + b, 0);
    const calculatedNetPnl = journalForm.type === 'trade' ? (journalForm.pnl - totalCharges) : 0;

    const payload = { ...journalForm, netPnl: calculatedNetPnl };

    try {
      const response = await fetch('/api/journals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        const newEntry = await response.json();
        setJournals([newEntry, ...journals]);
        setIsJournalModalOpen(false);
        setJournalForm({
          type: 'note',
          market: 'indian',
          content: '',
          symbol: '',
          pnl: 0,
          netPnl: 0,
          mentalState: '',
          date: new Date().toISOString().split('T')[0],
          assetType: 'options',
          indexName: 'Nifty50',
          optionType: 'CE',
          strikePrice: '',
          charges: {
            brokerage: 0,
            stt: 0,
            stampDuty: 0,
            exchangeTurnover: 0,
            sebiTurnover: 0,
            gst: 0
          },
          leverage: '',
          spread: 0,
          direction: 'long'
        });
      }
    } catch (err) {
      console.error('Failed to create journal entry');
    }
  };

  const deleteJournal = async (id) => {
    if (!window.confirm('Delete this entry?')) return;
    try {
      await fetch(`/api/journals/${id}`, { method: 'DELETE' });
      setJournals(journals.filter(j => j._id !== id));
    } catch (err) {
      console.error('Failed to delete journal entry');
    }
  };

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

  const calendarDays = Array.from({ length: 35 }, (_, i) => {
    const start = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const d = addDays(start, i - start.getDay());
    return {
      date: d,
      dateStr: format(d, 'yyyy-MM-dd'),
      isCurrentMonth: d.getMonth() === new Date().getMonth()
    };
  });

  const getDayEntries = (dateStr) => journals.filter(j => format(new Date(j.date), 'yyyy-MM-dd') === dateStr);

  const cumulativePnlData = journals
    .filter(j => j.type === 'trade')
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .reduce((acc, j) => {
      const prevTotal = acc.length > 0 ? acc[acc.length - 1].total : 0;
      acc.push({
        date: format(new Date(j.date), 'MMM dd'),
        total: prevTotal + j.netPnl,
        pnl: j.pnl,
        symbol: j.symbol
      });
      return acc;
    }, []);

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

  const handleSyncScroll = (source, target) => {
    if (source.current && target.current) {
      target.current.scrollLeft = source.current.scrollLeft;
    }
  };

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

  const journalStats = journals.reduce((acc, j) => {
    if (j.type === 'trade') {
      acc.trades += 1;
      acc.netPnl += (j.netPnl || 0);
      if (j.pnl > 0) acc.wins += 1;
    } else {
      acc.notes += 1;
    }
    return acc;
  }, { trades: 0, netPnl: 0, wins: 0, notes: 0 });

  const winRate = journalStats.trades > 0 ? Math.round((journalStats.wins / journalStats.trades) * 100) : 0;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f1f5f9', pb: 8 }}>
      {/* Header */}
      <Paper elevation={0} sx={{ borderBottom: '1px solid #e2e8f0', bgcolor: 'white', mb: 4 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ bgcolor: '#2563eb', width: 40, height: 40 }}>
                <IoDiamondOutline size={24} />
              </Avatar>
              <Typography variant="h5" fontWeight="800" sx={{ letterSpacing: '-0.5px' }}>
                Personal Dashboard
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
               {activeTab === 'finance' && (
                 <Box sx={{ textAlign: 'right' }}>
                   <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Total Balance</Typography>
                   <Typography variant="body1" fontWeight="700" color={totalBalance >= 0 ? 'success.main' : 'error.main'}>
                     ₹{totalBalance.toLocaleString()}
                   </Typography>
                 </Box>
               )}
               <Button 
                variant="outlined" 
                color="inherit" 
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
                sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: '600', borderColor: '#e2e8f0' }}
              >
                Logout
              </Button>
            </Box>
          </Box>

          <Tabs 
            value={activeTab === 'habits' ? 0 : activeTab === 'finance' ? 1 : 2} 
            onChange={(e, val) => setActiveTab(val === 0 ? 'habits' : val === 1 ? 'finance' : 'journal')}
            sx={{
              '& .MuiTab-root': { textTransform: 'none', fontWeight: '700', fontSize: '1rem', minWidth: 100 },
              '& .Mui-selected': { color: '#2563eb !important' },
              '& .MuiTabs-indicator': { bgcolor: '#2563eb', height: 3, borderRadius: '3px 3px 0 0' }
            }}
          >
            <Tab icon={<HiOutlineLibrary size={20} />} iconPosition="start" label="Habits" />
            <Tab icon={<HiCash size={20} />} iconPosition="start" label="Finance" />
            <Tab icon={<JournalIcon />} iconPosition="start" label="Journal" />
          </Tabs>
        </Container>
      </Paper>

      <Container maxWidth="lg">
        {activeTab === 'habits' && (
          <Box>
            {/* Habit Grid Panel */}
            <Card sx={{ borderRadius: '20px', mb: 3, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'white' }}>
                <Box>
                  <Typography variant="h6" fontWeight="800">Weekly Habits</Typography>
                  <Typography variant="body2" color="text.secondary">Track your daily progress and rituals</Typography>
                </Box>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  onClick={() => setIsHabitModalOpen(true)}
                  sx={{ bgcolor: '#2563eb', borderRadius: '12px', px: 3, '&:hover': { bgcolor: '#1d4ed8' }, textTransform: 'none', fontWeight: '700' }}
                >
                  Add Habit
                </Button>
              </Box>
              
              <Divider />
              <Box sx={{ p: 2 }}>

            <Box 
              className="habit-scroll-container" 
              ref={habitScrollRef}
              onScroll={() => handleSyncScroll(habitScrollRef, graphScrollRef)}
              sx={{ overflowX: 'auto' }}
            >
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
                    <TableCell sx={{ position: 'sticky', left: 0, zIndex: 10, bgcolor: '#f8fafc', borderRight: '2px solid #f1f5f9' }} />
                    {visibleDays.map(day => (
                      <TableCell key={day.dateStr} sx={{ textAlign: 'center', p: 1, minWidth: 60, bgcolor: day.isToday ? '#eff6ff' : 'transparent', borderLeft: '1px solid #f1f5f9' }}>
                        <Typography variant="caption" sx={{ display: 'block', color: '#94a3b8', fontWeight: '700' }}>{day.label}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: '800', color: day.isToday ? 'primary.main' : '#475569' }}>{day.dayNum}</Typography>
                        {day.isToday && <Typography variant="caption" sx={{ bgcolor: 'primary.main', color: 'white', px: 0.5, borderRadius: '4px', fontSize: '0.6rem' }}>TODAY</Typography>}
                      </TableCell>
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
                          <TableCell sx={{ position: 'sticky', left: 0, zIndex: 10, bgcolor: 'white', minWidth: 200, borderRight: '2px solid #f1f5f9' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {habit.hasSubtasks && (
                                <Box
                                  onClick={() => toggleHabitGroup(habit._id)}
                                  sx={{ 
                                    width: 20, height: 20, borderRadius: '50%', bgcolor: '#f1f5f9', 
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '14px', cursor: 'pointer', color: '#64748b', fontWeight: '800'
                                  }}
                                >
                                  {isExpanded ? '−' : '+'}
                                </Box>
                              )}
                              {habit.hasSubtasks && isExpanded && (
                                <Box className="tree-line-vertical" sx={{ left: '10px', top: '50%', position: 'absolute' }} />
                              )}
                              {!habit.hasSubtasks && <Box sx={{ width: 20 }} />}
                              <Typography variant="body2" fontWeight="700">{habit.title}</Typography>
                              <IconButton size="small" onClick={() => deleteHabit(habit._id)} sx={{ ml: 'auto', opacity: 0.3, '&:hover': { opacity: 1 } }}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </TableCell>
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

              </Box>
            </Box>
          </Card>

            {habits.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 8, bgcolor: 'white', borderRadius: '20px', mb: 3 }}>
                <Typography color="text.secondary">No habits added yet. Start by adding your first habit!</Typography>
              </Box>
            )}

            {/* Completion Trend Panel */}
            <Card sx={{ borderRadius: '20px', mb: 3, p: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <Typography variant="h6" fontWeight="800" sx={{ mb: 2 }}>Completion Trend</Typography>
              <Box 
                className="habit-scroll-container" 
                ref={graphScrollRef}
                onScroll={() => handleSyncScroll(graphScrollRef, habitScrollRef)}
                sx={{ overflowX: 'auto', pb: 2 }}
              >
                <Box sx={{
                  paddingLeft: '200px', // Matches sticky column width
                  width: 'max-content',
                  minWidth: '100%'
                }}>
                  <LineChart width={visibleDays.length * 60} height={150} data={completionData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" hide />
                    <YAxis hide domain={[0, 100]} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <Paper sx={{ p: 1.5, borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                              <Typography variant="caption" display="block" color="text.secondary">{payload[0].payload.fullDate}</Typography>
                              <Typography variant="body2" fontWeight="700" color="primary.main">{payload[0].value}% Done</Typography>
                            </Paper>
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
                </Box>
              </Box>
            </Card>
          </Box>
        )}

        {activeTab === 'journal' && (
          <Box>
            <Tabs 
              value={activeJournalSubTab === 'log' ? 0 : 1}
              onChange={(e, val) => setActiveJournalSubTab(val === 0 ? 'log' : 'stats')}
              sx={{ mb: 3, '& .MuiTab-root': { fontWeight: '700' } }}
            >
              <Tab label="Journal Log" />
              <Tab label="Performance Stats" />
            </Tabs>

            {activeJournalSubTab === 'log' ? (
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Card sx={{ borderRadius: '20px', mb: 3 }}>
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary" fontWeight="700" sx={{ mb: 2, textAlign: 'center' }}>
                        {format(new Date(), 'MMMM yyyy')}
                      </Typography>
                      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5 }}>
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                          <Typography key={d} variant="caption" align="center" fontWeight="800" color="#94a3b8">{d}</Typography>
                        ))}
                        {calendarDays.map(day => {
                          const dayEntries = getDayEntries(day.dateStr);
                          const dayPnl = dayEntries.filter(e => e.type === 'trade').reduce((acc, e) => acc + (e.netPnl || 0), 0);
                          const hasNote = dayEntries.some(e => e.type === 'note');
                          const hasTrade = dayEntries.some(e => e.type === 'trade');

                          let color = 'transparent';
                          if (hasTrade) color = dayPnl > 0 ? '#f0fdf4' : (dayPnl < 0 ? '#fef2f2' : '#f8fafc');
                          else if (hasNote) color = '#f1f5f9';

                          return (
                            <MuiTooltip key={day.dateStr} title={dayPnl !== 0 ? `P&L: ₹${dayPnl.toLocaleString()}` : ''}>
                              <Box sx={{ 
                                aspectRatio: '1', 
                                display: 'flex', 
                                flexDirection: 'column', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                borderRadius: '8px',
                                bgcolor: color,
                                color: !day.isCurrentMonth ? '#e2e8f0' : (dayPnl > 0 ? '#166534' : (dayPnl < 0 ? '#991b1b' : '#475569')),
                                position: 'relative',
                                fontSize: '0.75rem',
                                fontWeight: (hasTrade || hasNote) ? '800' : '500'
                              }}>
                                {format(day.date, 'd')}
                                <Box sx={{ display: 'flex', gap: 0.2, position: 'absolute', bottom: 2 }}>
                                  {dayEntries.map(e => (
                                    <Box key={e._id} sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: e.type === 'trade' ? (e.netPnl >= 0 ? '#16a34a' : '#dc2626') : '#94a3b8' }} />
                                  ))}
                                </Box>
                              </Box>
                            </MuiTooltip>
                          );
                        })}
                      </Box>
                    </CardContent>
                  </Card>

                  <Card sx={{ borderRadius: '20px', bgcolor: '#2563eb', color: 'white' }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                        <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 32, height: 32 }}>
                          <HiChartBar size={18} />
                        </Avatar>
                        <Typography variant="subtitle2" fontWeight="700">Quick Stats</Typography>
                      </Box>
                      <Typography variant="h4" fontWeight="800">₹{journalStats.netPnl.toLocaleString()}</Typography>
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>Net Profit / Loss (This Month)</Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={8}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" fontWeight="800">Daily Activity</Typography>
                    <Button 
                      variant="contained" 
                      startIcon={<AddIcon />}
                      onClick={() => setIsJournalModalOpen(true)}
                      sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: '700' }}
                    >
                      New Entry
                    </Button>
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {journals.map(entry => (
                      <Card key={entry._id} sx={{ 
                        borderRadius: '20px', 
                        borderLeft: `6px solid ${entry.type === 'trade' ? (entry.netPnl >= 0 ? '#16a34a' : '#dc2626') : '#94a3b8'}`,
                        transition: 'transform 0.2s',
                        '&:hover': { transform: 'translateY(-4px)' }
                      }}>
                        <CardContent sx={{ p: 3 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Box>
                              <Typography variant="caption" color="text.secondary" fontWeight="700">
                                {format(new Date(entry.date), 'MMMM dd, yyyy')}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                <Chip 
                                  label={entry.type.toUpperCase()} 
                                  size="small" 
                                  sx={{ 
                                    fontWeight: '800', 
                                    fontSize: '0.65rem', 
                                    bgcolor: entry.type === 'trade' ? '#dcfce7' : '#f1f5f9',
                                    color: entry.type === 'trade' ? '#166534' : '#475569'
                                  }} 
                                />
                                {entry.type === 'trade' && (
                                  <Chip 
                                    label={entry.direction?.toUpperCase()} 
                                    size="small" 
                                    color={entry.direction === 'long' ? 'success' : 'error'}
                                    variant="outlined"
                                    sx={{ fontWeight: '800', fontSize: '0.65rem' }} 
                                  />
                                )}
                              </Box>
                            </Box>
                            <IconButton size="small" onClick={() => deleteJournal(entry._id)} color="error">
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>

                          {entry.type === 'trade' && (
                            <Box sx={{ bgcolor: '#f8fafc', p: 2, borderRadius: '12px', mb: 2 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h5" fontWeight="800" color={entry.netPnl >= 0 ? 'success.main' : 'error.main'}>
                                  ₹{entry.netPnl?.toLocaleString()}
                                </Typography>
                                <Typography variant="body2" fontWeight="700">{entry.symbol}</Typography>
                              </Box>
                              <Grid container spacing={2}>
                                {entry.market === 'indian' && (
                                  <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">Strategy</Typography>
                                    <Typography variant="body2" fontWeight="600">
                                      {entry.assetType === 'options' ? `${entry.strikePrice} ${entry.optionType}` : entry.assetType}
                                    </Typography>
                                  </Grid>
                                )}
                                <Grid item xs={6}>
                                  <Typography variant="caption" color="text.secondary">Market</Typography>
                                  <Typography variant="body2" fontWeight="600" sx={{ textTransform: 'capitalize' }}>{entry.market}</Typography>
                                </Grid>
                              </Grid>
                            </Box>
                          )}

                          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', color: '#1e293b', mb: 2 }}>
                            {entry.content}
                          </Typography>

                          {entry.mentalState && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#64748b' }}>
                              <PsychologyIcon sx={{ fontSize: 18 }} />
                              <Typography variant="caption" fontWeight="600">{entry.mentalState}</Typography>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                </Grid>
              </Grid>
            ) : (
              <Box>
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ borderRadius: '20px', textAlign: 'center', p: 2 }}>
                      <Typography variant="caption" color="text.secondary" fontWeight="700">NET P&L</Typography>
                      <Typography variant="h4" fontWeight="800" color={journalStats.netPnl >= 0 ? 'success.main' : 'error.main'}>
                        ₹{journalStats.netPnl.toLocaleString()}
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ borderRadius: '20px', textAlign: 'center', p: 2 }}>
                      <Typography variant="caption" color="text.secondary" fontWeight="700">WIN RATE</Typography>
                      <Typography variant="h4" fontWeight="800" color="primary">{winRate}%</Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ borderRadius: '20px', textAlign: 'center', p: 2 }}>
                      <Typography variant="caption" color="text.secondary" fontWeight="700">PROFIT DAYS</Typography>
                      <Typography variant="h4" fontWeight="800" color="success.main">{journalStats.wins}</Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ borderRadius: '20px', textAlign: 'center', p: 2 }}>
                      <Typography variant="caption" color="text.secondary" fontWeight="700">TOTAL TRADES</Typography>
                      <Typography variant="h4" fontWeight="800">{journalStats.trades}</Typography>
                    </Card>
                  </Grid>
                </Grid>

                <Card sx={{ borderRadius: '20px', p: 4 }}>
                  <Typography variant="h6" fontWeight="800" sx={{ mb: 4 }}>Equity Curve (Growth Portfolio)</Typography>
                  <Box sx={{ width: '100%', height: 400 }}>
                    <ResponsiveContainer>
                      <LineChart data={cumulativePnlData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                        <Tooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <Paper sx={{ p: 2, borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}>
                                  <Typography variant="caption" color="text.secondary">{payload[0].payload.date} - {payload[0].payload.symbol}</Typography>
                                  <Typography variant="h6" fontWeight="800" color={payload[0].value >= 0 ? 'success.main' : 'error.main'}>
                                    ₹{payload[0].value.toLocaleString()}
                                  </Typography>
                                </Paper>
                              );
                            }
                            return null;
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="total" 
                          stroke="#2563eb" 
                          strokeWidth={4} 
                          dot={{ r: 6, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }} 
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </Card>
              </Box>
            )}
          </Box>
        )}

        {activeTab === 'finance' && (
          <Box>
            <Card sx={{ borderRadius: '20px', mb: 3, p: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                  <Typography variant="h6" fontWeight="800">Finance Overview</Typography>
                  <Typography variant="body2" color="text.secondary">Monitor your cash flow and investments</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, bgcolor: '#f1f5f9', p: 0.5, borderRadius: '12px' }}>
                  {['1d', '1w', '1m', '1y', 'all'].map(f => (
                    <Button 
                      key={f}
                      size="small"
                      onClick={() => setTimeFilter(f)}
                      sx={{ 
                        minWidth: 40, 
                        textTransform: 'uppercase', 
                        fontSize: '0.7rem', 
                        fontWeight: '800',
                        borderRadius: '8px',
                        bgcolor: timeFilter === f ? 'white' : 'transparent',
                        color: timeFilter === f ? '#2563eb' : '#64748b',
                        boxShadow: timeFilter === f ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                        '&:hover': { bgcolor: timeFilter === f ? 'white' : '#e2e8f0' }
                      }}
                    >
                      {f}
                    </Button>
                  ))}
                </Box>
              </Box>

              <Box sx={{ width: '100%', height: 350 }}>
                <ResponsiveContainer>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(val) => `₹${val}`} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Legend iconType="circle" />
                    <Line type="monotone" dataKey="balance" name="Net Balance" stroke="#6366f1" strokeWidth={4} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="income" name="Income" stroke="#10b981" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                    <Line type="monotone" dataKey="invest" name="Investment" stroke="#3b82f6" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="expense" name="Expense" stroke="#ef4444" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Card>

            <Card sx={{ borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight="800">Recent Transactions</Typography>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  onClick={() => setIsModalOpen(true)}
                  sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: '700' }}
                >
                  Add Entry
                </Button>
              </Box>
              <TableContainer>
                <Table sx={{ minWidth: 650 }}>
                  <TableHead sx={{ bgcolor: '#f8fafc' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: '700', color: '#64748b' }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: '700', color: '#64748b' }}>Title</TableCell>
                      <TableCell sx={{ fontWeight: '700', color: '#64748b' }}>Category</TableCell>
                      <TableCell sx={{ fontWeight: '700', color: '#64748b' }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: '700', color: '#64748b' }}>Amount</TableCell>
                      <TableCell sx={{ fontWeight: '700', color: '#64748b' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {entries.map(entry => (
                      <TableRow key={entry._id} hover>
                        <TableCell sx={{ fontSize: '0.85rem' }}>{format(new Date(entry.date), 'MMM dd, yyyy')}</TableCell>
                        <TableCell sx={{ fontWeight: '600' }}>{entry.title}</TableCell>
                        <TableCell>
                          <Chip label={entry.category} size="small" variant="outlined" sx={{ fontWeight: '600', fontSize: '0.7rem' }} />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={entry.type} 
                            size="small" 
                            sx={{ 
                              fontWeight: '800', 
                              fontSize: '0.65rem',
                              bgcolor: entry.type === 'income' ? '#dcfce7' : (entry.type === 'expense' ? '#fef2f2' : '#eff6ff'),
                              color: entry.type === 'income' ? '#166534' : (entry.type === 'expense' ? '#991b1b' : '#1e40af')
                            }} 
                          />
                        </TableCell>
                        <TableCell sx={{ fontWeight: '800', color: entry.type === 'income' ? 'success.main' : 'error.main' }}>
                          {entry.type === 'income' ? '+' : '-'}₹{entry.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" color="error" onClick={() => handleDelete(entry._id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {entries.length === 0 && !loading && (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography color="text.secondary">No entries found for this period.</Typography>
                </Box>
              )}
            </Card>
          </Box>
        )}
      </Container>

      {/* Finance Modal */}
      <Dialog 
        open={isModalOpen && activeTab === 'finance'} 
        onClose={() => setIsModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '24px' } }}
      >
        <DialogTitle sx={{ fontWeight: '800' }}>Add Finance Entry</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField fullWidth label="Date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} InputLabelProps={{ shrink: true }} required />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select value={form.type} label="Type" onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    <MenuItem value="expense">Expense</MenuItem>
                    <MenuItem value="income">Income</MenuItem>
                    <MenuItem value="investment">Investment</MenuItem>
                    <MenuItem value="health">Health</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Amount" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth multiline rows={2} label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </Grid>
            </Grid>
            {error && <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>{error}</Typography>}
            <Button fullWidth variant="contained" type="submit" sx={{ mt: 3, py: 1.5, borderRadius: '12px', fontWeight: '700', textTransform: 'none' }}>
              Save Entry
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
      {/* Journal Modal */}
      <Dialog 
        open={isJournalModalOpen} 
        onClose={() => setIsJournalModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight="800">New Journal Entry</Typography>
          <IconButton onClick={() => setIsJournalModalOpen(false)}><DeleteIcon /></IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Tabs 
              value={journalForm.type === 'note' ? 0 : 1}
              onChange={(e, val) => setJournalForm({ ...journalForm, type: val === 0 ? 'note' : 'trade' })}
              sx={{ bgcolor: '#f1f5f9', borderRadius: '12px', p: 0.5, '& .MuiTabs-indicator': { display: 'none' } }}
            >
              <Tab 
                label="Note" 
                sx={{ 
                  borderRadius: '10px', 
                  minHeight: '40px',
                  fontWeight: '700',
                  '&.Mui-selected': { bgcolor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', color: '#2563eb' } 
                }} 
              />
              <Tab 
                label="Trade Log" 
                sx={{ 
                  borderRadius: '10px', 
                  minHeight: '40px',
                  fontWeight: '700',
                  '&.Mui-selected': { bgcolor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', color: '#2563eb' } 
                }} 
              />
            </Tabs>
          </Box>

          <form onSubmit={handleJournalSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField 
                  fullWidth
                  label="Date"
                  type="date"
                  value={journalForm.date}
                  onChange={(e) => setJournalForm({ ...journalForm, date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              {journalForm.type === 'trade' && (
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Market</InputLabel>
                    <Select
                      value={journalForm.market}
                      label="Market"
                      onChange={(e) => setJournalForm({ ...journalForm, market: e.target.value })}
                    >
                      <MenuItem value="indian">Indian Market</MenuItem>
                      <MenuItem value="forex">Forex Market</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              )}

              {journalForm.type === 'trade' && (
                <>
                  <Grid item xs={6}>
                    <TextField 
                      fullWidth 
                      label="Symbol / Index"
                      placeholder={journalForm.market === 'indian' ? "e.g. NIFTY50" : "e.g. EURUSD"}
                      value={journalForm.symbol}
                      onChange={(e) => setJournalForm({ ...journalForm, symbol: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <FormControl fullWidth>
                      <InputLabel>Direction</InputLabel>
                      <Select
                        value={journalForm.direction}
                        label="Direction"
                        onChange={(e) => setJournalForm({ ...journalForm, direction: e.target.value })}
                      >
                        <MenuItem value="long">Long (Buy)</MenuItem>
                        <MenuItem value="short">Short (Sell)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {journalForm.market === 'indian' && (
                    <Grid item xs={12}>
                      <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: '16px' }}>
                        <Typography variant="subtitle2" fontWeight="700" sx={{ mb: 2 }}>Indian Market Specs</Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <FormControl fullWidth>
                              <InputLabel>Asset Type</InputLabel>
                              <Select
                                value={journalForm.assetType}
                                label="Asset Type"
                                onChange={(e) => setJournalForm({ ...journalForm, assetType: e.target.value })}
                              >
                                <MenuItem value="equity">Equity</MenuItem>
                                <MenuItem value="options">Options</MenuItem>
                                <MenuItem value="futures">Futures</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                          {journalForm.assetType === 'options' && (
                            <Grid item xs={6}>
                              <TextField fullWidth label="Strike Price" value={journalForm.strikePrice} onChange={(e) => setJournalForm({ ...journalForm, strikePrice: e.target.value })} />
                            </Grid>
                          )}
                        </Grid>
                      </Paper>
                    </Grid>
                  )}

                  <Grid item xs={12}>
                    <TextField 
                      fullWidth 
                      label="Gross P&L" 
                      type="number"
                      value={journalForm.pnl}
                      onChange={(e) => setJournalForm({ ...journalForm, pnl: Number(e.target.value) })}
                    />
                  </Grid>
                </>
              )}

              <Grid item xs={12}>
                <TextField 
                  fullWidth 
                  multiline 
                  rows={3} 
                  label={journalForm.type === 'trade' ? 'Trade Notes' : 'Thoughts'}
                  value={journalForm.content}
                  onChange={(e) => setJournalForm({ ...journalForm, content: e.target.value })}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField 
                  fullWidth 
                  label="Mental State" 
                  value={journalForm.mentalState}
                  onChange={(e) => setJournalForm({ ...journalForm, mentalState: e.target.value })}
                  InputProps={{ startAdornment: <InputAdornment position="start">🧠</InputAdornment> }}
                />
              </Grid>
            </Grid>
            <Button 
              fullWidth 
              variant="contained" 
              type="submit" 
              sx={{ mt: 3, py: 1.5, borderRadius: '12px', fontWeight: '700', textTransform: 'none' }}
            >
              Save Entry
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Habit Modal */}
      <Dialog 
        open={isHabitModalOpen} 
        onClose={() => setIsHabitModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '24px' } }}
      >
        <DialogTitle sx={{ fontWeight: '800' }}>Add Habit</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleHabitSubmit} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Habit Title"
              placeholder="e.g. Morning Routine"
              value={habitForm.title}
              onChange={(e) => setHabitForm({ ...habitForm, title: e.target.value })}
              required
              sx={{ mb: 2 }}
            />
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CheckCircleIcon sx={{ mr: 1, color: habitForm.hasSubtasks ? '#2563eb' : '#94a3b8' }} />
              <Typography variant="body2" sx={{ flexGrow: 1, fontWeight: '600' }}>Add sub-tasks?</Typography>
              <Button onClick={() => setHabitForm({ ...habitForm, hasSubtasks: !habitForm.hasSubtasks })} sx={{ textTransform: 'none', fontWeight: '700' }}>
                {habitForm.hasSubtasks ? 'Enabled' : 'Disabled'}
              </Button>
            </Box>

            {habitForm.hasSubtasks && (
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle2" fontWeight="700">Sub-tasks</Typography>
                  <IconButton size="small" color="primary" onClick={addSubtaskInput}><AddIcon /></IconButton>
                </Box>
                {habitForm.subtasks.map((st, idx) => (
                  <Box key={idx} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <TextField 
                      fullWidth 
                      size="small" 
                      placeholder={`Sub-task ${idx + 1}`} 
                      value={st.title}
                      onChange={(e) => handleSubtaskInputChange(idx, e.target.value)}
                    />
                    <IconButton size="small" onClick={() => removeSubtaskInput(idx)} disabled={habitForm.subtasks.length === 1}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            )}

            <Button fullWidth variant="contained" type="submit" sx={{ py: 1.5, borderRadius: '12px', fontWeight: '700', textTransform: 'none' }}>
              Create Habit
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default Dashboard;
