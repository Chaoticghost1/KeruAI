# Testing Checklist

Manual verification checklist after cache/offline removal. For setup and cache-clearing steps, see [Development Guide → Troubleshooting](DEVELOPMENT.md#6-troubleshooting).

---

## Pre-testing

- [ ] Clear site data and unregister service workers (see Development Guide).
- [ ] Restart dev server: `npm run dev`.

---

## 1. Service worker and storage

**DevTools (F12) → Console**

- [ ] See: `PWA Manager: Service worker disabled`, `Offline storage is disabled`.
- [ ] Do not see: `Service worker registered successfully` or `Offline storage initialized successfully`.

**DevTools → Application**

- [ ] Service Workers: empty or unregistered.
- [ ] Cache Storage: empty.
- [ ] IndexedDB: no HondurasEducationalPlatform database.

---

## 2. Teacher — create class

- [ ] Log in as teacher → Class Groups (Clases y Grupos).
- [ ] Create class "Test Class 1" (subject optional).
- [ ] Class appears immediately; invite code shown.
- [ ] Network: `/api/classes/teacher` returns 200 (not 304, not from cache).

---

## 3. Admin — view all classes

- [ ] Log in as superuser → Admin → Clases y Grupos.
- [ ] All teachers’ classes visible immediately.
- [ ] Network: `/api/classes/teacher` returns 200.

---

## 4. Student — join class

- [ ] Copy invite code from teacher.
- [ ] Log in as student → Class Groups → Join with code.
- [ ] Success message; class appears in “My chat groups” with “Pending approval”.
- [ ] Network: `/api/classes/student` returns 200.

---

## 5. Teacher — approve student

- [ ] Log in as teacher → Class Groups → class with pending student.
- [ ] Approve student; status becomes “Approved”.

---

## 6. Student — access chat

- [ ] Log in as student → Class Groups → approved class.
- [ ] Chat visible; send message; message appears.
- [ ] Network: `/api/classes/:id/messages` returns 200.

---

## 7. Refresh and network

- [ ] Normal refresh (Ctrl+R) and hard refresh (Ctrl+Shift+R): classes still visible.
- [ ] New tab, navigate to app: classes still visible.
- [ ] Network: all `/api/classes/*` requests 200, not from cache.

---

## 8. Multi-role flow

- [ ] Teacher: create 2 classes.
- [ ] Admin: see both.
- [ ] Student: join both.
- [ ] Teacher: approve student in both.
- [ ] Student: chat in both.

---

## 9. Incognito/private

- [ ] Open app in incognito/private window; log in as teacher; create class.
- [ ] Class appears immediately; Network: 200 OK.

---

## If tests fail

1. Full browser data clear (Settings → Privacy → clear all for site).
2. Restart browser.
3. Check `chrome://serviceworker-internals/` or `about:serviceworkers` and unregister.
4. Restart dev server; check server logs and database.

---

*Last updated: February 2026*
