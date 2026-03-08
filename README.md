# test_aws_be

Backend NestJS chạy tại subdomain **api.{domain}**. Route gốc (không prefix `/api`):

- `POST /upload` — upload ảnh
- `GET /files` — danh sách file
- `DELETE /files/:id` — xóa file
- `POST /email/send-test` — gửi email test (AWS SES SMTP)

Cấu hình: copy `.env.example` → `.env` và sửa giá trị. Production nên set `CORS_ORIGIN` trùng domain FE (vd S3/CloudFront).

**Email (SES):** dùng IAM (role trên EC2/ECS hoặc AWS_ACCESS_KEY_ID/SECRET khi chạy local). Cấu hình `SES_FROM` (email/domain đã verify trong SES). IAM user/role cần quyền `ses:SendEmail`, `ses:SendRawEmail`.