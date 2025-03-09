# Chat App Backend

## Commit Rules

Một commit message phải đúng format như sau:

```bash
<type>(<scope>): message
```

Trong đó:

- `<type>`: là loại của commit, có thể là:
    - `feat`: Thêm một chức năng mới
    - `fix`: Sửa một lỗi
    - `docs`: Sửa lỗi hoặc thêm mới về tài liệu (ví dụ README.md)
    - `style`: Sửa lỗi hoặc thêm mới về code style frontend
    - `refactor`: Sửa lỗi hoặc thêm mới về code mà không ảnh hưởng đến chức năng
    - `perf`: Sửa lỗi hoặc thêm mới về hiệu suất
    - `test`: Sửa lỗi hoặc thêm mới về test
    - `bug`: Push code có lỗi hoặc chưa hoàn thiện cho người khác hỗ trợ

- `<scope>`: là mô tả về phạm vi các file hoặc module bị ảnh hưởng bởi commit
    - Ví dụ: `login`, `database`, `wiki`, ...

- `message`: là nội dung của commit, mô tả về những thay đổi cụ thể
    - Ví dụ: `fix bug login`, `add new feature login`, `update README.md`, ...
