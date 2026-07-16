#!/usr/bin/env node
/**
 * API Diagnostic Script - Tests student, teacher, admin flows and all key endpoints
 * Usage: node scripts/diagnose-api.mjs [baseUrl]
 * Default baseUrl: http://localhost:5000
 */

const BASE = process.argv[2] || 'http://localhost:5000';
const API = `${BASE}/api`;

const results = { passed: 0, failed: 0, skipped: 0, errors: [] };

function log(msg, type = 'info') {
  const icons = { info: 'ℹ', ok: '✅', fail: '❌', skip: '⏭', section: '📋' };
  console.log(`${icons[type] || '•'} ${msg}`);
}

async function fetchApi(method, path, body = null, token = null) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (token) opts.headers['Authorization'] = `Bearer ${token}`;
  if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(`${API}${path}`, opts);
  let data;
  try {
    data = await res.json();
  } catch {
    data = await res.text();
  }
  return { status: res.status, data, ok: res.ok };
}

async function test(name, fn) {
  try {
    const result = await fn();
    if (result === 'skip') {
      results.skipped++;
      log(`${name}: SKIPPED`, 'skip');
      return null;
    }
    if (result !== false && result !== undefined) {
      results.passed++;
      log(`${name}: OK`, 'ok');
      return result;
    }
    results.failed++;
    log(`${name}: FAILED`, 'fail');
    return null;
  } catch (err) {
    results.failed++;
    results.errors.push({ name, error: err.message });
    log(`${name}: ERROR - ${err.message}`, 'fail');
    return null;
  }
}

// --- Auth flow ---
let studentToken, teacherToken, adminToken;
let studentId, teacherId;

