# test_aws_be

Backend NestJS chạy tại subdomain **api.{domain}**. Route gốc (không prefix `/api`):

- `POST /upload` — upload ảnh
- `GET /files` — danh sách file
- `DELETE /files/:id` — xóa file

Cấu hình: copy `.env.example` → `.env` và sửa giá trị. Production nên set `CORS_ORIGIN` trùng domain FE (vd S3/CloudFront).