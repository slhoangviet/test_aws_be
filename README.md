# image-processor-be

Backend cho **web xử lý ảnh**: upload, resize, đổi định dạng, nén chất lượng. Chạy tại subdomain **api.{domain}**.

## API (route gốc, không prefix `/api`)

| Method | Route | Mô tả |
|--------|--------|--------|
| POST | `/upload` | Upload ảnh (tối đa 10MB), lưu S3 + metadata MySQL |
| GET | `/files` | Danh sách ảnh đã upload |
| POST | `/files/:id/process` | Xử lý ảnh: resize, đổi format (webp/jpeg/png), chất lượng. Body: `{ width?, height?, format?, quality? }` |
| DELETE | `/files/:id` | Xóa ảnh |
| POST | `/email/send-test` | Gửi email test (SES) |

Cấu hình: copy `.env.example` → `.env`. Production set `CORS_ORIGIN` trùng domain FE.

**S3:** Dùng cho upload và lưu ảnh đã xử lý (`processed/`). Set `CDN_BASE_URL` nếu dùng CloudFront để URL trả về đầy đủ.

**Email (SES):** IAM role hoặc `AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY`, `SES_FROM` đã verify trong SES.
