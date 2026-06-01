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
    *   `email` (String, Optional, Unique)
    *   `phone_number` (String, Optional, Unique)
    *   `password` (String, Required, Min: 8)
    *   `role` (String, Optional, default: `user`, choices: `user`, `creator`, `admin`)
*   **Notes:** At least one of `email` or `phone_number` must be provided.
*   **Success Response:**
    ```json
    {
      "status": "success",
      "message": "Registration successful. Please verify your email.",
      "data": { ...user_info },
      "access_token": "...",
      "token_type": "Bearer"
    }
    ```

### Verify OTP (Auth Required)
*   **URL:** `/verify-otp`
*   **Method:** `POST`
*   **Body Parameters:**
    *   `otp` (String, Required, Size: 6)
*   **Success Response:**
    ```json
    {
      "status": "success",
      "message": "Email verified successfully",
      "data": { ...user_info }
    }
    ```

### Resend OTP (Auth Required)
*   **URL:** `/resend-otp`
*   **Method:** `POST`
*   **Success Response:**
    ```json
    {
      "status": "success",
      "message": "New OTP code sent to your email"
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
      "message": "Login successful",
      "data": { ...user_info },
      "access_token": "...",
      "token_type": "Bearer",
      "is_verified": true
    }
    ```

### Verify Email Code
*   **URL:** `/verify`
*   **Method:** `POST`
*   **Body Parameters:** `code` (String, Required, Size: 6)
*   **Success Response:** Confirms the user email is verified.

### Resend Verification Code
*   **URL:** `/resend-code`
*   **Method:** `POST`
*   **Success Response:** Sends a fresh verification code.

### Forgot Password
*   **URL:** `/forgot-password`
*   **Method:** `POST`
*   **Body Parameters:** `email` (String, Required)
*   **Success Response:** Returns a generic success message for security.

### Reset Password
*   **URL:** `/reset-password`
*   **Method:** `POST`
*   **Body Parameters:** `email`, `code`, `password`, `password_confirmation`
*   **Success Response:** Returns a new access token after password reset.

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
*   **Body Parameters:**
    *   `title` (String, Required)
    *   `description` (String, Optional)
    *   `speaker` (String, Optional)
    *   `duration` (String, Optional)
    *   `keywords` (String, Required, comma-separated)
    *   `content` (String, Optional)
    *   `full_url` (String, Optional) - existing audio URL fallback
    *   `audio_file` (File, Optional) - direct audio upload
    *   `audio_base64` (String, Optional) - base64-encoded audio content
    *   `audio_extension` (String, Optional, one of `mp3`, `wav`, `m4a`, `ogg`, `aac`)
    *   `image_file` (File, Optional) - direct cover image upload
    *   `image_base64` (String, Optional) - base64-encoded image content
    *   `image_extension` (String, Optional, one of `jpg`, `jpeg`, `png`, `gif`, `webp`)
*   **Success Response:** Returns the newly created message with `status: processing`, `audio_url`, and `image_url`.

### Supabase Storage Configuration
The creator upload endpoint stores direct uploads in Supabase bucket storage. Configure the following environment values:
*   `SUPABASE_URL`
*   `SUPABASE_SERVICE_KEY`
*   `SUPABASE_AUDIO_BUCKET` (default: `creator-audio`)
*   `SUPABASE_IMAGE_BUCKET` (default: `creator-images`)

### Request Creator Access
*   **URL:** `/creator/request`
*   **Method:** `POST`
*   **Auth Required:** Yes
*   **Success Response:** Marks the user request as pending for creator access review.

---

## 3. Admin Management (Auth Required)
Endpoints for platform administrators to review system health and manage users and content.

### Admin Dashboard
*   **URL:** `/admin/dashboard`
*   **Method:** `GET`
*   **Access:** `admin` role only
*   **Success Response:** Returns aggregate counts for users, creators, messages, snippets, bookmarks, categories, and daily words.

### List Users
*   **URL:** `/admin/users`
*   **Method:** `GET`
*   **Access:** `admin` role only
*   **Success Response:** Returns the current user roster with role and verification status.

### Update User Role
*   **URL:** `/admin/users/{id}/role`
*   **Method:** `PATCH`
*   **Body Parameters:** `role` (`user`, `creator`, `admin`)
*   **Success Response:** Returns the updated user record.

### List Messages
*   **URL:** `/admin/messages`
*   **Method:** `GET`
*   **Success Response:** Returns all messages for moderation and operational oversight.

### Update Message Status
*   **URL:** `/admin/messages/{id}/status`
*   **Method:** `PATCH`
*   **Body Parameters:** `status` (`processing`, `live`, `archived`)

### Manage Categories
*   **URL:** `/admin/categories`
*   **Method:** `GET` or `POST`
*   **POST Body Parameters:** `name`

### Manage Daily Words
*   **URL:** `/admin/daily-words`
*   **Method:** `GET` or `POST`
*   **POST Body Parameters:** `snippet_id`, `category_id`, `scheduled_for`

> Example: to promote a user to an administrator, send `PATCH /api/admin/users/42/role` with `{"role":"admin"}` using an `Authorization: Bearer <admin-token>` header.

---

## 4. Search & Discovery
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

## 5. Library & Bookmarks (Auth Required)
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

## 6. Daily Word & Preferences
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

## 7. Security & RBAC
The API implements several security protocols to protect data and resources.

### Role-Based Access Control (RBAC)
Certain endpoints are restricted based on user roles:
- **User**: Can search, save bookmarks, and set preferences.
- **Creator**: Can access the Creator Dashboard, upload new messages, and view creator analytics.
- **Admin**: Can access the full administration suite (`/admin/*`) to manage users, content, categories, and daily words.
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
