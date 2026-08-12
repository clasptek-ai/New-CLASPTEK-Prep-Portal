'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
  Eye,
  Edit3,
  MoreVertical,
  UserPlus,
} from 'lucide-react';

export default function StudentDirectoryPage() {
  const [students, setStudents] = useState<AdminUserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProgramme, setSelectedProgramme] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Active Row Action Popover Menu ID
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Register Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newProgramme, setNewProgramme] = useState('IELTS Academic');
  const [newCohort, setNewCohort] = useState('UNASSIGNED');
  const [newPaymentStatus] = useState<'PAID' | 'PENDING' | 'COMPLETED' | 'OVERDUE'>('PAID');

  // Edit Modal
  const [editingStudent, setEditingStudent] = useState<AdminUserRecord | null>(null);

  // Delete Confirmation Modal
  const [deletingStudent, setDeletingStudent] = useState<AdminUserRecord | null>(null);

  const loadData = async () => {
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
  };

  useEffect(() => {
    loadData();
  }, []);

  // Close active action popover menu on click outside
  useEffect(() => {
    function handleClickOutside() {
      if (activeMenuId) setActiveMenuId(null);
    }
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [activeMenuId]);

  const handleTogglePractice = async (id: string) => {
    await adminUsersService.togglePracticeGate(id);
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, practiceUnlocked: !s.practiceUnlocked } : s))
    );
    showBanner('Practice Gate access status updated.');
    setActiveMenuId(null);
  };

  const handleToggleMock = async (id: string) => {
    await adminUsersService.toggleMockGate(id);
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, mockUnlocked: !s.mockUnlocked } : s))
    );
    showBanner('Mock Exam Gate access status updated.');
    setActiveMenuId(null);
  };

  const handleToggleStatus = async (s: AdminUserRecord) => {
    const nextStatus = s.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    const success = await adminUsersService.updateUserStatus(
      s.id,
      nextStatus,
      nextStatus === 'SUSPENDED' ? 'Administrative suspension' : 'Access restored'
    );
    if (success) {
      setStudents((prev) =>
        prev.map((item) => (item.id === s.id ? { ...item, status: nextStatus } : item))
      );
      showBanner(`Student candidate status set to ${nextStatus}.`);
    } else {
      showBanner(`Failed to update candidate status for ${s.name}. Please try again.`);
    }
    setActiveMenuId(null);
  };

  const handleResetPassword = async (name: string, id: string) => {
    const success = await adminUsersService.initiatePasswordReset(id);
    if (success) {
      showBanner(`Password reset dispatch initiated for ${name}.`);
    } else {
      showBanner(`Failed to initiate password reset for ${name}.`);
    }
    setActiveMenuId(null);
  };

  const handleResendVerification = async (name: string, id: string) => {
    const success = await adminUsersService.resendVerification(id);
    if (success) {
      showBanner(`Verification email resent to ${name}.`);
    } else {
      showBanner(
        `Unable to resend verification email for ${name}. Account may already be verified.`
      );
    }
    setActiveMenuId(null);
  };

  const handleForceLogout = async (name: string, id: string) => {
    const success = await adminUsersService.forceLogout(id);
    if (success) {
      showBanner(`Force logout executed for ${name}. Active session tokens invalidated.`);
    } else {
      showBanner(`Failed to execute force logout for ${name}.`);
    }
    setActiveMenuId(null);
  };

  const handleUnlockAccount = async (name: string, id: string) => {
    const success = await adminUsersService.unlockAccount(id);
    if (success) {
      showBanner(`Account lockout cleared for ${name}. Candidate can log in immediately.`);
    } else {
      showBanner(`Failed to clear account lockout for ${name}.`);
    }
    setActiveMenuId(null);
  };

  const handleDeleteStudent = (s: AdminUserRecord) => {
    setDeletingStudent(s);
    setActiveMenuId(null);
  };

  const confirmDeleteStudent = async (s: AdminUserRecord) => {
    setDeletingStudent(null);
    const res = await adminUsersService.deleteStudent(s.id);
    if (res.success || res.code === 'ALREADY_DELETED') {
      setStudents((prev) => prev.filter((item) => item.id !== s.id));
      showBanner(
        res.code === 'ALREADY_DELETED'
          ? 'Student account was already removed.'
          : 'Student account deleted successfully.'
      );
      loadData();
    } else if (res.code === 'USER_NOT_FOUND') {
      setStudents((prev) => prev.filter((item) => item.id !== s.id));
      showBanner('Student account could not be found.');
      loadData();
    } else {
      showBanner(res.message || 'Unable to delete this student. Please try again.');
    }
  };

  const handleRestoreStudent = async (s: AdminUserRecord) => {
    const success = await adminUsersService.restoreStudent(s.id);
    if (success) {
      setStudents((prev) =>
        prev.map((item) => (item.id === s.id ? { ...item, status: 'ACTIVE' } : item))
      );
      showBanner(`Student candidate ${s.name} restored to ACTIVE status.`);
    } else {
      showBanner(`Failed to restore student candidate ${s.name}.`);
    }
    setActiveMenuId(null);
  };

  const handleAddStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    const created = await adminUsersService.addStudent({
      name: newName,
      email: newEmail,
      phone: newPhone || 'NOT RECORDED',
      role: 'STUDENT',
      status: 'ACTIVE',
      paymentStatus: newPaymentStatus,
      programme: newProgramme,
      cohort: newCohort,
      progressPercent: 0,
      practiceUnlocked: true,
      mockUnlocked: true,
    });

    setStudents((prev) => [created, ...prev]);
    setAddModalOpen(false);
    setNewName('');
    setNewEmail('');
    setNewPhone('');
    showBanner(
      `Student candidate ${created.name} registered under ID ${created.registrationNumber}!`
    );
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

  // Search & filter
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
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>
          Querying Live Registration Repository...
        </h3>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        width: '100%',
        maxWidth: '1600px',
        minWidth: 0,
        margin: '0 auto',
        boxSizing: 'border-box',
      }}
    >
      {/* 1. Page Header — Single row alignment: Title + Description (left), Register button (right) */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: '1.65rem',
              fontWeight: 800,
              color: '#f8fafc',
              letterSpacing: '-0.02em',
            }}
          >
            Student Directory
          </h1>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
            Live candidate database — audit registrations, target exam assignments, and access
            gates.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setAddModalOpen(true)}
          style={{
            backgroundColor: '#2563eb',
            color: '#ffffff',
            gap: '0.5rem',
            display: 'inline-flex',
            alignItems: 'center',
            fontWeight: 600,
            padding: '0.6rem 1.15rem',
            borderRadius: '10px',
            fontSize: '0.875rem',
            height: '40px',
          }}
        >
          <Plus size={16} />
          <span>Register Student</span>
        </Button>
      </div>

      {banner && (
        <div
          style={{
            padding: '0.75rem 1.15rem',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            borderRadius: '10px',
            color: '#34d399',
            fontSize: '0.85rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <CheckCircle2 size={16} />
          <span>{banner}</span>
        </div>
      )}

      {/* 2. Unified Search & Filters Toolbar */}
      <Card
        style={{
          padding: '0.85rem 1.15rem',
          borderRadius: '14px',
          backgroundColor: '#0f172a',
          border: '1px solid #1e293b',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          {/* Multi-field search box */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              backgroundColor: '#161e2e',
              border: '1px solid #1e293b',
              borderRadius: '8px',
              padding: '0 0.85rem',
              height: '38px',
              flex: 1,
              minWidth: '260px',
            }}
          >
            <Search size={15} color="#94a3b8" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search candidate name, ID, email, phone, or programme..."
              style={{
                background: 'none',
                border: 'none',
                color: '#f8fafc',
                outline: 'none',
                width: '100%',
                fontSize: '0.85rem',
              }}
            />
          </div>

          {/* Filter Dropdowns */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
            <select
              value={selectedProgramme}
              onChange={(e) => setSelectedProgramme(e.target.value)}
              style={{
                height: '38px',
                padding: '0 0.85rem',
                borderRadius: '8px',
                backgroundColor: '#161e2e',
                border: '1px solid #1e293b',
                color: '#38bdf8',
                fontSize: '0.825rem',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer',
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

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{
                height: '38px',
                padding: '0 0.85rem',
                borderRadius: '8px',
                backgroundColor: '#161e2e',
                border: '1px solid #1e293b',
                color: '#f8fafc',
                fontSize: '0.825rem',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>
        </div>
      </Card>

      {/* 3. Streamlined Student Data Table */}
      {students.length === 0 ? (
        <Card
          style={{
            padding: '4rem 2rem',
            borderRadius: '16px',
            backgroundColor: '#0f172a',
            border: '1px solid #1e293b',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.25rem',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'rgba(59, 130, 246, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#3b82f6',
            }}
          >
            <UserPlus size={28} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc' }}>
              No students found
            </h3>
            <p
              style={{
                margin: '0.4rem 0 0',
                fontSize: '0.875rem',
                color: '#94a3b8',
                maxWidth: '420px',
              }}
            >
              Register candidate students to begin operational management, cohort placement, and
              assessment tracking.
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => setAddModalOpen(true)}
            style={{
              backgroundColor: '#2563eb',
              color: '#ffffff',
              gap: '0.5rem',
              marginTop: '0.5rem',
            }}
          >
            <Plus size={16} />
            <span>Register First Student</span>
          </Button>
        </Card>
      ) : (
        <Card
          style={{
            padding: 0,
            borderRadius: '16px',
            backgroundColor: '#0f172a',
            border: '1px solid #1e293b',
            width: '100%',
            minWidth: 0,
            maxWidth: '100%',
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
          }}
        >
          <div
            style={{
              width: '100%',
              minWidth: 0,
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            <table
              style={{
                width: '100%',
                minWidth: '780px',
                borderCollapse: 'collapse',
                fontSize: '0.85rem',
                color: '#f8fafc',
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: '#161e2e',
                    borderBottom: '1px solid #1e293b',
                    textAlign: 'left',
                  }}
                >
                  <th
                    style={{
                      padding: '0.9rem 1.15rem',
                      color: '#94a3b8',
                      fontWeight: 700,
                      width: '130px',
                    }}
                  >
                    Registration ID
                  </th>
                  <th
                    style={{
                      padding: '0.9rem 1.15rem',
                      color: '#94a3b8',
                      fontWeight: 700,
                      minWidth: '180px',
                    }}
                  >
                    Student
                  </th>
                  <th
                    style={{
                      padding: '0.9rem 1.15rem',
                      color: '#94a3b8',
                      fontWeight: 700,
                      minWidth: '140px',
                    }}
                  >
                    Phone
                  </th>
                  <th
                    style={{
                      padding: '0.9rem 1.15rem',
                      color: '#94a3b8',
                      fontWeight: 700,
                      minWidth: '150px',
                    }}
                  >
                    Programme
                  </th>
                  <th
                    style={{
                      padding: '0.9rem 1.15rem',
                      color: '#94a3b8',
                      fontWeight: 700,
                      width: '110px',
                    }}
                  >
                    Status
                  </th>
                  <th
                    style={{
                      padding: '0.9rem 1.15rem',
                      color: '#94a3b8',
                      fontWeight: 700,
                      width: '130px',
                    }}
                  >
                    Progress
                  </th>
                  <th
                    style={{
                      padding: '0.9rem 1.15rem',
                      color: '#94a3b8',
                      fontWeight: 700,
                      textAlign: 'right',
                      width: '140px',
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      style={{ padding: '3rem 1rem', textAlign: 'center', color: '#94a3b8' }}
                    >
                      No student candidates match your search or filter query.
                    </td>
                  </tr>
                ) : (
                  filtered.map((s) => {
                    const progress = s.progressPercent ?? 0;
                    const isMenuOpen = activeMenuId === s.id;

                    return (
                      <tr
                        key={s.id}
                        style={{
                          borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                          backgroundColor: '#0f172a',
                          transition: 'background-color 150ms ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#161e2e')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0f172a')}
                      >
                        {/* 1. Registration ID */}
                        <td
                          style={{
                            padding: '0.9rem 1.15rem',
                            fontWeight: 700,
                            color: '#38bdf8',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {s.registrationNumber || s.id}
                        </td>

                        {/* 2. Student (Name + Email) */}
                        <td
                          style={{
                            padding: '0.9rem 1.15rem',
                            minWidth: '180px',
                            maxWidth: '220px',
                          }}
                        >
                          <Link
                            href={`/admin/students/${s.id}`}
                            style={{
                              fontWeight: 700,
                              color: '#f8fafc',
                              textDecoration: 'none',
                              fontSize: '0.875rem',
                              display: 'block',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {s.name}
                          </Link>
                          <div
                            style={{
                              fontSize: '0.75rem',
                              color: '#94a3b8',
                              marginTop: '2px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {s.email}
                          </div>
                        </td>

                        {/* 3. Phone */}
                        <td
                          style={{
                            padding: '0.9rem 1.15rem',
                            fontSize: '0.8rem',
                            color: '#cbd5e1',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {s.phone || 'NOT RECORDED'}
                        </td>

                        {/* 4. Programme */}
                        <td
                          style={{
                            padding: '0.9rem 1.15rem',
                            minWidth: '150px',
                            maxWidth: '180px',
                          }}
                        >
                          <div
                            style={{
                              fontWeight: 600,
                              color: '#f8fafc',
                              fontSize: '0.825rem',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {s.programme || 'UNASSIGNED'}
                          </div>
                        </td>

                        {/* 5. Status */}
                        <td style={{ padding: '0.9rem 1.15rem' }}>
                          <Badge
                            variant={
                              s.status === 'ACTIVE'
                                ? 'success'
                                : s.status === 'SUSPENDED'
                                  ? 'danger'
                                  : 'warning'
                            }
                          >
                            {s.status}
                          </Badge>
                        </td>

                        {/* 6. Progress Bar */}
                        <td style={{ padding: '0.9rem 1.15rem', width: '130px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
                                  backgroundColor:
                                    progress > 70
                                      ? '#34d399'
                                      : progress > 40
                                        ? '#60a5fa'
                                        : '#f59e0b',
                                  borderRadius: '3px',
                                }}
                              />
                            </div>
                            <span
                              style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}
                            >
                              {progress}%
                            </span>
                          </div>
                        </td>

                        {/* 7. Action Bar: View, Edit, More (⋮) Menu */}
                        <td
                          style={{
                            padding: '0.9rem 1.15rem',
                            textAlign: 'right',
                            position: 'relative',
                          }}
                        >
                          <div
                            style={{ display: 'inline-flex', gap: '0.35rem', alignItems: 'center' }}
                          >
                            {/* View Action */}
                            <Link
                              href={`/admin/students/${s.id}`}
                              style={{
                                padding: '0.3rem 0.6rem',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                borderRadius: '6px',
                                backgroundColor: '#1e293b',
                                color: '#38bdf8',
                                border: '1px solid rgba(56, 189, 248, 0.3)',
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                              }}
                            >
                              <Eye size={12} />
                              View
                            </Link>

                            {/* Edit Action */}
                            <button
                              type="button"
                              onClick={() => setEditingStudent(s)}
                              style={{
                                padding: '0.3rem 0.6rem',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                borderRadius: '6px',
                                backgroundColor: '#1e293b',
                                color: '#cbd5e1',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                              }}
                            >
                              <Edit3 size={12} />
                              Edit
                            </button>

                            {/* More (⋮) Action Popover Menu Trigger */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(isMenuOpen ? null : s.id);
                              }}
                              aria-label="More actions"
                              aria-expanded={isMenuOpen}
                              style={{
                                padding: '0.3rem 0.45rem',
                                borderRadius: '6px',
                                backgroundColor: isMenuOpen ? '#334155' : '#1e293b',
                                color: '#cbd5e1',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <MoreVertical size={14} />
                            </button>
                          </div>

                          {/* Popover Action Menu */}
                          {isMenuOpen && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                position: 'absolute',
                                right: '1.15rem',
                                top: 'calc(100% - 6px)',
                                width: '190px',
                                backgroundColor: '#0f172a',
                                border: '1px solid #1e293b',
                                borderRadius: '10px',
                                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.6)',
                                padding: '0.4rem',
                                zIndex: 100,
                                textAlign: 'left',
                              }}
                            >
                              <button
                                type="button"
                                onClick={() => handleTogglePractice(s.id)}
                                style={{
                                  width: '100%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.5rem',
                                  padding: '0.5rem 0.65rem',
                                  borderRadius: '6px',
                                  border: 'none',
                                  backgroundColor: 'transparent',
                                  color: s.practiceUnlocked ? '#34d399' : '#94a3b8',
                                  cursor: 'pointer',
                                  fontSize: '0.8rem',
                                  fontWeight: 600,
                                }}
                              >
                                {s.practiceUnlocked ? <Unlock size={13} /> : <Lock size={13} />}
                                <span>
                                  {s.practiceUnlocked ? 'Lock Practice' : 'Unlock Practice'}
                                </span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleToggleMock(s.id)}
                                style={{
                                  width: '100%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.5rem',
                                  padding: '0.5rem 0.65rem',
                                  borderRadius: '6px',
                                  border: 'none',
                                  backgroundColor: 'transparent',
                                  color: s.mockUnlocked ? '#a78bfa' : '#94a3b8',
                                  cursor: 'pointer',
                                  fontSize: '0.8rem',
                                  fontWeight: 600,
                                }}
                              >
                                {s.mockUnlocked ? <Unlock size={13} /> : <Lock size={13} />}
                                <span>
                                  {s.mockUnlocked ? 'Lock Mock Exam' : 'Unlock Mock Exam'}
                                </span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleResetPassword(s.name, s.id)}
                                style={{
                                  width: '100%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.5rem',
                                  padding: '0.5rem 0.65rem',
                                  borderRadius: '6px',
                                  border: 'none',
                                  backgroundColor: 'transparent',
                                  color: '#60a5fa',
                                  cursor: 'pointer',
                                  fontSize: '0.8rem',
                                  fontWeight: 600,
                                }}
                              >
                                <KeyRound size={13} />
                                <span>Reset Password</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleResendVerification(s.name, s.id)}
                                style={{
                                  width: '100%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.5rem',
                                  padding: '0.5rem 0.65rem',
                                  borderRadius: '6px',
                                  border: 'none',
                                  backgroundColor: 'transparent',
                                  color: '#38bdf8',
                                  cursor: 'pointer',
                                  fontSize: '0.8rem',
                                  fontWeight: 600,
                                }}
                              >
                                <UserPlus size={13} />
                                <span>Resend Verification</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleForceLogout(s.name, s.id)}
                                style={{
                                  width: '100%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.5rem',
                                  padding: '0.5rem 0.65rem',
                                  borderRadius: '6px',
                                  border: 'none',
                                  backgroundColor: 'transparent',
                                  color: '#fbbf24',
                                  cursor: 'pointer',
                                  fontSize: '0.8rem',
                                  fontWeight: 600,
                                }}
                              >
                                <UserX size={13} />
                                <span>Force Logout</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleUnlockAccount(s.name, s.id)}
                                style={{
                                  width: '100%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.5rem',
                                  padding: '0.5rem 0.65rem',
                                  borderRadius: '6px',
                                  border: 'none',
                                  backgroundColor: 'transparent',
                                  color: '#a78bfa',
                                  cursor: 'pointer',
                                  fontSize: '0.8rem',
                                  fontWeight: 600,
                                }}
                              >
                                <Unlock size={13} />
                                <span>Unlock Account Lock</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleToggleStatus(s)}
                                style={{
                                  width: '100%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.5rem',
                                  padding: '0.5rem 0.65rem',
                                  borderRadius: '6px',
                                  border: 'none',
                                  backgroundColor: 'transparent',
                                  color: s.status === 'ACTIVE' ? '#f87171' : '#34d399',
                                  cursor: 'pointer',
                                  fontSize: '0.8rem',
                                  fontWeight: 600,
                                  borderTop: '1px solid #1e293b',
                                  marginTop: '0.2rem',
                                  paddingTop: '0.5rem',
                                }}
                              >
                                {s.status === 'ACTIVE' ? (
                                  <UserX size={13} />
                                ) : (
                                  <UserCheck size={13} />
                                )}
                                <span>
                                  {s.status === 'ACTIVE' ? 'Suspend Account' : 'Activate Account'}
                                </span>
                              </button>

                              {s.status === 'SUSPENDED' && (
                                <button
                                  type="button"
                                  onClick={() => handleRestoreStudent(s)}
                                  style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.5rem 0.65rem',
                                    borderRadius: '6px',
                                    border: 'none',
                                    backgroundColor: 'transparent',
                                    color: '#34d399',
                                    cursor: 'pointer',
                                    fontSize: '0.8rem',
                                    fontWeight: 600,
                                  }}
                                >
                                  <UserCheck size={13} />
                                  <span>Restore Student</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleDeleteStudent(s)}
                                style={{
                                  width: '100%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.5rem',
                                  padding: '0.5rem 0.65rem',
                                  borderRadius: '6px',
                                  border: 'none',
                                  backgroundColor: 'transparent',
                                  color: '#ef4444',
                                  cursor: 'pointer',
                                  fontSize: '0.8rem',
                                  fontWeight: 600,
                                  borderTop: '1px solid #1e293b',
                                  marginTop: '0.2rem',
                                  paddingTop: '0.5rem',
                                }}
                              >
                                <UserX size={13} />
                                <span>Archive Student</span>
                              </button>
                            </div>
                          )}
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
              backgroundColor: '#0f172a',
              border: '1px solid #1e293b',
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
                  placeholder="e.g. John Doe"
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
                    placeholder="john.doe@example.com"
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
                    placeholder="+44 7000 000000"
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
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
                    Target Programme
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
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="IELTS Academic">IELTS Academic</option>
                    <option value="IELTS General Training">IELTS General Training</option>
                    <option value="TOEFL iBT">TOEFL iBT</option>
                    <option value="Digital SAT">Digital SAT</option>
                    <option value="CELPIP General">CELPIP General</option>
                    <option value="English Proficiency">English Proficiency</option>
                  </select>
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
                    Cohort Assignment
                  </label>
                  <input
                    value={newCohort}
                    onChange={(e) => setNewCohort(e.target.value)}
                    placeholder="2026 Q3 Cohort A"
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
              </div>

              <div
                style={{
                  display: 'flex',
                  justifySelf: 'flex-end',
                  gap: '0.75rem',
                  marginTop: '1rem',
                }}
              >
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setAddModalOpen(false)}
                  style={{ borderRadius: '8px' }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  style={{ backgroundColor: '#2563eb', color: '#ffffff', borderRadius: '8px' }}
                >
                  Confirm Registration
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
              backgroundColor: '#0f172a',
              border: '1px solid #1e293b',
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
              Edit Candidate Details
            </h2>

            <form
              onSubmit={handleEditStudentSubmit}
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
                  Candidate Name
                </label>
                <input
                  required
                  value={editingStudent.name}
                  onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
                    Email
                  </label>
                  <input
                    disabled
                    value={editingStudent.email}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      backgroundColor: '#090d16',
                      border: '1px solid #1e293b',
                      color: '#64748b',
                      fontSize: '0.875rem',
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
                    value={editingStudent.phone || ''}
                    onChange={(e) =>
                      setEditingStudent({ ...editingStudent, phone: e.target.value })
                    }
                    placeholder="+44 7000 000000"
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
                  Target Programme
                </label>
                <select
                  value={editingStudent.programme || 'IELTS Academic'}
                  onChange={(e) =>
                    setEditingStudent({ ...editingStudent, programme: e.target.value })
                  }
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
                >
                  <option value="IELTS Academic">IELTS Academic</option>
                  <option value="IELTS General Training">IELTS General Training</option>
                  <option value="TOEFL iBT">TOEFL iBT</option>
                  <option value="Digital SAT">Digital SAT</option>
                  <option value="CELPIP General">CELPIP General</option>
                  <option value="English Proficiency">English Proficiency</option>
                </select>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifySelf: 'flex-end',
                  gap: '0.75rem',
                  marginTop: '1rem',
                }}
              >
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setEditingStudent(null)}
                  style={{ borderRadius: '8px' }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  style={{ backgroundColor: '#2563eb', color: '#ffffff', borderRadius: '8px' }}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. DELETE STUDENT CONFIRMATION MODAL */}
      {deletingStudent && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(2, 6, 23, 0.85)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '460px',
              backgroundColor: '#0f172a',
              border: '1px solid #1e293b',
              borderRadius: '16px',
              padding: '1.75rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              boxSizing: 'border-box',
            }}
          >
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: '#f8fafc',
                  letterSpacing: '-0.01em',
                }}
              >
                Delete Student?
              </h3>
              <p
                style={{
                  margin: '0.5rem 0 0',
                  fontSize: '0.875rem',
                  color: '#94a3b8',
                  lineHeight: 1.5,
                }}
              >
                This will permanently remove the student&apos;s portal account and associated
                student records for{' '}
                <strong style={{ color: '#ffffff' }}>{deletingStudent.name}</strong>.
              </p>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.75rem',
                marginTop: '0.5rem',
              }}
            >
              <Button
                type="button"
                variant="secondary"
                onClick={() => setDeletingStudent(null)}
                style={{
                  backgroundColor: '#1e293b',
                  color: '#cbd5e1',
                  borderRadius: '8px',
                  padding: '0.5rem 1rem',
                  fontSize: '0.85rem',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={() => confirmDeleteStudent(deletingStudent)}
                style={{
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  borderRadius: '8px',
                  padding: '0.5rem 1.15rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                }}
              >
                Delete Student
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
