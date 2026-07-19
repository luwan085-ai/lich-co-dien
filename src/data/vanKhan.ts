/**
 * Short văn khấn texts — original concise pack for Mùng 1 / Rằm / Thần Tài.
 * Designed for on-screen reading at bàn thờ (not scraped copyright long-form).
 */

export type VanKhanId = 'mung1' | 'ram' | 'thanTai';

export type VanKhanArticle = {
  id: VanKhanId;
  title: string;
  subtitle: string;
  body: string;
};

export const VAN_KHAN: Record<VanKhanId, VanKhanArticle> = {
  mung1: {
    id: 'mung1',
    title: 'Bài cúng Mùng 1 · Thần Tài ngắn gọn',
    subtitle: 'Đọc to trước bàn thờ ngày mùng 1 âm lịch',
    body: `Nam mô A Di Đà Phật!

Con kính lạy:
Hoàng thiên hậu thổ chư vị tôn thần,
Ngài Đông Trù Tư Mệnh Táo phủ thần quân,
Ngài Bản cảnh Thành hoàng,
Ngài Thần Tài · Ông Địa thánh chúng.

Hôm nay ngày mùng một tháng ... năm ...,
gia đình con thành tâm sắm sửa hương hoa quả phẩm,
cúi xin chư vị chứng giám.

Cầu cho gia đạo bình an, làm ăn tấn tới,
khách đến như mây, tiền vào như nước,
tránh dữ gặp lành, vạn sự như ý.

Con lễ bạc tâm thành, cúi xin chứng giám.
Nam mô A Di Đà Phật!`,
  },
  ram: {
    id: 'ram',
    title: 'Bài cúng Ngày Rằm · Gia tiên',
    subtitle: 'Rằm tháng âm · nhớ ơn tổ tiên',
    body: `Nam mô A Di Đà Phật!

Con kính lạy:
Chư Phật mười phương,
Hương linh cao tằng tổ khảo, tổ tỷ,
các vị tiên linh nội ngoại họ tộc.

Hôm nay ngày rằm tháng ...,
con cháu thành tâm dâng hương hoa trà quả,
nhớ ơn dưỡng dục sinh thành.

Cúi xin hương linh phù hộ độ trì,
con cháu khỏe mạnh, học hành tấn tới,
công việc thuận lợi, gia đạo hòa thuận,
tứ thời được bình an.

Lễ bạc tâm thành, cúi xin chứng giám.
Nam mô A Di Đà Phật!`,
  },
  thanTai: {
    id: 'thanTai',
    title: 'Văn khấn Thần Tài cầu tài lộc',
    subtitle: 'Có thể đọc hàng ngày khi thắp hương',
    body: `Nam mô A Di Đà Phật!

Con kính lạy Ngài Thần Tài · Ông Địa.
Hôm nay con thành tâm dâng hương,
cúi xin Ngài chứng giám tấm lòng thành.

Xin ban cho cửa hàng / việc làm buôn may bán đắt,
tiền vô như nước, của cải hanh thông,
tránh tổn hao, thị phi, kẻ xấu quấy phá.

Con nguyện làm ăn chân chính, giúp người vừa sức,
để xứng với lộc Ngài ban.

Lễ bạc tâm thành. Nam mô A Di Đà Phật!`,
  },
};
