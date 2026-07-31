'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  Eye,
  Edit3,
  UserPlus,
  CreditCard,
  GraduationCap,
} from 'lucide-react';

export default function StudentDirectoryPage() {
  const router = useRouter();
  const [students, setStudents] = useState<AdminUserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProgramme, setSelectedProgramme] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Register Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newProgramme, setNewProgramme] = useState('IELTS Academic Intensive');
  const [newCohort, setNewCohort] = useState('2026 Q3 Cohort A');
  const [newPaymentStatus, setNewPaymentStatus] = useState<'PAID' | 'PENDING' | 'COMPLETED' | 'OVERDUE'>('PAID');

  // Edit Modal
  const [editingStudent, setEditingStudent] = useState<AdminUserRecord | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await adminUsersService.getUsers();
      // Only show students or all users
      const studentList = data.filter((u) => u.role === 'STUDENT' || !u.role);
      setStudents(studentList.length > 0 ? studentList : data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTogglePractice = async (id: string) => {
    await adminUsersService.togglePracticeGate(id);
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, practiceUnlocked: !s.practiceUnlocked } : s))
    );
    showBanner('Practice Gate access status updated.');
  };

  const handleToggleMock = async (id: string) => {
    await adminUsersService.toggleMockGate(id);
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, mockUnlocked: !s.mockUnlocked } : s))
    );
    showBanner('Mock Exam Gate access status updated.');
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
    showBanner(`Password reset dispatch initiated for ${name}.`);
  };

  const handleAddStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    const created = await adminUsersService.addStudent({
      name: newName,
      email: newEmail,
      phone: newPhone || '+234 803 000 0000',
      role: 'STUDENT',
      status: 'ACTIVE',
      paymentStatus: newPaymentStatus,
      programme: newProgramme,
      cohort: newCohort,
      progressPercent: 15,
      practiceUnlocked: true,
      mockUnlocked: true,
    });

    setStudents((prev) => [created, ...prev]);
    setAddModalOpen(false);
    setNewName('');
    setNewEmail('');
    setNewPhone('');
    showBanner(`Student candidate ${created.name} registered under ID ${created.registrationNumber}!`);
  };

  const handleEditStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    await adminUsersService.updateStudent(editingStudent.id, editingStudent);
    setStudents((prev) => prev.map((s) => (s.id === editingStudent.id ? editingStudent : s)));
    setEditingStudent(null);
    showBanner(`Updated details for candidate ${editingStudent.name}.`);
  };

  function showBanner(msg: string) {
    setBanner(msg);
    setTimeout(() => setBanner(null), 3500);
  }

  // Multi-field search across Student Name, Reg ID, Email, Phone, Programme
  const filtered = students.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      (s.phone && s.phone.toLowerCase().includes(q)) ||
      (s.registrationNumber && s.registrationNumber.toLowerCase().includes(q)) ||
      (s.programme && s.programme.toLowerCase().includes(q));

    const matchesProg = selectedProgramme === 'ALL' || s.programme === selectedProgramme;
    const matchesStatus = selectedStatus === 'ALL' || s.status === selectedStatus;

    return matchesSearch && matchesProg && matchesStatus;
  });

  if (loading) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#94a3b8' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Querying Live Registration Repository...</h3>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.75rem',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Page Header */}
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
            Student Directory
          </h1>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: '#94a3b8' }}>
            Live candidate database — audit registrations, cohort assignments, and access gates.
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
            fontWeight: 600,
            padding: '0.6rem 1.1rem',
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

      {/* Control Bar: Multi-field Search & Filters */}
      <Card
        style={{
          padding: '1.25rem',
          borderRadius: '12px',
          backgroundColor: '#111827',
          border: '1px solid rgba(255, 255, 255, 0.06)',
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
          {/* Multi-field search box */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              backgroundColor: '#1e293b',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '8px',
              padding: '0.5rem 0.85rem',
              flex: 1,
              minWidth: '280px',
            }}
          >
            <Search size={16} color="#94a3b8" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name, ID, email, phone, or programme..."
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

          {/* Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
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
                  backgroundColor: '#1e293b',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: '#38bdf8',
                  fontSize: '0.825rem',
                  fontWeight: 700,
                }}
              >
                <option value="ALL">All Programmes</option>
                <option value="IELTS Academic">IELTS Academic</option>
                <option value="IELTS General Training">IELTS General Training</option>
                <option value="TOEFL iBT">TOEFL iBT</option>
                <option value="Digital SAT">Digital SAT</option>
                <option value="CELPIP General">CELPIP General</option>
                <option value="English Proficiency">English Proficiency</option>
                <option value="UNASSIGNED">Unassigned</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>
                Status:
              </span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                style={{
                  padding: '0.45rem 0.75rem',
                  borderRadius: '6px',
                  backgroundColor: '#1e293b',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: '#f8fafc',
                  fontSize: '0.825rem',
                }}
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="PENDING">Pending</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Directory Data Table OR Empty State */}
      {students.length === 0 ? (
        <Card
          style={{
            padding: '4rem 2rem',
            borderRadius: '14px',
            backgroundColor: '#111827',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.25rem',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#3b82f6',
            }}
          >
            <UserPlus size={32} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
              No students have been registered yet.
            </h3>
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', color: '#94a3b8', maxWidth: '440px' }}>
              Register your first student candidate to begin operational management, cohort placement, and assessment tracking.
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => setAddModalOpen(true)}
            style={{ backgroundColor: '#2563eb', color: '#ffffff', gap: '0.5rem', marginTop: '0.5rem' }}
          >
            <Plus size={16} />
            <span>Register First Student</span>
          </Button>
        </Card>
      ) : (
        <Card
          style={{
            padding: 0,
            borderRadius: '14px',
            backgroundColor: '#111827',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            overflow: 'hidden',
          }}
        >
          <div style={{ width: '100%', overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.85rem',
                color: '#f8fafc',
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: '#1F2937',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                    textAlign: 'left',
                  }}
                >
                  <th style={{ padding: '0.85rem 1rem', color: '#94a3b8', fontWeight: 700, width: '130px' }}>Registration ID</th>
                  <th style={{ padding: '0.85rem 1rem', color: '#94a3b8', fontWeight: 700, minWidth: '160px' }}>Student & Progress</th>
                  <th style={{ padding: '0.85rem 1rem', color: '#94a3b8', fontWeight: 700, minWidth: '180px' }}>Contact Info</th>
                  <th style={{ padding: '0.85rem 1rem', color: '#94a3b8', fontWeight: 700, minWidth: '160px' }}>Programme & Cohort</th>
                  <th style={{ padding: '0.85rem 1rem', color: '#94a3b8', fontWeight: 700, width: '100px' }}>Status</th>
                  <th style={{ padding: '0.85rem 1rem', color: '#94a3b8', fontWeight: 700, width: '170px' }}>Gates</th>
                  <th style={{ padding: '0.85rem 1rem', color: '#94a3b8', fontWeight: 700, textAlign: 'right', width: '240px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '3rem 1rem', textAlign: 'center', color: '#94a3b8' }}>
                      No student candidates match your current search or filter query.
                    </td>
                  </tr>
                ) : (
                  filtered.map((s) => {
                    const progress = s.progressPercent ?? 0;
                    return (
                      <tr
                        key={s.id}
                        style={{
                          borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                          backgroundColor: '#111827',
                          transition: 'background-color 150ms ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1E293B')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#111827')}
                      >
                        {/* Registration ID */}
                        <td style={{ padding: '1rem', fontWeight: 700, color: '#38bdf8', whiteSpace: 'nowrap' }}>
                          {s.registrationNumber || s.id}
                        </td>

                        {/* Student & Progress Bar */}
                        <td style={{ padding: '1rem', minWidth: '160px' }}>
                          <Link
                            href={`/admin/students/${s.id}`}
                            style={{
                              fontWeight: 700,
                              color: '#f8fafc',
                              textDecoration: 'none',
                              fontSize: '0.9rem',
                            }}
                          >
                            {s.name}
                          </Link>
                          {/* Progress Bar Indicator */}
                          <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div
                              style={{
                                flex: 1,
                                height: '6px',
                                backgroundColor: '#1e293b',
                                borderRadius: '3px',
                                overflow: 'hidden',
                              }}
                            >
                              <div
                                style={{
                                  width: `${progress}%`,
                                  height: '100%',
                                  backgroundColor: progress > 70 ? '#34d399' : progress > 40 ? '#60a5fa' : '#f59e0b',
                                  borderRadius: '3px',
                                }}
                              />
                            </div>
                            <span style={{ fontSize: '0.725rem', fontWeight: 700, color: '#94a3b8' }}>
                              {progress}%
                            </span>
                          </div>
                        </td>

                        {/* Contact Info */}
                        <td style={{ padding: '1rem', fontSize: '0.8rem', color: '#cbd5e1', minWidth: '180px' }}>
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
                                marginTop: '3px',
                                color: '#94a3b8',
                              }}
                            >
                              <Phone size={12} color="#94a3b8" />
                              <span>{s.phone}</span>
                            </div>
                          )}
                        </td>

                        {/* Programme & Cohort */}
                        <td style={{ padding: '1rem', minWidth: '160px' }}>
                          <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.825rem' }}>
                            {s.programme || 'UNASSIGNED'}
                          </div>
                          <div style={{ fontSize: '0.725rem', color: '#94a3b8', marginTop: '2px' }}>
                            {s.cohort || 'UNASSIGNED'}
                          </div>
                        </td>

                        {/* Status */}
                        <td style={{ padding: '1rem' }}>
                          <Badge
                            variant={
                              s.status === 'ACTIVE' ? 'success' : s.status === 'SUSPENDED' ? 'danger' : 'warning'
                            }
                          >
                            {s.status}
                          </Badge>
                        </td>

                        {/* Gate Controls */}
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', gap: '0.35rem' }}>
                            <button
                              onClick={() => handleTogglePractice(s.id)}
                              title="Toggle Practice Gate"
                              style={{
                                padding: '0.25rem 0.45rem',
                                fontSize: '0.725rem',
                                borderRadius: '6px',
                                backgroundColor: s.practiceUnlocked
                                  ? 'rgba(52, 211, 153, 0.15)'
                                  : 'rgba(255, 255, 255, 0.05)',
                                color: s.practiceUnlocked ? '#34d399' : '#94a3b8',
                                border: `1px solid ${
                                  s.practiceUnlocked ? 'rgba(52, 211, 153, 0.3)' : 'rgba(255, 255, 255, 0.1)'
                                }`,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.2rem',
                              }}
                            >
                              {s.practiceUnlocked ? <Unlock size={11} /> : <Lock size={11} />}
                              Practice
                            </button>

                            <button
                              onClick={() => handleToggleMock(s.id)}
                              title="Toggle Mock Exam Gate"
                              style={{
                                padding: '0.25rem 0.45rem',
                                fontSize: '0.725rem',
                                borderRadius: '6px',
                                backgroundColor: s.mockUnlocked
                                  ? 'rgba(167, 139, 250, 0.15)'
                                  : 'rgba(255, 255, 255, 0.05)',
                                color: s.mockUnlocked ? '#a78bfa' : '#94a3b8',
                                border: `1px solid ${
                                  s.mockUnlocked ? 'rgba(167, 139, 250, 0.3)' : 'rgba(255, 255, 255, 0.1)'
                                }`,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.2rem',
                              }}
                            >
                              {s.mockUnlocked ? <Unlock size={11} /> : <Lock size={11} />}
                              Mock
                            </button>
                          </div>
                        </td>

                        {/* Actions: View, Edit, Reset Password, Suspend */}
                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.3rem', alignItems: 'center' }}>
                            {/* View Action */}
                            <Link
                              href={`/admin/students/${s.id}`}
                              style={{
                                padding: '0.3rem 0.5rem',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                borderRadius: '6px',
                                backgroundColor: '#1e293b',
                                color: '#38bdf8',
                                border: '1px solid rgba(56, 189, 248, 0.3)',
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.2rem',
                              }}
                            >
                              <Eye size={11} />
                              View
                            </Link>

                            {/* Edit Action */}
                            <button
                              onClick={() => setEditingStudent(s)}
                              style={{
                                padding: '0.3rem 0.5rem',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                borderRadius: '6px',
                                backgroundColor: '#1e293b',
                                color: '#cbd5e1',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.2rem',
                              }}
                            >
                              <Edit3 size={11} />
                              Edit
                            </button>

                            {/* Reset Password */}
                            <button
                              onClick={() => handleResetPassword(s.name, s.id)}
                              style={{
                                padding: '0.3rem 0.5rem',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                borderRadius: '6px',
                                backgroundColor: '#1e293b',
                                color: '#60a5fa',
                                border: '1px solid rgba(96, 165, 250, 0.3)',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.2rem',
                              }}
                            >
                              <KeyRound size={11} />
                              Reset
                            </button>

                            {/* Suspend / Activate */}
                            <button
                              onClick={() => handleToggleStatus(s)}
                              style={{
                                padding: '0.3rem 0.5rem',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                borderRadius: '6px',
                                backgroundColor: '#1e293b',
                                color: s.status === 'ACTIVE' ? '#f87171' : '#34d399',
                                border: `1px solid ${
                                  s.status === 'ACTIVE' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(52, 211, 153, 0.3)'
                                }`,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.2rem',
                              }}
                            >
                              {s.status === 'ACTIVE' ? <UserX size={11} /> : <UserCheck size={11} />}
                              {s.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* REGISTER NEW STUDENT MODAL */}
      {addModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(2, 6, 23, 0.85)',
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
              maxWidth: '540px',
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
              Register Candidate Student
            </h2>

            <form
              onSubmit={handleAddStudentSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
            >
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                  Full Candidate Name *
                </label>
                <input
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. John Doe"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    backgroundColor: '#1e293b',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                    fontSize: '0.875rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                    Email Address *
                  </label>
                  <input
                    required
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="john.doe@example.com"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      backgroundColor: '#1e293b',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#ffffff',
                      fontSize: '0.875rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                    Phone Contact
                  </label>
                  <input
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+234 803 123 4567"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      backgroundColor: '#1e293b',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#ffffff',
                      fontSize: '0.875rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                    Enrolled Programme *
                  </label>
                  <select
                    value={newProgramme}
                    onChange={(e) => setNewProgramme(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      backgroundColor: '#1e293b',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#ffffff',
                      fontSize: '0.875rem',
                      outline: 'none',
                    }}
                  >
                    <option value="IELTS Academic Intensive">IELTS Academic</option>
                    <option value="TOEFL iBT Mastery">TOEFL iBT</option>
                    <option value="SAT Academic Preparation">SAT Prep</option>
                    <option value="CELPIP General Coaching">CELPIP Coaching</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                    Current Cohort
                  </label>
                  <input
                    value={newCohort}
                    onChange={(e) => setNewCohort(e.target.value)}
                    placeholder="2026 Q3 Cohort A"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      backgroundColor: '#1e293b',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#ffffff',
                      fontSize: '0.875rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>



              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <Button variant="secondary" type="button" onClick={() => setAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" style={{ backgroundColor: '#2563eb', color: '#ffffff' }}>
                  Complete Registration
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT STUDENT MODAL */}
      {editingStudent && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(2, 6, 23, 0.85)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 100,
            padding: '1.5rem',
          }}
          onClick={() => setEditingStudent(null)}
        >
          <div
            style={{
              backgroundColor: '#111827',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              maxWidth: '540px',
              width: '100%',
              padding: '2rem',
              boxSizing: 'border-box',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ margin: '0 0 1.25rem', fontSize: '1.35rem', fontWeight: 800, color: '#ffffff' }}>
              Edit Candidate Details ({editingStudent.registrationNumber})
            </h2>

            <form onSubmit={handleEditStudentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                  Full Name
                </label>
                <input
                  required
                  value={editingStudent.name}
                  onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    backgroundColor: '#1e293b',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                    fontSize: '0.875rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                    Email
                  </label>
                  <input
                    required
                    type="email"
                    value={editingStudent.email}
                    onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      backgroundColor: '#1e293b',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#ffffff',
                      fontSize: '0.875rem',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                    Phone
                  </label>
                  <input
                    value={editingStudent.phone || ''}
                    onChange={(e) => setEditingStudent({ ...editingStudent, phone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      backgroundColor: '#1e293b',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#ffffff',
                      fontSize: '0.875rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                    Programme
                  </label>
                  <input
                    value={editingStudent.programme}
                    onChange={(e) => setEditingStudent({ ...editingStudent, programme: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      backgroundColor: '#1e293b',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#ffffff',
                      fontSize: '0.875rem',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                    Cohort
                  </label>
                  <input
                    value={editingStudent.cohort || ''}
                    onChange={(e) => setEditingStudent({ ...editingStudent, cohort: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      backgroundColor: '#1e293b',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#ffffff',
                      fontSize: '0.875rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>



              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <Button variant="secondary" type="button" onClick={() => setEditingStudent(null)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" style={{ backgroundColor: '#2563eb', color: '#ffffff' }}>
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
