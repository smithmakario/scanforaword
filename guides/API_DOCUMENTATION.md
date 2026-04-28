# Scan for a Word - API Documentation

Welcome to the **Scan for a Word** API documentation. This guide is intended for frontend developers and testers to understand how to interact with the backend services.

## Base URL
All API requests should be made to:
`http://127.0.0.1:8000/api` (Local Development)

---

## 1. Authentication
Endpoints for user registration and login.

### Authentication Headers
For all "Auth Required" endpoints, include the following header:
`Authorization: Bearer <your_access_token>`

### Register
*   **URL:** `/register`
*   **Method:** `POST`
*   **Body Parameters:**
    *   `name` (String, Required)
    *   `email` (String, Required, Unique)
    *   `phone_number` (String, Optional)
    *   `password` (String, Required, Min: 8)
    *   `role` (String, Optional, default: `user`, choices: `user`, `creator`)
*   **Success Response:**
    ```json
    {
      "status": "success",
      "data": { ...user_info },
      "access_token": "...",
      "token_type": "Bearer"
    }
    ```

### Login
*   **URL:** `/login`
*   **Method:** `POST`
*   **Body Parameters:**
    *   `email` (String, Required)
    *   `password` (String, Required)
*   **Success Response:**
    ```json
    {
      "status": "success",
      "data": { ...user_info },
      "access_token": "...",
      "token_type": "Bearer"
    }
    ```

---

## 2. Creator Dashboard (Auth Required)
Endpoints for creators to manage content and view analytics.

### Get Stats
*   **URL:** `/creator/stats`
*   **Method:** `GET`
*   **Success Response:** Returns dashboard stats (Uploads, Listens, Keyword Matches) and insights (Peak time, Engagement).

### Recent Uploads
*   **URL:** `/creator/messages`
*   **Method:** `GET`
*   **Success Response:** Returns uploads with `status`, `duration`, and `listens_count`.

### Upload Message
*   **URL:** `/creator/upload`
*   **Method:** `POST`
*   **Body Parameters:** `title`, `description`, `speaker`, `full_url`, `duration`.
*   **Success Response:** Returns the newly created message with `status: processing`.

---

## 3. Search & Discovery
Endpoints for searching content and viewing trends.

### Search
*   **URL:** `/search`
*   **Method:** `GET`
*   **Parameters:** `identifier` (email/phone), `keyword`.
*   **Success Response:** Returns matching snippets. Each snippet now includes `content` (the text excerpt shown in the UI).

### Trending Keywords
*   **URL:** `/search/trending`
*   **Method:** `GET`
*   **Success Response:** Returns top 5 trending keywords based on search logs.

### Search History
*   **URL:** `/search/history`
*   **Method:** `GET`
*   **Parameters:** `identifier` (email/phone).
*   **Success Response:** Returns user's last 10 searches.

### Visual Scan
*   **URL:** `/search/visual`
*   **Method:** `POST`
*   **Body Parameters:** `image` (file).
*   **Success Response:** Returns detected text and matching snippets.

---

## 4. Library & Bookmarks (Auth Required)
Endpoints for managing saved insights.

### Get Bookmarks
*   **URL:** `/bookmarks`
*   **Method:** `GET`
*   **Success Response:** Returns user's bookmarked snippets.

### Toggle Bookmark
*   **URL:** `/snippets/{id}/bookmark`
*   **Method:** `POST`
*   **Success Response:** Adds or removes bookmark.

### Library Status
*   **URL:** `/library/status`
*   **Method:** `GET`
*   **Success Response:** Returns indexed keywords for the library summary card.

---

## 5. Daily Word & Preferences
Endpoints for personalized daily word delivery.

### Get Categories
*   **URL:** `/categories`
*   **Method:** `GET`
*   **Success Response:** Returns all life experience categories.

### Set Preferences
*   **URL:** `/preferences`
*   **Method:** `POST`
*   **Body Parameters:** `identifier`, `categories` (array of IDs).

### Get Today's Daily Word
*   **URL:** `/daily-word`
*   **Method:** `GET`
*   **Parameters:** `identifier`.

---

---

## 6. Security & RBAC
The API implements several security protocols to protect data and resources.

### Role-Based Access Control (RBAC)
Certain endpoints are restricted based on user roles:
- **User**: Can search, save bookmarks, and set preferences.
- **Creator**: Can access the Creator Dashboard and upload new messages.
Accessing a restricted route without the correct role will return a `403 Forbidden` error.

### Rate Limiting
To prevent abuse, all API endpoints are rate-limited to **60 requests per minute** per user/IP.
Exceeding this limit will return a `429 Too Many Requests` error.

### CORS
CORS is enabled for all `api/*` paths to allow seamless integration with web frontends.

---

## Error Handling
Standard HTTP status codes are used:
- `200 OK`: Success.
- `401 Unauthorized`: Authentication missing or failed.
- `403 Forbidden`: Authenticated but lacks the required role (RBAC).
- `422 Unprocessable Content`: Validation error.
- `429 Too Many Requests`: Rate limit exceeded.
- `404 Not Found`: Resource does not exist.
