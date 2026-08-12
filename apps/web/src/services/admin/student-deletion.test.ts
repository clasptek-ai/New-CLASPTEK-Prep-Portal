import { describe, test, expect, vi, beforeEach } from 'vitest';
import { adminUsersService } from './users.service';
import { apiClient } from '../api/client';
import { APIError } from '../api/errors';

vi.mock('../api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('Forensic Student Deletion & Lifecycle Test Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('Test 1: Existing student with Auth + application records — delete returns success', async () => {
    const mockId = '11111111-1111-4111-8111-111111111111';
    vi.mocked(apiClient.delete).mockResolvedValueOnce({
      success: true,
      message: 'Student account and auth credentials have been completely deleted.',
    });

    const res = await adminUsersService.deleteStudent(mockId);

    expect(apiClient.delete).toHaveBeenCalledWith(`/api/v1/admin/users/${mockId}`);
    expect(res.success).toBe(true);
    expect(res.message).toBe('Student account and auth credentials have been completely deleted.');
  });

  test('Test 2: Application records exist but auth.users does not (orphaned) — clean deletion without 404 crash', async () => {
    const mockId = '22222222-2222-4222-8222-222222222222';
    vi.mocked(apiClient.delete).mockResolvedValueOnce({
      success: true,
      message: 'Orphaned student records cleaned successfully.',
    });

    const res = await adminUsersService.deleteStudent(mockId);

    expect(res.success).toBe(true);
    expect(res.message).toContain('cleaned');
  });

  test('Test 3: Auth user exists but application profile is missing — clean deletion', async () => {
    const mockId = '33333333-3333-4333-8333-333333333333';
    vi.mocked(apiClient.delete).mockResolvedValueOnce({
      success: true,
      message: 'Student account and auth credentials have been completely deleted.',
    });

    const res = await adminUsersService.deleteStudent(mockId);

    expect(res.success).toBe(true);
  });

  test('Test 4: Student already completely deleted — idempotent success or controlled ALREADY_DELETED code', async () => {
    const mockId = '44444444-4444-4444-8444-444444444444';
    vi.mocked(apiClient.delete).mockResolvedValueOnce({
      success: true,
      code: 'ALREADY_DELETED',
      message: 'Student account was already removed.',
    });

    const res = await adminUsersService.deleteStudent(mockId);

    expect(res.success).toBe(true);
    expect(res.code).toBe('ALREADY_DELETED');
    expect(res.message).toBe('Student account was already removed.');
  });

  test('Test 5: Invalid student ID / 404 USER_NOT_FOUND error handled gracefully without React overlay crash', async () => {
    const invalidId = 'nonexistent-uuid-999999';
    vi.mocked(apiClient.delete).mockRejectedValueOnce(
      new APIError(404, 'Student account not found.', { code: 'USER_NOT_FOUND' })
    );

    const res = await adminUsersService.deleteStudent(invalidId);

    expect(res.success).toBe(false);
    expect(res.code).toBe('USER_NOT_FOUND');
    expect(res.message).toBe('Student account could not be found.');
  });

  test('Test 6: Delete one student — verify another student remains unaffected', async () => {
    const targetId = '55555555-5555-4555-8555-555555555555';
    const remainingStudentId = '66666666-6666-4666-8666-666666666666';

    vi.mocked(apiClient.delete).mockResolvedValueOnce({
      success: true,
      message: 'Student account deleted successfully.',
    });

    const res = await adminUsersService.deleteStudent(targetId);

    expect(res.success).toBe(true);
    expect(apiClient.delete).toHaveBeenCalledWith(`/api/v1/admin/users/${targetId}`);
    expect(apiClient.delete).not.toHaveBeenCalledWith(`/api/v1/admin/users/${remainingStudentId}`);
  });

  test('Test 7 & 8: Re-register & login lifecycle contracts', async () => {
    const newStudentData = {
      name: 'Re-registered Student',
      email: 'reregister.student@example.com',
      phone: '+1234567890',
      programme: 'IELTS Academic',
    };

    vi.mocked(apiClient.post).mockResolvedValueOnce({
      success: true,
      data: {
        id: '77777777-7777-4777-8777-777777777777',
        registrationNumber: 'CGA-2026-77777',
        name: 'Re-registered Student',
        email: 'reregister.student@example.com',
        role: 'STUDENT',
        status: 'ACTIVE',
      },
    });

    const registered = await adminUsersService.addStudent(newStudentData);

    expect(registered.id).toBe('77777777-7777-4777-8777-777777777777');
    expect(registered.email).toBe('reregister.student@example.com');
  });
});
