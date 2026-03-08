# test_aws_be

Backend NestJS chạy tại subdomain **api.{domain}**. Route gốc (không prefix `/api`):

- `POST /upload` — upload ảnh
- `GET /files` — danh sách file
- `DELETE /files/:id` — xóa file
- `POST /email/send-test` — gửi email test (AWS SES SMTP)

Cấu hình: copy `.env.example` → `.env` và sửa giá trị. Production nên set `CORS_ORIGIN` trùng domain FE (vd S3/CloudFront).

**Email (SES SMTP):** điền `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` (email From phải đã verify trong SES).