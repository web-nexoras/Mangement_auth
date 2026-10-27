# Student Management API

Express and MongoDB backend for account management and basic school administration.

## Project flow

1. `server.js` loads environment settings, configures CORS and request parsing, mounts the API routes, connects to MongoDB, and then starts the HTTP server.
2. Routes are mounted under `BASE_URL` (typically `/api/v1`). Authentication uses an `accTkn` JWT stored in an HTTP-only cookie. Role middleware restricts admin and other role-specific operations.
3. Signup creates a student or teacher account and emails an OTP. The user verifies the OTP before signing in. Teacher and student accounts require admin approval.
4. Auth routes handle signin, signout, profile updates, OTP resend/verification, and password reset. Profile images are uploaded to Cloudinary; mail is sent through Nodemailer.
5. Admin routes manage users and approvals. Admins create classes and can assign an approved teacher. Approved students can browse classes and enroll. The assigned teacher or an admin records class attendance; students can view their own attendance summary. Class deletion also removes that class's enrollments and attendance. Subject routes manage the catalog. Notice routes support announcements and reactions. Payment routes initialize SSLCommerz payments and accept its result callbacks.

## Main folders

- `routes/`: Express endpoints, grouped by feature.
- `controllers/`: Request validation and application logic.
- `models/`: Mongoose schemas.
- `middleware/`: Authentication, approval, and role checks.
- `configs/`: MongoDB and Cloudinary setup.
- `helpers/`: Email templates, mail delivery, and shared utilities.

## Setup

Requirements: Node.js and MongoDB.

1. Install packages with `npm install`.
2. Create a `.env` file with the required settings below.
3. Start the API with `npm start`.

```env
PORT=8000
BASE_URL=/api/v1
DB_URL=mongodb://127.0.0.1:27017/student_management
JWT_SEC=replace-with-a-long-random-secret
CLIENT_URL=http://localhost:5173
CLOUD_NAME=
API_KEY=
API_SECRET=
USER_EMAIL=
USER_PASS=
STORE_ID=
STORE_PASSWD=
IS_LIVE=false
```

Cloudinary, email, and SSLCommerz credentials are needed only for the related integrations. Keep real credentials in `.env`; do not commit them.

## API overview

The examples below use `/api/v1` as the base URL. Protected routes expect the `accTkn` cookie returned by signin.

| Area | Routes |
| --- | --- |
| Authentication | `POST /auth/signup`, `POST /auth/verifyOtp`, `POST /auth/signin`, `POST /auth/logout`, `GET /auth/getProfile`, `PUT /auth/updateProfile`, `POST /auth/forgotPassword`, `POST /auth/reset-password/:token` |
| Admin | `/admin/*` user listing, approval, and deletion routes (admin only) |
| Classes | `POST /class/create`, `PUT /class/updateclass/:id`, `DELETE /class/delclass/:id` (admin only); `GET /class/getall` (approved users) |
| Enrollments | `POST /class/:id/enroll`, `GET /class/my-enrollments` (approved students) |
| Attendance | `POST /class/:id/attendance` (assigned teacher or admin); `GET /class/:id/attendance/me` (enrolled student) |
| Subjects | `/subject/*` subject management routes (admin only) |
| Notices | `/notice/*` announcements and reactions |
| Payments | `POST /payment` to initialize a payment; callbacks under `/payment/payment-*` |

## Notes

- `npm test` is not configured yet.
- Payment initialization currently uses a fixed example amount and customer details; connect it to validated order data before using it for real transactions.

## Enrollment and attendance examples

Sign in first and send the returned `accTkn` cookie with protected requests. Enroll a student in a class:

```http
POST /api/v1/class/CLASS_ID/enroll
Cookie: accTkn=ACCESS_TOKEN
```

An admin assigns a teacher when creating or updating a class using `teacherId`. The assigned teacher records attendance for a calendar date; each student must already be enrolled:

```json
{
  "date": "2026-10-27",
  "records": [
    { "studentId": "STUDENT_ID", "status": "present" },
    { "studentId": "ANOTHER_STUDENT_ID", "status": "late" }
  ]
}
```

Allowed attendance statuses are `present`, `absent`, and `late`. Submitting attendance for the same class and date updates that session. Students retrieve their own session history and totals from `/api/v1/class/CLASS_ID/attendance/me`.
