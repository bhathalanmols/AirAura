# AirAura — Test Credentials

## PCB Official (admin)

- Email: `admin@ppcb.gov.in`
- Password: `admin@123`
- Role: `pcb_official`

## Thapar Student (demo)

- Email: `student@thapar.edu`
- Password: `thapar@123`
- Role: `student`
- Home station: Thapar Institute Campus, Patiala

## Auth endpoints

- POST `/api/auth/register` → body `{name, email, password, role, home_station_id?}`
- POST `/api/auth/login` → returns `{token, user}`
- GET `/api/auth/me` → Bearer token
- Token: send via `Authorization: Bearer <token>`
