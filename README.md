# Creative Corner -- Event Management Platform

A full-stack event management platform built with **Next.js, React,
Bootstrap, Prisma ORM, and MySQL**. Creative Corner allows clients to
explore event services, packages, previous events, submit booking
requests, contact the business, and track booking status. An
authenticated admin panel provides tools for managing bookings, clients,
services, packages, events, gallery content, inquiries, notifications,
and website settings.

------------------------------------------------------------------------

## Project Overview

Creative Corner is designed for an event management business that
handles weddings, birthdays, corporate events, engagements, conferences,
private events, decoration, lighting, catering coordination, and related
services.

The system has two main areas:

### Public Website

Visitors can:

-   View the home page and company information
-   Explore available services
-   Browse event packages and prices
-   View previous events and gallery images
-   Submit a booking request through a multi-step booking wizard
-   Check booking availability
-   Track a booking using its Booking Reference ID
-   Submit contact inquiries

### Admin Panel

Authorized administrators can:

-   View dashboard statistics
-   Manage bookings and update booking status
-   View client profiles and booking history
-   Add, edit, activate, and deactivate services
-   Add, edit, activate, and deactivate packages
-   Manage completed events
-   Manage gallery items
-   Manage customer inquiries
-   View notifications
-   Update website and business settings
-   Change their password
-   Use forgot-password and reset-password functionality

------------------------------------------------------------------------

## Key Features

### Client Booking

The booking system uses a 7-step workflow:

1.  Event Details
2.  Package Selection
3.  Event Date
4.  Location
5.  Client Details
6.  Additional Requirements
7.  Review and Submit

When a booking is submitted:

-   Required fields are validated.
-   The client is found by email or created if they do not already
    exist.
-   The selected package is linked when it exists in the database.
-   A unique Booking Reference ID is generated.
-   The booking is stored in MySQL through Prisma.
-   The initial status is `Pending`.
-   A booking-received email is attempted when Gmail is configured.

### Booking Tracking

Clients can enter their Booking Reference ID on:

`/track-booking`

The tracking API returns the latest booking information and status.

### Booking Status Workflow

The system supports these statuses:

-   Pending
-   Under Review
-   Confirmed
-   In Progress
-   Completed
-   Cancelled

### Availability

The booking flow includes an availability check. The maximum number of
bookings allowed for a day can be configured from the admin settings.

### Admin Authentication

Admin authentication includes:

-   Email and password login
-   Password hashing with `bcryptjs`
-   JWT-based sessions using `jose`
-   HTTP-only session cookie
-   Protected admin pages through Next.js middleware
-   Separate authentication pages
-   Logout
-   Forgot password
-   Password reset
-   Change password

### Notifications

The admin panel includes a notification system for events such as:

-   New bookings
-   New inquiries
-   Booking confirmations
-   Booking cancellations
-   New clients, when enabled

The notification panel can be refreshed automatically and keeps track of
when notifications were last read.

### Website Settings

Administrators can edit settings for:

-   Business name
-   Tagline
-   Contact email
-   Contact phone
-   WhatsApp
-   Service area
-   Business hours
-   Social media links
-   Currency
-   Time zone
-   Minimum booking notice
-   Maximum bookings per day
-   Booking notice
-   Confirmation mode
-   Cancellation rules
-   Deposit settings
-   Notification preferences
-   Logo and favicon URLs

------------------------------------------------------------------------

## Technology Stack

  Technology        Purpose
  ----------------- ----------------------------------------
  Next.js 14        Full-stack React framework and routing
  React 18          User interface
  Bootstrap 5       Responsive styling and layout
  React-Bootstrap   Bootstrap components for React
  Prisma ORM        Database access and data modeling
  MySQL             Relational database
  bcryptjs          Password hashing
  jose              JWT/session handling
  Nodemailer        Email notifications
  JavaScript        Application logic
  CSS               Custom website styling

------------------------------------------------------------------------

## Requirements

Before running the project, install:

-   **Node.js** 18 or later
-   **npm**
-   **MySQL** database
-   A Gmail account with an **App Password** if email functionality is
    required

------------------------------------------------------------------------

## Installation

### 1. Extract the project

Open the project folder in VS Code or another code editor.

