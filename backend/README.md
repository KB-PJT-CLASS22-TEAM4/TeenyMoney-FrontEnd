# Backend Setup

## Local Environment

This project keeps real DB credentials and JWT secrets outside Git.

Required environment variables:

```env
DB_DRIVER=net.sf.log4jdbc.sql.jdbcapi.DriverSpy
DB_URL=jdbc:log4jdbc:mysql://localhost:3306/scoula_db
DB_USERNAME=scoula
DB_PASSWORD=your_local_password
JWT_SECRET=your-random-secret-key-at-least-32-bytes
```

In IntelliJ, set them in `Run/Debug Configurations` > `Environment variables`.

`src/main/resources/application.properties` is committed because it only contains shared property names and safe local defaults. Do not commit personal passwords, real JWT secrets, or production connection strings.

## Database Collaboration

Use a local MySQL database for daily development. Share database changes through SQL files, not through personal DB dumps.

- Put table changes in `database/schema.sql`.
- Put sample data in `database/seed.sql`.
- Open a PR when the schema changes.
- Mention required DB changes in the PR description.

A shared dev database can be added later for integration testing or demos, but daily feature work should use each member's local DB to avoid data conflicts.
