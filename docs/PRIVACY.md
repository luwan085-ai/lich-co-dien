# Chính sách bảo mật — Lịch Cổ Điển

**Cập nhật:** 2026-07-19

Ứng dụng **Lịch Cổ Điển** tôn trọng quyền riêng tư. Tài liệu này mô tả dữ liệu được xử lý trên thiết bị của bạn.

## Dữ liệu lưu trên máy (local)

Ứng dụng ưu tiên **local-first**. Các mục sau được lưu trên thiết bị (AsyncStorage / bộ nhớ máy), không gửi lên máy chủ của chúng tôi:

- Ghi chú ngày, đánh dấu **giỗ / kỷ niệm** (theo âm lịch)
- Cam kết / lời hứa ngày và dấu đóng
- Tùy chọn widget, vùng giá xăng
- Lịch sử ghé thăm nhẹ (welcome-back)
- Trạng thái Premium thử nghiệm (mock) khi chưa gắn RevenueCat

## Thông báo

Nếu bạn bật nhắc **Rằm / Mùng Một** hoặc **Giỗ âm lịch**, hệ thống thông báo của iOS/Android sẽ nhận lịch nhắc cục bộ. Nội dung nhắc không chứa dữ liệu nhạy cảm ngoài tiêu đề / nội dung bạn đã ghi chú ngắn.

## Mạng (tuỳ chọn)

Khi có kết nối, ứng dụng có thể gọi API công khai để hiển thị:

- Giá vàng SJC / tham chiếu
- Giá xăng Petrolimex (Vùng 1 · 2)
- Tin ngắn (nếu widget tin được bật)

Dữ liệu thị trường có thể dùng bản dự phòng khi mất mạng.

## Quảng cáo & mua hàng (khi cấu hình)

Bản production có thể dùng:

- **Google AdMob** (quảng cáo thưởng mở tử vi)
- **RevenueCat / App Store / Google Play** (gói Premium)

Các bên đó xử lý dữ liệu theo chính sách riêng và theo quy định cửa hàng. Bạn có thể dùng bản thử local (mock) khi chưa gắn khóa API.

## Trẻ em

Ứng dụng không dành để thu thập dữ liệu trẻ em. Khối cặp số may mắn (00–99) chỉ mang tính giải trí; người dưới 18 tuổi không nên tham gia xổ số.

## Liên hệ

Câu hỏi về quyền riêng tư: cập nhật email / form khi đăng ký tài khoản nhà phát hành trên cửa hàng.

---

*Host file này trên GitHub Pages / Notion / Cloudflare Pages và dán URL công khai vào `EXPO_PUBLIC_PRIVACY_URL` trước khi submit store.*