### 2. Install dependencies

``` bash
npm install
```

### 3. Configure environment variables

Create a file named `.env` in the project root.

Example:

``` env
DATABASE_URL="mysql://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME"

JWT_SECRET="replace-with-a-long-random-secret"

GMAIL_USER="your-email@gmail.com"
GMAIL_APP_PASSWORD="your-gmail-app-password"
EMAIL_FROM="your-email@gmail.com"

APP_URL="http://localhost:3000"

SEED_ADMIN_EMAIL="admin@creativecorner.com"
SEED_ADMIN_PASSWORD="change-this-password"
```

### Environment Variables

  -----------------------------------------------------------------------
  Variable                            Purpose
  ----------------------------------- -----------------------------------
  `DATABASE_URL`                      MySQL connection string used by
                                      Prisma

  `JWT_SECRET`                        Secret used to sign and verify
                                      admin JWT sessions

  `GMAIL_USER`                        Gmail account used for outgoing
                                      email

  `GMAIL_APP_PASSWORD`                Gmail App Password used by
                                      Nodemailer

  `EMAIL_FROM`                        Email address shown as the sender

  `APP_URL`                           Base URL used for application links
                                      such as password reset links

  `SEED_ADMIN_EMAIL`                  Optional admin email used by the
                                      seed script

  `SEED_ADMIN_PASSWORD`               Optional admin password used by the
                                      seed script
  -----------------------------------------------------------------------

**Important:** Never commit your real `.env` file, database password,
JWT secret, or Gmail App Password to GitHub.

------------------------------------------------------------------------

## Database Setup

This project uses **Prisma ORM with MySQL**.

The database schema is located at:

``` text
prisma/schema.prisma
```

Create/update the database tables with:

``` bash
npx prisma db push
```

Generate the Prisma Client if required:

``` bash
npx prisma generate
```

------------------------------------------------------------------------

## Seed the Database

The seed script adds initial services, packages, gallery content,
events, settings, and an admin account when the relevant tables are
empty.

Run:

``` bash
npx prisma db seed
```

or:

``` bash
npm run db:seed
```

The seed script supports these optional environment variables:

``` env
SEED_ADMIN_EMAIL="your-admin-email"
SEED_ADMIN_PASSWORD="your-admin-password"
```

The current seed script falls back to a development admin account when
these variables are not provided. **Change the development password
before using the application in a real deployment.**

------------------------------------------------------------------------

## Run the Application

Start the development server:

``` bash
npm run dev
```

Then open:

``` text
http://localhost:3000
```

If your local Next.js server uses another port, use the URL shown in the
terminal.

------------------------------------------------------------------------

## Production Build

Create a production build:

``` bash
npm run build
```

Start the production server:

``` bash
npm start
```

------------------------------------------------------------------------

## Main Public Routes

  Route              Purpose
  ------------------ ---------------------------
  `/`                Home page
  `/about`           About Creative Corner
  `/services`        Services
  `/packages`        Event packages
  `/gallery`         Gallery
  `/events`          Previous/completed events
  `/booking`         Booking wizard
  `/track-booking`   Booking status tracking
  `/contact`         Contact/inquiry form

------------------------------------------------------------------------

## Admin Routes

  Route                      Purpose
  -------------------------- ------------------------------
  `/admin/login`             Admin login
  `/admin/forgot-password`   Forgot password
  `/admin/reset-password`    Reset password
  `/admin/dashboard`         Dashboard and statistics
  `/admin/bookings`          Booking management
  `/admin/clients`           Client management
  `/admin/services`          Service management
  `/admin/packages`          Package management
  `/admin/events`            Event management
  `/admin/gallery`           Gallery management
  `/admin/inquiries`         Inquiry management
  `/admin/settings`          Website and booking settings

All protected admin pages require a valid admin session.

------------------------------------------------------------------------

## API Structure

The application uses Next.js Route Handlers for its backend API.

### Bookings

``` text
GET    /api/bookings
POST   /api/bookings
GET    /api/bookings/[id]
PUT    /api/bookings/[id]
DELETE /api/bookings/[id]
GET    /api/bookings/availability
GET    /api/bookings/track
```

### Services

