# Day 4 — HTTP, REST and APIs

## 1. API Used

API: JSONPlaceholder

Base URL:
https://jsonplaceholder.typicode.com/

## 2. Requests Performed

### GET Collection

Method: GET

URL:
https://jsonplaceholder.typicode.com/posts

Status:
200 OK

Purpose:
Retrieve a collection of posts.

### GET Individual Resource

Method: GET

URL:
https://jsonplaceholder.typicode.com/posts/1

Status:
200 OK

Purpose:
Retrieve one specific post.

### GET with Query Parameter

Method: GET

URL:
https://jsonplaceholder.typicode.com/posts?userId=1

Query Parameter:
userId=1

Status:
200 OK

Purpose:
Retrieve posts using a query parameter.

### POST Request

Method: POST

URL:
https://jsonplaceholder.typicode.com/posts

Request Body:

{
  "title": "Learn REST API",
  "body": "Day 4 API practice",
  "userId": 1
}

Status:
201 Created

### DELETE Request

Method: DELETE

URL:
https://jsonplaceholder.typicode.com/posts/1

Status:
Write the actual status shown by Postman.

## 3. Headers

### Request Headers

Write 2 or 3 headers you observed in Postman.

### Response Headers

Write 2 or 3 headers you observed in Postman.

## 4. Sample Request and Response

### Request

GET /posts/1

### Response

{
  "userId": 1,
  "id": 1,
  "title": "...",
  "body": "..."
}

## 5. Five Observations

1. GET requests are used to retrieve data.
2. A specific resource can be identified using a path.
3. Query parameters can provide additional information to an API.
4. HTTP status codes show the result of a request.
5. JSON is commonly used to exchange structured data.

## 6. HTTP Methods

### GET

Used to retrieve data.

### POST

Used to create a resource.

### PUT

Used to replace or update a resource.

### PATCH

Used to partially update a resource.

### DELETE

Used to delete a resource.

## 7. CRUD

Create → POST

Read → GET

Update → PUT/PATCH

Delete → DELETE

## 8. Idempotency

GET, PUT and DELETE are generally idempotent.

POST is generally not idempotent.

## 9. HTTP Status Codes

200 → OK

201 → Created

400 → Bad Request

401 → Unauthorized

403 → Forbidden

404 → Not Found

500 → Internal Server Error