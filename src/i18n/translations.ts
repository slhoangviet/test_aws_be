/**
 * Bản dịch API (BE). Key dạng 'error.xxx' hoặc 'message.xxx'.
 * FE gửi header x-locale hoặc Accept-Language để nhận message đúng ngôn ngữ.
 */
export type Locale = 'vi' | 'en';

export const translations: Record<Locale, Record<string, string>> = {
  vi: {
    'error.noFile': 'Chưa chọn file',
    'error.onlyImages': 'Chỉ chấp nhận file ảnh',
    'error.uploadFailed': 'Upload thất bại',
    'error.processFailed': 'Xử lý ảnh thất bại',
    'error.fileNotFound': 'Không tìm thấy file',
    'error.deleteFailed': 'Xóa thất bại',
    'error.invalidEmail': 'Email người nhận không hợp lệ',
    'error.sendEmailFailed': 'Gửi email thất bại',
    'error.smtpNotConfigured': 'SMTP chưa cấu hình',
    'error.sesFromRequired': 'SES_FROM chưa cấu hình',
  },
  en: {
    'error.noFile': 'No file uploaded',
    'error.onlyImages': 'Only image files are allowed',
    'error.uploadFailed': 'Upload failed',
    'error.processFailed': 'Process failed',
    'error.fileNotFound': 'File not found',
    'error.deleteFailed': 'Delete failed',
    'error.invalidEmail': 'Invalid recipient email',
    'error.sendEmailFailed': 'Failed to send email',
    'error.smtpNotConfigured': 'SMTP not configured',
    'error.sesFromRequired': 'SES_FROM not configured',
  },
};

export const DEFAULT_LOCALE: Locale = 'vi';
