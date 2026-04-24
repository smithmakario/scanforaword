# Scan for a Word - API Documentation

Welcome to the **Scan for a Word** API documentation. This guide is intended for frontend developers and testers to understand how to interact with the backend services.

## Base URL
All API requests should be made to:
`http://127.0.0.1:8000/api` (Local Development)

---

## 1. Health Check
Verify if the API is up and running.

*   **URL:** `/health`
*   **Method:** `GET`
*   **Auth Required:** No
*   **Success Response:**
    *   **Code:** 200 OK
    *   **Content:**
        ```json
        {
          "status": "ok",
          "message": "Laravel API is running",
          "timestamp": "2026-04-24T07:44:36Z"
        }
        ```

---

## 2. Search API
Search for teaching snippets based on keywords.

*   **URL:** `/search`
*   **Method:** `GET`
*   **Parameters:**
    *   `identifier` (String, Required): The user's email or phone number.
    *   `keyword` (String, Required): The search term (e.g., "faith", "grace").
*   **Auth Required:** No (Identifier-based tracking)
*   **Success Response:**
    *   **Code:** 200 OK
    *   **Content:**
        ```json
        {
          "status": "success",
          "query": {
            "identifier": "test@example.com",
            "keyword": "faith"
          },
          "results_count": 1,
          "data": [
            {
              "id": 1,
              "message_id": 1,
              "title": "The Definition of Faith",
              "video_url": "https://example.com/snippets/faith-def.mp4",
              "thumbnail_url": "https://example.com/thumbnails/faith.jpg",
              "duration": 90,
              "message": {
                "id": 1,
                "title": "Understanding Faith",
                "description": "A comprehensive teaching...",
                "full_url": "https://example.com/full-message/faith",
                "speaker": "Apostle Segun Obadje"
              }
            }
          ]
        }
        ```

---

## 3. Categories API
Fetch all available life experience categories for daily word subscription.

*   **URL:** `/categories`
*   **Method:** `GET`
*   **Auth Required:** No
*   **Success Response:**
    *   **Code:** 200 OK
    *   **Content:**
        ```json
        {
          "status": "success",
          "data": [
            { "id": 1, "name": "Faith" },
            { "id": 2, "name": "Growth" }
          ]
        }
        ```

---

## 4. User Preferences API
Set or update the user's category preferences for the daily word.

*   **URL:** `/preferences`
*   **Method:** `POST`
*   **Headers:** `Content-Type: application/json`
*   **Body Parameters:**
    *   `identifier` (String, Required): Email or phone number.
    *   `categories` (Array of Integers, Required): List of category IDs.
*   **Success Response:**
    *   **Code:** 200 OK
    *   **Content:**
        ```json
        {
          "status": "success",
          "message": "Preferences updated successfully"
        }
        ```

---

## 5. Daily Word API
Fetch today's scheduled word based on user preferences.

*   **URL:** `/daily-word`
*   **Method:** `GET`
*   **Parameters:**
    *   `identifier` (String, Required): Email or phone number.
*   **Success Response:**
    *   **Code:** 200 OK
    *   **Content:**
        ```json
        {
          "status": "success",
          "data": {
            "id": 1,
            "scheduled_for": "2026-04-24",
            "snippet": {
              "id": 1,
              "title": "The Definition of Faith",
              "video_url": "...",
              "message": { "title": "Understanding Faith", "speaker": "..." }
            }
          }
        }
        ```

---

## Error Handling
The API uses standard HTTP status codes. Common errors:

| Code | Meaning | Description |
| :--- | :--- | :--- |
| 422 | Unprocessable Content | Validation failed (e.g., missing identifier). |
| 404 | Not Found | Route or resource not found. |
| 500 | Internal Server Error | Something went wrong on the server. |

Example Validation Error:
```json
{
  "message": "The identifier field is required.",
  "errors": {
    "identifier": ["The identifier field is required."]
  }
}
```
