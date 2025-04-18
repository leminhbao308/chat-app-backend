const allowedFileTypes = {
  // Hình ảnh
  image: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/bmp',
    'image/tiff',
    'image/webp',
    'image/svg+xml',
    'image/heic',
    'image/heif'
  ],

  // Video
  video: [
    'video/mp4',
    'video/mpeg',
    'video/ogg',
    'video/webm',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-ms-wmv',
    'video/x-flv',
    'video/3gpp',
    'video/3gpp2'
  ],

  // Âm thanh
  audio: [
    'audio/mpeg',
    'audio/mp3',
    'audio/ogg',
    'audio/wav',
    'audio/webm',
    'audio/aac',
    'audio/midi',
    'audio/x-midi',
    'audio/flac',
    'audio/x-m4a'
  ],

  // Document files
  document: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
    'text/plain',
    'text/csv',
    'text/html',
    'application/rtf',
    'application/vnd.oasis.opendocument.text', // .odt
    'application/vnd.oasis.opendocument.spreadsheet', // .ods
    'application/vnd.oasis.opendocument.presentation', // .odp
    'application/epub+zip',
    'application/zip',
    'application/x-7z-compressed',
    'application/x-rar-compressed'
  ]
};

// Tạo một mảng phẳng chứa tất cả các loại file được phép
const allAllowedFileTypes = Object.values(allowedFileTypes).flat();

const FileTypeUtil = {
  allowedFileTypes,
  allAllowedFileTypes
}

// Export cả đối tượng phân loại và mảng phẳng
export default FileTypeUtil;