``` text
GET    /api/services
POST   /api/services
GET    /api/services/[id]
PUT    /api/services/[id]
DELETE /api/services/[id]
```

### Packages

``` text
GET    /api/packages
POST   /api/packages
GET    /api/packages/[id]
PUT    /api/packages/[id]
DELETE /api/packages/[id]
```

### Gallery

``` text
GET    /api/gallery
POST   /api/gallery
GET    /api/gallery/[id]
PUT    /api/gallery/[id]
DELETE /api/gallery/[id]
```

### Events

``` text
GET    /api/events
POST   /api/events
GET    /api/events/[id]
PUT    /api/events/[id]
DELETE /api/events/[id]
```

### Clients

``` text
GET    /api/clients
POST   /api/clients
GET    /api/clients/[id]
PUT    /api/clients/[id]
DELETE /api/clients/[id]
```

### Inquiries

``` text
GET    /api/inquiries
POST   /api/inquiries
GET    /api/inquiries/[id]
PUT    /api/inquiries/[id]
DELETE /api/inquiries/[id]
```

### Admin

``` text
POST   /api/admin/login
POST   /api/admin/logout
GET    /api/admin/me
GET    /api/admin/dashboard-stats
GET    /api/admin/notifications
POST   /api/admin/notifications
POST   /api/admin/change-password
POST   /api/admin/forgot-password
POST   /api/admin/reset-password
```

### Settings

``` text
GET    /api/settings
PUT    /api/settings
```

For request/response examples, see:

``` text
API_DOCUMENTATION.md
```

------------------------------------------------------------------------

## Database Models

The Prisma schema currently contains these models:

-   `Client`
-   `Service`
-   `Package`
-   `Booking`
-   `GalleryItem`
-   `Event`
-   `Inquiry`
-   `Admin`
-   `Setting`

### Main Relationships

``` text
Client
  └── Booking

Package
  └── Booking

Booking
  ├── Client
  └── Package
```

A booking belongs to one client and can optionally be linked to one
package.

------------------------------------------------------------------------

## Project Structure

``` text
creative-corner/
│
├── app/
│   ├── about/
│   ├── admin/
│   │   ├── (auth)/
│   │   └── (protected)/
│   ├── api/
│   ├── booking/
│   ├── contact/
│   ├── events/
│   ├── gallery/
│   ├── packages/
│   ├── services/
│   ├── track-booking/
│   ├── fonts/
│   ├── globals.css
│   ├── layout.js
│   └── page.js
│
├── components/
│   ├── admin/
│   ├── Footer.js
│   ├── Navbar.js
│   └── Reveal.js
│
├── lib/
│   ├── apiAuth.js
│   ├── auth.js
│   ├── bookingStatus.js
│   ├── dashboardStats.js
│   ├── db.js
│   ├── mailer.js
│   ├── settings.js
│   ├── siteConfig.js
│   └── stats.js
│
├── prisma/
│   ├── schema.prisma
│   └── seed.js
│
├── public/
│   └── logo-mark.png
│
├── middleware.js
├── next.config.mjs
├── package.json
├── package-lock.json
└── README.md
```

------------------------------------------------------------------------

## Important Files

### `app/layout.js`

Defines the global application layout, metadata, fonts, Bootstrap CSS,
Navbar, and Footer.

### `app/globals.css`

Contains the project's global and component-specific styling, including
the public website, admin interface, booking pages, and Track Booking
page.

### `middleware.js`

Protects `/admin/*` pages and redirects unauthenticated users to the
admin login page.

### `lib/db.js`

Provides the Prisma Client connection used throughout the application.

### `lib/auth.js`

Handles creation and verification of the admin JWT session.

### `lib/apiAuth.js`

Provides the `requireAdmin()` protection used by admin-only API routes.

### `lib/mailer.js`

Uses Nodemailer with Gmail to send booking and password-related emails.

### `lib/settings.js`

Defines the editable settings and handles reading/writing settings
stored in the database.

### `prisma/schema.prisma`

Defines the MySQL database structure through Prisma.

### `prisma/seed.js`

Provides initial database data and creates a development admin account
when needed.

------------------------------------------------------------------------

## Email Configuration

Email functionality uses **Nodemailer** and Gmail.

For Gmail, use a Google **App Password** rather than your normal Gmail
password.

