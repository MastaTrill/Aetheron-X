# Aetheron-X v0 API Contract

## Authentication

All endpoints require a valid session cookie. Unauthorized requests return 401.

---

## Endpoints

### Get All Tasks

- **GET** `/api/tasks`
- **Response:**
  - `200 OK`: `{ items: Task[], user: string }`
  - `401 Unauthorized`

### Create Task

- **POST** `/api/tasks`
- **Body:**
  - `title` (string, required)
  - `status` (string, optional: 'pending'|'completed', default: 'pending')
  - `dueDate` (string, optional, ISO date)
- **Response:**
  - `201 Created`: `Task`
  - `400 Bad Request` (missing title)
  - `401 Unauthorized`

### Update Task

- **PUT** `/api/tasks/[id]`
- **Body:**
  - `title` (string, optional)
  - `status` (string, optional: 'pending'|'completed')
  - `dueDate` (string, optional, ISO date)
- **Response:**
  - `200 OK`: `Task`
  - `400 Bad Request` (invalid id)
  - `401 Unauthorized`
  - `404 Not Found`

### Delete Task

- **DELETE** `/api/tasks/[id]`
- **Response:**
  - `200 OK`: `{ ok: true }`
  - `400 Bad Request` (invalid id)
  - `401 Unauthorized`
  - `404 Not Found`

---

## Task Object

```
{
  id: number,
  title: string,
  status: 'pending' | 'completed',
  dueDate: string | null, // ISO date
  userId: number,
  createdAt: string // ISO date
}
```

---

## Notes

- All endpoints require authentication.
- Only the authenticated user's tasks are accessible.
- Dates are in ISO 8601 format.
