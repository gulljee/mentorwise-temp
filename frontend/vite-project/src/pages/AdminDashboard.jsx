import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showTranscripts, setShowTranscripts] = useState(false);
  const [activeTab, setActiveTab] = useState('Overview');
  const navigate = useNavigate();

  const isAuthenticated = localStorage.getItem('isAdminAuthenticated') === 'true';

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
      return;
    }
    fetchUsers();
  }, [navigate, isAuthenticated]);

  if (!isAuthenticated) {
    return null;
  }

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/users');
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      const response = await axios.delete(`http://localhost:5000/api/admin/users/${userId}`);
      if (response.data.success) {
        setSelectedUser(null);
        fetchUsers();
        alert('User deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  const handleApproveUser = async (userId, currentStatus) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/admin/users/${userId}/approve`, {
        isApproved: !currentStatus
      });
      if (response.data.success) {
        fetchUsers();
        if (selectedUser && selectedUser._id === userId) {
          setSelectedUser({ ...selectedUser, isApproved: !currentStatus });
        }
        alert(`User ${!currentStatus ? 'approved' : 'unapproved'} successfully`);
      }
    } catch (error) {
      console.error('Error updating approval status:', error);
      alert('Failed to update approval status');
    }
  };

  const fetchTranscripts = async (menteeId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/admin/transcripts/${menteeId}`);
      if (response.data.success) {
        setTranscripts(response.data.data);
        setShowTranscripts(true);
      }
    } catch (error) {
      console.error('Error fetching transcripts:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdminAuthenticated');
    navigate('/admin/login');
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'All' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const sidebarItems = [
    { icon: 'dashboard', label: 'Overview' }
  ];

  return (
    <div className="min-h-screen bg-surface text-on-surface font-body antialiased flex">
      {/* Sidebar */}
      <aside className="w-72 bg-surface-container-low border-r border-outline-variant/30 hidden lg:flex flex-col h-screen sticky top-0">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-white">shield_person</span>
            </div>
            <span 
              className="text-xl font-headline font-black tracking-tight text-primary cursor-pointer transition-opacity hover:opacity-80"
              onClick={() => setActiveTab('Overview')}
            >
              Mentor Wise
            </span>
          </div>

          <nav className="space-y-2">
            {sidebarItems.map((item) => (
              <button
                key={item.label}
                onClick={() => setActiveTab(item.label)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group ${activeTab === item.label
                    ? 'bg-primary text-white font-bold shadow-xl shadow-primary/20'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-primary'
                  }`}
              >
                <span className={`material-symbols-outlined ${activeTab === item.label ? 'text-white' : 'text-outline group-hover:text-primary'}`}>
                  {item.icon}
                </span>
                <span className="text-sm tracking-wide">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-8 border-t border-outline-variant/20 bg-surface-container-low">
          <button
            onClick={handleLogout}
            className="w-full py-3 bg-surface-container-highest hover:bg-error-container hover:text-on-error-container text-on-surface-variant text-xs font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-3 transition-all"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            Exit Portal
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        {/* Header */}
        <header className="h-20 border-b border-outline-variant/20 px-10 flex items-center justify-between bg-white/80 backdrop-blur-xl sticky top-0 z-40">
          <div className="flex flex-col">
            <h2 className="text-xs font-black text-outline uppercase tracking-[0.2em]">{activeTab} Hub</h2>
            <p className="text-sm font-headline font-bold text-primary mt-0.5">Control Center Access</p>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-primary font-black shadow-sm ring-4 ring-primary/5">
                AD
              </div>
            </div>
          </div>
        </header>

        <div className="p-10 max-w-7xl w-full mx-auto space-y-10">
          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { label: 'Total Enrolled', value: users.length, icon: 'groups', color: 'primary' },
              { label: 'Senior Mentors', value: users.filter(u => u.role === 'Mentor').length, icon: 'school', color: 'secondary' },
              { label: 'Junior Mentees', value: users.filter(u => u.role === 'Mentee').length, icon: 'person', color: 'tertiary' }
            ].map((stat, idx) => (
              <div key={idx} className="bg-white border border-outline-variant/30 rounded-3xl p-8 editorial-shadow group hover:border-primary/30 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-${stat.color}-container/30 rounded-2xl flex items-center justify-center -ml-2`}>
                    <span className={`material-symbols-outlined text-${stat.color} text-2xl`}>{stat.icon}</span>
                  </div>
                  <span className="text-[10px] font-black text-outline uppercase tracking-widest">{stat.label}</span>
                </div>
                <h3 className="text-4xl font-headline font-black text-on-surface">{stat.value}</h3>
              </div>
            ))}
          </div>

          {/* Directory Section */}
          <div className="bg-white border border-outline-variant/30 rounded-[40px] overflow-hidden editorial-shadow">
            <div className="p-10 border-b border-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-surface-container-lowest">
              <div>
                <h3 className="text-2xl font-headline font-black text-primary">Member Directory</h3>
                <p className="text-on-surface-variant text-sm mt-1 font-medium">Managing the academic excellence network</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">search</span>
                  <input
                    type="text"
                    placeholder="Search by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-surface-container-low border border-outline-variant/30 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary w-64 transition-all font-medium"
                  />
                </div>

                <div className="flex items-center gap-2 bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2.5">
                  <span className="material-symbols-outlined text-outline text-lg">filter_list</span>
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="bg-transparent text-sm font-bold text-on-surface-variant focus:outline-none cursor-pointer"
                  >
                    <option value="All">All Roles</option>
                    <option value="Mentor">Mentors</option>
                    <option value="Mentee">Mentees</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant/30 text-[10px] font-black text-outline uppercase tracking-[0.2em]">
                    <th className="px-10 py-6">Member Identity</th>
                    <th className="px-10 py-6">Academic Role</th>
                    <th className="px-10 py-6">Faculty/Dept</th>
                    <th className="px-10 py-6">Contact Node</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {loading ? (
                    Array(3).fill(0).map((_, i) => (
                      <tr key={i}><td colSpan="4" className="px-10 py-8 h-20 animate-pulse bg-surface/50"></td></tr>
                    ))
                  ) : (
                    filteredUsers.map((user) => (
                      <tr
                        key={user._id}
                        className="hover:bg-primary/5 cursor-pointer transition-all group"
                        onClick={() => {
                          setSelectedUser(user);
                          setShowTranscripts(false);
                        }}
                      >
                        <td className="px-10 py-6">
                          <div className="flex items-center gap-5">
                            <div className="w-12 h-12 bg-surface-container-high rounded-2xl flex items-center justify-center text-primary font-black shadow-sm group-hover:scale-110 transition-transform">
                              {user.firstName[0]}{user.lastName[0]}
                            </div>
                            <div>
                              <p className="text-sm font-headline font-black text-on-surface group-hover:text-primary transition-colors">{user.firstName} {user.lastName}</p>
                              <p className="text-[11px] text-outline font-bold uppercase tracking-widest mt-0.5">{user.phoneNumber}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-6">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${user.role === 'Mentor'
                              ? 'bg-primary text-white shadow-md shadow-primary/20'
                              : 'bg-secondary-fixed text-on-secondary-fixed shadow-md shadow-secondary/10'
                            }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-10 py-6">
                          <p className="text-sm text-on-surface-variant font-bold">{user.department}</p>
                        </td>
                        <td className="px-10 py-6">
                          <p className="text-sm text-primary font-bold">{user.email}</p>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-primary/20 backdrop-blur-md p-6 overflow-y-auto">
          <div className="absolute inset-0" onClick={() => setSelectedUser(null)} />
          <div className="relative w-full max-w-3xl bg-white rounded-[48px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            {/* Modal Header */}
            <div className="p-10 border-b border-outline-variant/10 flex items-center justify-between bg-surface-container-lowest">
              <div className="flex flex-col">
                <h3 className="text-2xl font-headline font-black text-primary">Institutional Dossier</h3>
                <p className="text-outline text-xs font-bold uppercase tracking-widest mt-1">Comprehensive Data Record</p>
              </div>
              <button onClick={() => setSelectedUser(null)} className="w-10 h-10 flex items-center justify-center bg-surface-container hover:bg-primary/5 text-outline hover:text-primary rounded-full transition-all flex-shrink-0">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-10 space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
              {/* Profile Summary Card */}
              <div className="bg-surface-container-low p-8 rounded-[40px] border border-outline-variant/20 flex flex-col md:flex-row items-center gap-8">
                <div className="relative">
                  {selectedUser.profileImage ? (
                    <img
                      src={`http://localhost:5000/${selectedUser.profileImage}`}
                      className="w-32 h-32 rounded-[40px] object-cover ring-8 ring-white shadow-2xl"
                      alt="Profile"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-primary rounded-[40px] flex items-center justify-center text-5xl text-white font-black shadow-2xl shadow-primary/30 ring-8 ring-white">
                      {selectedUser.firstName[0]}{selectedUser.lastName[0]}
                    </div>
                  )}
                  <div className={`absolute -bottom-2 -right-2 w-10 h-10 rounded-full border-4 border-white flex items-center justify-center shadow-lg ${selectedUser.isVerified ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                    <span className="material-symbols-outlined text-white text-xl">
                      {selectedUser.isVerified ? 'verified' : 'pending'}
                    </span>
                  </div>
                </div>

                <div className="flex-1 text-center md:text-left">
                  <h4 className="text-4xl font-headline font-black text-on-surface leading-tight">{selectedUser.firstName} {selectedUser.lastName}</h4>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-3">
                    <span className="px-4 py-1.5 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20">{selectedUser.role}</span>
                    <span className="h-1.5 w-1.5 bg-outline-variant rounded-full"></span>
                    <span className="text-on-surface-variant font-black text-sm tracking-tight">{selectedUser.department} • Batch {selectedUser.batch}</span>
                    <span className="h-1.5 w-1.5 bg-outline-variant rounded-full"></span>
                    <span className="text-primary font-black text-sm tracking-tight uppercase">{selectedUser.campus} Campus</span>
                  </div>
                </div>
              </div>

              {/* Mentor Ratings Section */}
              {selectedUser.role === 'Mentor' && (
                <div className="bg-secondary-fixed/10 border border-secondary-fixed/30 rounded-[32px] p-8 flex items-center justify-between">
                  <div className="flex flex-col">
                    <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em]">Community Reputation</p>
                    <h5 className="text-xl font-headline font-black text-primary mt-1">Mentor Star Rating</h5>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex text-secondary">
                      {Array(5).fill(0).map((_, i) => (
                        <span key={i} className={`material-symbols-outlined ${i < Math.round(selectedUser.averageRating) ? 'fill-1' : ''}`} style={{ fontVariationSettings: i < Math.round(selectedUser.averageRating) ? "'FILL' 1" : "'FILL' 0" }}>
                          star
                        </span>
                      ))}
                    </div>
                    <span className="text-3xl font-headline font-black text-primary">{selectedUser.averageRating || '0.0'}</span>
                    <span className="text-outline text-xs font-bold">({selectedUser.totalRatings || 0} reviews)</span>
                  </div>
                </div>
              )}

              {/* Data Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Academic Metrics */}
                <div className="space-y-4">
                  <h5 className="text-[10px] font-black text-outline uppercase tracking-[0.2em] ml-2">Academic Metrics</h5>
                  <div className="bg-white border border-outline-variant/30 rounded-[32px] p-6 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary">analytics</span>
                        <span className="text-sm font-bold text-on-surface-variant">Cumulative GPA</span>
                      </div>
                      <span className="text-xl font-headline font-black text-primary">{selectedUser.cgpa || 'N/A'}</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary">auto_stories</span>
                        <span className="text-sm font-bold text-on-surface-variant">Core Disciplines</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedUser.subjects && selectedUser.subjects.length > 0 ? (
                          selectedUser.subjects.map((sub, i) => (
                            <span key={i} className="px-3 py-1 bg-surface-container-high rounded-lg text-[10px] font-black uppercase tracking-wider text-primary">
                              {sub}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-outline italic">No subjects registered</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Communication Nodes */}
                <div className="space-y-4">
                  <h5 className="text-[10px] font-black text-outline uppercase tracking-[0.2em] ml-2">Communication Nodes</h5>
                  <div className="bg-white border border-outline-variant/30 rounded-[32px] p-6 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-xl">alternate_email</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black text-outline uppercase tracking-tighter">Institutional Email</p>
                        <p className="text-sm font-bold text-on-surface truncate">{selectedUser.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-xl">call</span>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-outline uppercase tracking-tighter">Verified Phone</p>
                        <p className="text-sm font-bold text-on-surface">{selectedUser.phoneNumber}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transcripts Section for Mentees */}
              {selectedUser.role === 'Mentee' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between ml-2">
                    <h5 className="text-[10px] font-black text-outline uppercase tracking-[0.2em]">Issued Transcripts</h5>
                    <button
                      onClick={() => showTranscripts ? setShowTranscripts(false) : fetchTranscripts(selectedUser._id)}
                      className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
                    >
                      {showTranscripts ? 'Hide Records' : 'Retrieve Records'}
                    </button>
                  </div>

                  {showTranscripts && (
                    <div className="bg-white border border-outline-variant/30 rounded-[32px] overflow-hidden">
                      {transcripts.length > 0 ? (
                        <div className="divide-y divide-outline-variant/20">
                          {transcripts.map((t) => (
                            <div key={t._id} className="p-6 hover:bg-surface-container-low transition-colors">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <p className="text-xs font-black text-primary uppercase tracking-tight">Issued by {t.mentor?.firstName} {t.mentor?.lastName}</p>
                                  <p className="text-[10px] text-outline font-bold mt-1">{new Date(t.createdAt).toLocaleDateString()}</p>
                                </div>
                                <span className="px-3 py-1 bg-primary text-white rounded-lg text-xs font-black">{t.academicGrade}</span>
                              </div>
                              <div className="grid grid-cols-2 gap-4 mt-4">
                                <div className="text-[10px] font-bold text-on-surface-variant flex items-center gap-2">
                                  <span className="material-symbols-outlined text-sm">stars</span> Behavior: {t.behaviorRating}/5
                                </div>
                                <div className="text-[10px] font-bold text-on-surface-variant flex items-center gap-2">
                                  <span className="material-symbols-outlined text-sm">schedule</span> Punctuality: {t.punctualityRating}/5
                                </div>
                              </div>
                              <p className="text-xs text-on-surface-variant mt-3 italic line-clamp-2">"{t.remarks}"</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-10 text-center text-outline text-sm font-medium">No transcripts found for this mentee.</div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* biographical stream */}
              <div className="space-y-4">
                <h5 className="text-[10px] font-black text-outline uppercase tracking-[0.2em] ml-2">Biographical Synthesis</h5>
                <div className="bg-surface-container-low p-8 rounded-[40px] border border-outline-variant/10">
                  <p className="text-sm text-on-surface-variant font-medium leading-relaxed italic">
                    "{selectedUser.about || "This member has not yet synthesized a personal biographical narrative within the system."}"
                  </p>
                </div>
              </div>

              {/* System Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-outline-variant/30 rounded-2xl p-4 flex flex-col items-center text-center">
                  <span className="material-symbols-outlined text-outline text-lg mb-1">hub</span>
                  <p className="text-[9px] font-black text-outline uppercase">Auth Provider</p>
                  <p className="text-xs font-bold text-primary uppercase tracking-widest">{selectedUser.authProvider}</p>
                </div>
                <div className="bg-white border border-outline-variant/30 rounded-2xl p-4 flex flex-col items-center text-center">
                  <span className="material-symbols-outlined text-outline text-lg mb-1">calendar_today</span>
                  <p className="text-[9px] font-black text-outline uppercase">Joined Date</p>
                  <p className="text-xs font-bold text-primary">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="bg-white border border-outline-variant/30 rounded-2xl p-4 flex flex-col items-center text-center">
                  <span className="material-symbols-outlined text-outline text-lg mb-1">history</span>
                  <p className="text-[9px] font-black text-outline uppercase">Last Activity</p>
                  <p className="text-xs font-bold text-primary">{new Date(selectedUser.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Actions & Documents */}
              <div className="flex flex-wrap gap-4 pt-6">
                <button
                  onClick={() => handleDeleteUser(selectedUser._id)}
                  className="px-6 py-4 bg-error-container text-error font-black rounded-2xl border border-error/20 hover:bg-error hover:text-white transition-all flex items-center justify-center gap-3 order-last md:order-none"
                >
                  <span className="material-symbols-outlined">delete_forever</span>
                  Purge Record
                </button>
                {!selectedUser.isApproved && (
                  <button 
                    onClick={() => handleApproveUser(selectedUser._id, selectedUser.isApproved)}
                    className="flex-1 text-white font-black py-4 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 bg-emerald-600 shadow-emerald-500/20"
                  >
                    <span className="material-symbols-outlined text-xl">
                      check_circle
                    </span>
                    Approve Mentor
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