async function runDiagnostics() {
  console.log('\n========== Keru.ai API Diagnostic ==========\n');
  console.log(`Base URL: ${BASE}\n`);

  // Check server is up
  await test('Server reachable', async () => {
    const res = await fetch(BASE);
    return res.ok || res.status === 200;
  });

  // Public endpoints (no auth)
  log('\n--- Public Endpoints ---', 'section');
  await test('GET /api/tutors (public)', async () => {
    const { status, data } = await fetchApi('GET', '/tutors');
    return status === 200 && Array.isArray(data);
  });

  // --- Register & Login ---
  log('\n--- Auth: Register & Login ---', 'section');
  const ts = Date.now();
  const studentUser = `diag_student_${ts}`;
  const teacherUser = `diag_teacher_${ts}`;

  studentToken = await test('Register student', async () => {
    const { status, data } = await fetchApi('POST', '/auth/register', {
      username: studentUser,
      email: `diag_student_${ts}@test.local`,
      password: 'TestPass123!',
      role: 'student',
      firstName: 'Diag',
      lastName: 'Student',
    });
    if (status !== 201) throw new Error(JSON.stringify(data));
    studentId = data.user?.id;
    return data.tokens?.accessToken;
  });

  teacherToken = await test('Register teacher', async () => {
    const { status, data } = await fetchApi('POST', '/auth/register', {
      username: teacherUser,
      email: `diag_teacher_${ts}@test.local`,
      password: 'TestPass123!',
      role: 'teacher',
      firstName: 'Diag',
      lastName: 'Teacher',
    });
    if (status !== 201) throw new Error(JSON.stringify(data));
    teacherId = data.user?.id;
    return data.tokens?.accessToken;
  });

  if (studentToken) {
    await test('Login student', async () => {
      const { status, data } = await fetchApi('POST', '/auth/login', {
        username: studentUser,
        password: 'TestPass123!',
      });
      if (status !== 200) throw new Error(JSON.stringify(data));
      studentToken = data.tokens?.accessToken;
      return true;
    });
  }

  // --- Student endpoints ---
  log('\n--- Student Endpoints ---', 'section');
  if (studentToken) {
    await test('GET /api/auth/me (student)', async () => {
      const { status, data } = await fetchApi('GET', '/auth/me', null, studentToken);
      return status === 200 && data.role === 'student';
    });
    await test('GET /api/budget/categories', async () => {
      const { status } = await fetchApi('GET', '/budget/categories', null, studentToken);
      return status === 200;
    });
    await test('GET /api/study/notes', async () => {
      const { status } = await fetchApi('GET', '/study/notes', null, studentToken);
      return status === 200;
    });
    await test('GET /api/progress/profile', async () => {
      const { status } = await fetchApi('GET', '/progress/profile', null, studentToken);
      return status === 200;
    });
    await test('GET /api/progress/badges', async () => {
      const { status } = await fetchApi('GET', '/progress/badges', null, studentToken);
      return status === 200;
    });
    await test('GET /api/games/scores', async () => {
      const { status } = await fetchApi('GET', '/games/scores', null, studentToken);
      return status === 200;
    });
    await test('GET /api/assignments/my', async () => {
      const { status } = await fetchApi('GET', '/assignments/my', null, studentToken);
      return status === 200;
    });
    await test('GET /api/assignments/revision/materials', async () => {
      const { status } = await fetchApi('GET', '/assignments/revision/materials', null, studentToken);
      return status === 200;
    });
    await test('GET /api/mentorship/mentors', async () => {
      const { status } = await fetchApi('GET', '/mentorship/mentors', null, studentToken);
      return status === 200;
    });
    // Student should NOT access admin
    await test('GET /api/admin/users (student → 403)', async () => {
      const { status } = await fetchApi('GET', '/admin/users', null, studentToken);
      return status === 403;
    });
  } else {
    log('Skipping student endpoints (registration failed)', 'skip');
  }

  // --- Teacher endpoints ---
  log('\n--- Teacher Endpoints ---', 'section');
  if (teacherToken) {
    await test('GET /api/auth/me (teacher)', async () => {
      const { status, data } = await fetchApi('GET', '/auth/me', null, teacherToken);
      return status === 200 && data.role === 'teacher';
    });
    await test('GET /api/content (teacher)', async () => {
      const { status } = await fetchApi('GET', '/content', null, teacherToken);
      return status === 200;
    });
    await test('GET /api/admin/analytics (teacher)', async () => {
      const { status } = await fetchApi('GET', '/admin/analytics', null, teacherToken);
      return status === 200;
    });
    await test('GET /api/admin/blog-posts (teacher)', async () => {
      const { status } = await fetchApi('GET', '/admin/blog-posts', null, teacherToken);
      return status === 200;
    });
    await test('GET /api/admin/bot-personas (teacher)', async () => {
      const { status } = await fetchApi('GET', '/admin/bot-personas', null, teacherToken);
      return status === 200;
    });
    await test('POST /api/admin/blog-posts (teacher create)', async () => {
      const { status } = await fetchApi('POST', '/admin/blog-posts', {
        title: 'Diagnostic Test Post',
        content: 'Created by API diagnostic',
        category: 'test',
        isPublished: true,
      }, teacherToken);
      return status === 200 || status === 201;
    });
    // Teacher should NOT access superuser-only
    await test('GET /api/admin/users (teacher → 403)', async () => {
      const { status } = await fetchApi('GET', '/admin/users', null, teacherToken);
      return status === 403;
    });
  } else {
    log('Skipping teacher endpoints (registration failed)', 'skip');
  }

  // --- Admin (superuser) - try to login as admin ---
  log('\n--- Admin (Superuser) Endpoints ---', 'section');
  adminToken = await test('Login as admin (admin/admin123)', async () => {
    const { status, data } = await fetchApi('POST', '/auth/login', {
      username: 'admin',
      password: 'admin123',
    });
    if (status !== 200) return 'skip'; // Admin may not exist
    adminToken = data.tokens?.accessToken;
    return adminToken;
  });

  if (adminToken) {
    await test('GET /api/admin/users (superuser)', async () => {
      const { status, data } = await fetchApi('GET', '/admin/users', null, adminToken);
      return status === 200 && Array.isArray(data);
    });
    await test('GET /api/admin/analytics', async () => {
      const { status } = await fetchApi('GET', '/admin/analytics', null, adminToken);
      return status === 200;
    });
    await test('GET /api/admin/blog-posts', async () => {
      const { status } = await fetchApi('GET', '/admin/blog-posts', null, adminToken);
      return status === 200;
    });
    await test('GET /api/admin/bot-personas', async () => {
      const { status } = await fetchApi('GET', '/admin/bot-personas', null, adminToken);
      return status === 200;
    });
  } else {
    log('Admin user not found - run scripts/reset-admin-password.ts if needed', 'skip');
  }

  // --- Public blog (if endpoint exists) ---
  log('\n--- Public Blog Endpoint ---', 'section');
  await test('GET /api/blog/posts (public, if exists)', async () => {
    const { status } = await fetchApi('GET', '/blog/posts');
    if (status === 404) return 'skip'; // Not implemented yet
    return status === 200;
  });

  // --- Summary ---
  console.log('\n========== Summary ==========');
  log(`Passed: ${results.passed}`, 'ok');
  if (results.failed > 0) log(`Failed: ${results.failed}`, 'fail');
  if (results.skipped > 0) log(`Skipped: ${results.skipped}`, 'skip');
  if (results.errors.length > 0) {
    console.log('\nErrors:');
    results.errors.forEach((e) => console.log(`  - ${e.name}: ${e.error}`));
  }
  console.log('');
  process.exit(results.failed > 0 ? 1 : 0);
}

runDiagnostics();