Required variables:

``` env
GMAIL_USER="your-email@gmail.com"
GMAIL_APP_PASSWORD="your-app-password"
EMAIL_FROM="your-email@gmail.com"
```

Email functionality includes:

-   Booking received notification
-   Booking approval/update notification
-   Admin password reset email

The booking request itself is not dependent on email delivery. If email
configuration is missing or email sending fails, the booking can still
be created and stored.

------------------------------------------------------------------------

## Security

The application includes several security measures:

-   Passwords are hashed with `bcryptjs`.
-   Admin sessions use signed JWTs.
-   Admin session cookies are HTTP-only.
-   `/admin/*` pages are protected by middleware.
-   Admin-only API routes independently check authentication.
-   Password reset tokens are stored as hashes with an expiration time.
-   Settings only accept keys defined by the application's settings
    schema.
-   Client and server-side validation are used for booking data.

For production deployment, always use strong secrets, secure environment
variables, HTTPS, and a production database account with appropriate
permissions.

------------------------------------------------------------------------

## Deployment

The application can be deployed to a Next.js-compatible hosting platform
such as **Vercel**.

Before deployment:

1.  Push the project to GitHub.
2.  Create a production MySQL database.
3.  Add the production environment variables.
4.  Deploy the GitHub repository.
5.  Run the Prisma database setup against the production database.
6.  Verify the public website.
7.  Verify the admin login.
8.  Test a booking from the public website.
9.  Test Booking Reference tracking.
10. Test email delivery if email is enabled.

### Production Environment

Do not copy development credentials into production.

Use production values for:

``` env
DATABASE_URL
JWT_SECRET
GMAIL_USER
GMAIL_APP_PASSWORD
EMAIL_FROM
APP_URL
SEED_ADMIN_EMAIL
SEED_ADMIN_PASSWORD
```

------------------------------------------------------------------------

## Troubleshooting

### Prisma cannot connect to MySQL

Check:

-   MySQL server is running.
-   `DATABASE_URL` is correct.
-   Username and password are correct.
-   Database name exists.
-   Host and port are correct.

Then run:

``` bash
npx prisma db push
```

### Admin login does not work

Check:

``` bash
npx prisma db seed
```

Then verify the admin account exists in the `Admin` table.

### Changes to the Prisma schema are not reflected

Run:

``` bash
npx prisma db push
npx prisma generate
```

Then restart the development server.

### Emails are not being sent

Check:

``` env
GMAIL_USER
GMAIL_APP_PASSWORD
EMAIL_FROM
```

For Gmail, make sure an App Password is being used.

### Favicon does not update

The project includes:

``` text
app/favicon.ico
app/icon.png
app/apple-icon.png
```

If an old browser icon remains visible, perform a hard refresh or
restart the browser because favicons can be cached.

------------------------------------------------------------------------

## Development Notes

The project includes additional development documentation:

``` text
API_DOCUMENTATION.md
DAY1-5_GAP_FIXES_SUMMARY.md
DAY6_SUMMARY.md
DAY7_PART1_SUMMARY.md
DAY7_SUMMARY.md
DAY8_SUMMARY.md
```

These files document the development progress and implementation details
from the project tasks.

------------------------------------------------------------------------

## Current Implementation

The project includes:

-   Responsive public website
-   Database-driven services
-   Database-driven packages
-   Database-driven gallery
-   Database-driven completed events
-   Multi-step booking system
-   Booking availability checking
-   Booking Reference ID generation
-   Booking status tracking
-   Client records
-   Contact inquiries
-   Admin authentication
-   Admin dashboard
-   Booking management
-   Client management
-   Service management
-   Package management
-   Event management
-   Gallery management
-   Inquiry management
-   Admin notifications
-   Editable website settings
-   Password change
-   Forgot/reset password flow
-   Gmail email notifications
-   Custom Creative Corner favicon/logo

------------------------------------------------------------------------

## License

This project is intended as an educational and internship project for
**Creative Corner -- Event Management**.

If you reuse the project for another organization, update the business
information, images, social links, contact details, database
credentials, and branding before deployment.

------------------------------------------------------------------------

## Author

**Malaika Shabir**

Creative Corner -- Event Management Platform
