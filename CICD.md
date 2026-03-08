# CI/CD — Backend (test_aws_be)

Workflow: `.github/workflows/ci.yml` (chạy khi push/PR lên `main` hoặc `develop`).

## Cần setup trên GitHub

1. **Repo là root của project**  
   Clone/push mỗi repo riêng (vd. `your-org/test_aws_be`). Workflow chạy tại root repo, không cần `working-directory`.

2. **Bật GitHub Actions**  
   Settings → Actions → General → Allow all actions.

3. **CI không cần secrets**  
   Chỉ build (install + build). Deploy BE (lên EC2/ECS/…) bạn tự làm hoặc thêm job deploy sau.

## Chạy local giống CI

```bash
yarn install --frozen-lockfile
yarn build
```
