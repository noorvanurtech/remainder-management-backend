# Glass Force User Panel Backend

This is the backend service for the Glass Force User Panel, built with Node.js, Express, and TypeScript.

## Features

- **Authentication**: JWT-based authentication with OTP verification.
- **User Management**: Profile management and admin controls.
- **Security**: Helmet, CORS, Rate limiting, and Mongo sanitize.
- **Mailing**: Integration with Nodemailer for OTP emails.
- **File Storage**: Cloudinary and AWS S3 integration.

## Getting Started

### Prerequisites

- Node.js (v16+)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/noorvanurtech/glassforce-userpanel-backend.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Create a `.env` file based on `.env.example`.

4. Run the development server:
   ```bash
   npm run dev
   ```

## Scripts

- `npm run dev`: Start development server with nodemon.
- `npm run build`: Build the project to `dist`.
- `npm run start`: Run the production build.
- `npm run clean`: Remove the `dist` directory.

## License

ISC
