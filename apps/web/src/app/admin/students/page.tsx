'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '@/components/ui/ui-components';
import { adminUsersService, AdminUserRecord } from '@/services/admin/users.service';
import {
  Search,
  Plus,
  Lock,
  Unlock,
  CheckCircle2,
  KeyRound,
  UserCheck,
  UserX,
  Mail,
  Phone,
} from 'lucide-react';

export default function StudentDirectoryPage() {
  const [students, setStudents] = useState<AdminUserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProgramme, setSelectedProgramme] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newProgramme, setNewProgramme] = useState('IELTS Academic Intensive');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await adminUsersService.getUsers();
        const studentList = data.filter((u) => u.role === 'STUDENT' || !u.role);
        setStudents(studentList.length > 0 ? studentList : data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleTogglePractice = async (id: string) => {
    await adminUsersService.togglePracticeGate(id);
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, practiceUnlocked: !s.practiceUnlocked } : s))
    );
    showBanner('Practice gate access updated for student.');
  };

  const handleToggleMock = async (id: string) => {
    await adminUsersService.toggleMockGate(id);
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, mockUnlocked: !s.mockUnlocked } : s))
    );
    showBanner('Mock Exam gate access updated for student.');
  };

  const handleToggleStatus = async (s: AdminUserRecord) => {
    const nextStatus = s.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    await adminUsersService.updateUserStatus(
      s.id,
      nextStatus,
      nextStatus === 'SUSPENDED' ? 'Administrative suspension' : 'Access restored'
    );
    setStudents((prev) =>
      prev.map((item) => (item.id === s.id ? { ...item, status: nextStatus } : item))
    );
    showBanner(`Student account set to ${nextStatus}.`);
  };

  const handleResetPassword = async (name: string, id: string) => {
    await adminUsersService.initiatePasswordReset(id);
    showBanner(`Password reset link dispatched to ${name}.`);
  };

  const handleAddStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    const created = await adminUsersService.addStudent({
      name: newName,
      email: newEmail,
      phone: newPhone || '+44 7700 900000',
      role: 'STUDENT',
      status: 'ACTIVE',
      programme: newProgramme,
      practiceUnlocked: true,
      mockUnlocked: true,
    });

    setStudents((prev) => [created, ...prev]);
    setAddModalOpen(false);
    setNewName('');
    setNewEmail('');
    setNewPhone('');
    showBanner(`New student ${created.name} registered under ID ${created.registrationNumber}!`);
  };

  function showBanner(msg: string) {
    setBanner(msg);
    setTimeout(() => setBanner(null), 3500);
  }

  const filtered = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.registrationNumber &&
        s.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesProg = selectedProgramme === 'ALL' || s.programme === selectedProgramme;
    const matchesStatus = selectedStatus === 'ALL' || s.status === selectedStatus;

    return matchesSearch && matchesProg && matchesStatus;
  });

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
        <h3>Loading Live Student Directory Registry...</h3>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: '1.75rem',
              fontWeight: 800,
              color: '#f8fafc',
              letterSpacing: '-0.02em',
            }}
          >
            Live Student Directory & Journey Controls
          </h1>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: '#94a3b8' }}>
            Audit candidate profiles, manage prep programme enrollments, and toggle diagnostic/mock
            access gates.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setAddModalOpen(true)}
          style={{
            backgroundColor: '#2563eb',
            color: '#ffffff',
            gap: '0.5rem',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Plus size={16} />
          <span>Register New Student</span>
        </Button>
      </div>

      {banner && (
        <div
          style={{
            padding: '0.85rem 1.25rem',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            borderRadius: '8px',
            color: '#34d399',
            fontSize: '0.875rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <CheckCircle2 size={18} />
          <span>{banner}</span>
        </div>
      )}

      {/* Filter & Toolbar */}
      <Card
        style={{
          padding: '1.25rem',
          borderRadius: '14px',
          backgroundColor: '#151d30',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              backgroundColor: '#0f172a',
              border: '1px solid #1e293b',
              borderRadius: '8px',
              padding: '0.45rem 0.85rem',
              flex: 1,
              minWidth: '240px',
            }}
          >
            <Search size={16} color="#94a3b8" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name, email, or registration ID..."
              style={{
                background: 'none',
                border: 'none',
                color: '#f8fafc',
                outline: 'none',
                width: '100%',
                fontSize: '0.875rem',
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>
                Programme:
              </span>
              <select
                value={selectedProgramme}
                onChange={(e) => setSelectedProgramme(e.target.value)}
                style={{
                  padding: '0.45rem 0.75rem',
                  borderRadius: '6px',
                  backgroundColor: '#0f172a',
                  border: '1px solid #1e293b',
                  color: '#38bdf8',
                  fontSize: '0.825rem',
                  fontWeight: 700,
                }}
              >
                <option value="ALL">All Programmes</option>
                <option value="IELTS Academic Intensive">IELTS Academic Intensive</option>
                <option value="TOEFL iBT Mastery">TOEFL iBT Mastery</option>
                <option value="SAT Academic Preparation">SAT Preparation</option>
                <option value="CELPIP General Coaching">CELPIP Coaching</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>
                Account Status:
              </span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                style={{
                  padding: '0.45rem 0.75rem',
                  borderRadius: '6px',
                  backgroundColor: '#0f172a',
                  border: '1px solid #1e293b',
                  color: '#f8fafc',
                  fontSize: '0.825rem',
                }}
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Directory Data Table */}
      <Card
        style={{
          padding: '1.25rem',
          borderRadius: '16px',
          backgroundColor: '#151d30',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.875rem',
            color: '#f8fafc',
          }}
        >
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', textAlign: 'left' }}>
              <th style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>Student & Reg Number</th>
              <th style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>Contact Info</th>
              <th style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>Enrolled Programme</th>
              <th style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>Status</th>
              <th style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>Access Gates</th>
              <th style={{ padding: '0.75rem 1rem', color: '#94a3b8', textAlign: 'right' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                  No students found matching your search or filter criteria.
                </td>
              </tr>
            ) : (
              filtered.map((s) => (
                <tr key={s.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ fontWeight: 700, color: '#f8fafc' }}>{s.name}</div>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: '#38bdf8',
                        marginTop: '2px',
                        fontWeight: 600,
                      }}
                    >
                      Reg ID: {s.registrationNumber || s.id}
                    </div>
                  </td>

                  <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: '#cbd5e1' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Mail size={12} color="#94a3b8" />
                      <span>{s.email}</span>
                    </div>
                    {s.phone && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          marginTop: '2px',
                          color: '#94a3b8',
                        }}
                      >
                        <Phone size={12} color="#94a3b8" />
                        <span>{s.phone}</span>
                      </div>
                    )}
                  </td>

                  <td style={{ padding: '0.85rem 1rem' }}>
                    <Badge variant="info">{s.programme || 'IELTS Prep'}</Badge>
                  </td>

                  <td style={{ padding: '0.85rem 1rem' }}>
                    <Badge variant={s.status === 'ACTIVE' ? 'success' : 'danger'}>{s.status}</Badge>
                  </td>

                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Button
                        variant="secondary"
                        onClick={() => handleTogglePractice(s.id)}
                        style={{
                          padding: '0.3rem 0.55rem',
                          fontSize: '0.75rem',
                          backgroundColor: s.practiceUnlocked
                            ? 'rgba(52, 211, 153, 0.15)'
                            : 'rgba(255, 255, 255, 0.05)',
                          color: s.practiceUnlocked ? '#34d399' : '#94a3b8',
                          borderColor: s.practiceUnlocked
                            ? 'rgba(52, 211, 153, 0.3)'
                            : 'rgba(255, 255, 255, 0.1)',
                          gap: '0.3rem',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        {s.practiceUnlocked ? <Unlock size={12} /> : <Lock size={12} />}
                        <span>Practice</span>
                      </Button>

                      <Button
                        variant="secondary"
                        onClick={() => handleToggleMock(s.id)}
                        style={{
                          padding: '0.3rem 0.55rem',
                          fontSize: '0.75rem',
                          backgroundColor: s.mockUnlocked
                            ? 'rgba(167, 139, 250, 0.15)'
                            : 'rgba(255, 255, 255, 0.05)',
                          color: s.mockUnlocked ? '#a78bfa' : '#94a3b8',
                          borderColor: s.mockUnlocked
                            ? 'rgba(167, 139, 250, 0.3)'
                            : 'rgba(255, 255, 255, 0.1)',
                          gap: '0.3rem',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        {s.mockUnlocked ? <Unlock size={12} /> : <Lock size={12} />}
                        <span>Mock</span>
                      </Button>
                    </div>
                  </td>

                  <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                      <Button
                        variant="secondary"
                        onClick={() => handleResetPassword(s.name, s.id)}
                        style={{
                          padding: '0.35rem 0.6rem',
                          fontSize: '0.75rem',
                          gap: '0.3rem',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <KeyRound size={14} color="#60a5fa" /> Reset Pass
                      </Button>

                      <Button
                        variant="secondary"
                        onClick={() => handleToggleStatus(s)}
                        style={{
                          padding: '0.35rem 0.6rem',
                          fontSize: '0.75rem',
                          color: s.status === 'ACTIVE' ? '#f87171' : '#34d399',
                          borderColor:
                            s.status === 'ACTIVE'
                              ? 'rgba(239, 68, 68, 0.3)'
                              : 'rgba(52, 211, 153, 0.3)',
                          gap: '0.3rem',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        {s.status === 'ACTIVE' ? <UserX size={14} /> : <UserCheck size={14} />}
                        <span>{s.status === 'ACTIVE' ? 'Suspend' : 'Activate'}</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      {/* REGISTER NEW STUDENT MODAL */}
      {addModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(2, 6, 23, 0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 100,
            padding: '1.5rem',
          }}
          onClick={() => setAddModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#111827',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              maxWidth: '520px',
              width: '100%',
              padding: '2rem',
              boxSizing: 'border-box',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              style={{
                margin: '0 0 1.25rem',
                fontSize: '1.35rem',
                fontWeight: 800,
                color: '#ffffff',
              }}
            >
              Register New Student Candidate
            </h2>

            <form
              onSubmit={handleAddStudentSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
            >
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: '#cbd5e1',
                    marginBottom: '0.35rem',
                  }}
                >
                  Full Candidate Name *
                </label>
                <input
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. David Miller"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    backgroundColor: '#161e2e',
                    border: '1px solid #1e293b',
                    color: '#ffffff',
                    fontSize: '0.875rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: '#cbd5e1',
                    marginBottom: '0.35rem',
                  }}
                >
                  Email Address *
                </label>
                <input
                  required
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. david.miller@example.com"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    backgroundColor: '#161e2e',
                    border: '1px solid #1e293b',
                    color: '#ffffff',
                    fontSize: '0.875rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: '#cbd5e1',
                    marginBottom: '0.35rem',
                  }}
                >
                  Phone Contact
                </label>
                <input
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="e.g. +44 7700 900123"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    backgroundColor: '#161e2e',
                    border: '1px solid #1e293b',
                    color: '#ffffff',
                    fontSize: '0.875rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: '#cbd5e1',
                    marginBottom: '0.35rem',
                  }}
                >
                  Enrolled Prep Programme *
                </label>
                <select
                  value={newProgramme}
                  onChange={(e) => setNewProgramme(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    backgroundColor: '#161e2e',
                    border: '1px solid #1e293b',
                    color: '#ffffff',
                    fontSize: '0.875rem',
                    outline: 'none',
                  }}
                >
                  <option value="IELTS Academic Intensive">IELTS Academic Intensive</option>
                  <option value="TOEFL iBT Mastery">TOEFL iBT Mastery</option>
                  <option value="SAT Academic Preparation">SAT Academic Preparation</option>
                  <option value="CELPIP General Coaching">CELPIP General Coaching</option>
                </select>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.75rem',
                  marginTop: '0.5rem',
                }}
              >
                <Button variant="secondary" type="button" onClick={() => setAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  style={{ backgroundColor: '#2563eb', color: '#ffffff' }}
                >
                  Register Student
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
