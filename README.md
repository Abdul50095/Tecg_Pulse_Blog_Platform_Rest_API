# Blog Platform REST API

**The Tech Pulses — MERN Stack Summer Internship, Week 4**

A REST API for a blog platform built with Node.js, Express, and MongoDB (via Mongoose).
There is no frontend in this project — every endpoint is tested with Postman / Thunder Client.
This is the backend foundation that Weeks 5–6 will build a React frontend and JWT auth on top of.

## Tech Stack

- Node.js + Express — server and routing
- MongoDB Atlas + Mongoose — database and schema/ODM layer
- express-validator — request validation and sanitization
- dotenv — environment variable management
- nodemon — dev-time auto-restart

## Project Structure

```
blog-api/
├── server.js              entry point — connects DB, starts server
├── .env.example            dummy env values (real .env is git-ignored)
├── config/
│   └── db.js               Mongoose connection logic
├── models/
│   ├── User.js
│   ├── Post.js
│   └── Comment.js
├── routes/
│   ├── userRoutes.js
│   ├── postRoutes.js
│   └── commentRoutes.js
├── controllers/
│   ├── userController.js
│   ├── postController.js
│   └── commentController.js
└── middleware/
    ├── errorHandler.js      global error handler
    └── validate.js          express-validator result handler
```

## Setup (Windows / cmd.exe)

1. Install dependencies:
   ```
   npm install
   ```
2. Copy the example env file and fill in your real MongoDB Atlas URI:
   ```
   copy .env.example .env
   ```
3. Start in dev mode (auto-restarts on file changes):
   ```
   npm run dev
   ```
   or for a plain run:
   ```
   npm start
   ```
4. The API is now live at `http://localhost:5000`.

## Response Shape

Every endpoint returns one of these two shapes:

```json
{ "success": true, "message": "...", "data": { } }
```
```json
{ "success": false, "message": "Error description", "errors": [] }
```

## Endpoints

### Users — `/api/users`
| Method | Endpoint | Description |
|---|---|---|
| POST | `/register` | Register a new user |
| POST | `/login` | Login with email + password (no JWT yet) |
| GET | `/` | Get all users (no passwords returned) |
| GET | `/:id` | Get one user with their **published** posts populated |
| PUT | `/:id` | Update name, bio, or role |
| DELETE | `/:id` | Delete a user + cascade-delete their posts and comments |

### Posts — `/api/posts`
| Method | Endpoint | Description |
|---|---|---|
| POST | `/` | Create a post (`author` is a user ID in the body) |
| GET | `/` | Get published posts — supports `?category`, `?tag`, `?search`, `?sort=latest\|popular` |
| GET | `/all` | Get every post, including unpublished (admin use) |
| GET | `/:id` | Get one post with author + comments (and comment authors) populated |
| PUT | `/:id` | Update title, content, category, tags, or isPublished |
| PATCH | `/:id/like` | Increment likes by 1 |
| PATCH | `/:id/publish` | Toggle isPublished |
| DELETE | `/:id` | Delete a post + cascade-delete its comments |

### Comments — `/api/comments`
| Method | Endpoint | Description |
|---|---|---|
| POST | `/` | Add a comment — `{ text, author, post }` |
| GET | `/post/:postId` | Get all comments for a post, author name populated |
| PUT | `/:id` | Edit a comment's text |
| DELETE | `/:id` | Delete a comment + remove it from the post's comments array |

## Notable Implementation Details

- **Published posts on a user** aren't stored as a field on `User` — a Mongoose **virtual populate**
  (`posts` in `models/User.js`) looks up `Post` documents where `author` matches the user, filtered
  to `isPublished: true` at query time in `getUserById`.
- **Cascading deletes**: deleting a user removes every post they authored, every comment on those
  posts, and every comment they personally wrote elsewhere. Deleting a post removes its comments.
  Deleting a comment pulls its ID back out of the parent post's `comments` array.
- **Filtering/search on `GET /api/posts`** uses case-insensitive regex for `category`/`tag` exact
  matches and a `$or` regex across `title`/`content` for `search`. `?sort=popular` sorts by `likes`
  descending; anything else (including no param) defaults to `latest` (`createdAt` descending).
- **Route order matters**: `/api/posts/all` is registered before `/api/posts/:id`, otherwise Express
  would treat `"all"` as an `:id` and the wrong handler would run.
- **Error handling**: a global `errorHandler` middleware (registered last, after the 404 handler)
  catches Mongoose `CastError` (bad ObjectId → 400), duplicate-key errors (→ 409), and schema
  validation errors, falling back to 500 for anything unexpected.
- **Password** is intentionally stored in plain text this week — hashing with bcrypt and JWT-based
  auth are the Week 5–6 additions on top of this same schema.

