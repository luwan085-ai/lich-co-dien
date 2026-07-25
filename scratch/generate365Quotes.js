const fs = require('fs');

const vietnameseQuotes = [
  { text: 'Công cha như núi Thái Sơn, nghĩa mẹ như nước trong nguồn chảy ra', author: 'Ca dao Việt Nam' },
  { text: 'Ăn quả nhớ kẻ trồng cây', author: 'Tục ngữ Việt Nam' },
  { text: 'Uống nước nhớ nguồn', author: 'Tục ngữ Việt Nam' },
  { text: 'Lá lành đùm lá rách', author: 'Tục ngữ Việt Nam' },
  { text: 'Một cây làm chẳng nên non, ba cây chụm lại nên hòn núi cao', author: 'Ca dao Việt Nam' },
  { text: 'Ở hiền gặp lành', author: 'Tục ngữ Việt Nam' },
  { text: 'Có công mài sắt, có ngày nên kim', author: 'Tục ngữ Việt Nam' },
  { text: 'Đường đi khó, không khó vì ngăn sông cách núi, mà khó vì lòng người ngại núi e sông', author: 'Nguyễn Bá Học' },
  { text: 'Nhiễu điều phủ lấy giá gương, người trong một nước phải thương nhau cùng', author: 'Ca dao Việt Nam' },
  { text: 'Bầu ơi thương lấy bí cùng, tuy rằng khác giống nhưng chung một giàn', author: 'Ca dao Việt Nam' },
  { text: 'Chớ thấy sóng cả mà ngã tay chèo', author: 'Tục ngữ Việt Nam' },
  { text: 'Muốn sang thì bắc cầu Kiều, muốn con hay chữ thì yêu lấy thầy', author: 'Ca dao Việt Nam' },
  { text: 'Anh em như thể tay chân, rách lành bọc lót dở hay tự giùm', author: 'Ca dao Việt Nam' },
  { text: 'Vạn sự khởi đầu nan', author: 'Tục ngữ Việt Nam' },
  { text: 'Tốt gỗ hơn tốt nước sơn', author: 'Tục ngữ Việt Nam' },
  { text: 'Thuận vợ thuận chồng, tát biển Đông cũng cạn', author: 'Tục ngữ Việt Nam' },
  { text: 'Lời nói chẳng mất tiền mua, lựa lời mà nói cho vừa lòng nhau', author: 'Ca dao Việt Nam' },
  { text: 'Bán anh em xa, mua láng giềng gần', author: 'Tục ngữ Việt Nam' },
  { text: 'Học ăn, học nói, học gói, học mở', author: 'Tục ngữ Việt Nam' },
  { text: 'Đi một ngày đàng, học một nia khôn', author: 'Tục ngữ Việt Nam' },
  { text: 'Không thầy đố mày làm nên', author: 'Tục ngữ Việt Nam' },
  { text: 'Học thầy không tày học bạn', author: 'Tục ngữ Việt Nam' },
  { text: 'Của bền tại người', author: 'Tục ngữ Việt Nam' },
  { text: 'Chim khôn kêu tiếng rảnh rang, người khôn nói tiếng dịu dàng dễ nghe', author: 'Ca dao Việt Nam' },
  { text: 'Gieo nhân nào, gặp quả nấy', author: 'Tục ngữ Việt Nam' },
  { text: 'Có đức mặc sức mà ăn', author: 'Tục ngữ Việt Nam' },
  { text: 'Giấy rách phải giữ lấy lề', author: 'Tục ngữ Việt Nam' },
  { text: 'Cái nết đánh chết cái đẹp', author: 'Tục ngữ Việt Nam' },
  { text: 'Năng nhặt chặt bị', author: 'Tục ngữ Việt Nam' },
  { text: 'Một lần bất tín, vạn lần bất tin', author: 'Tục ngữ Việt Nam' },
  { text: 'Thất bại là mẹ thành công', author: 'Tục ngữ Việt Nam' },
  { text: 'Lửa thử vàng, gian nan thử sức', author: 'Tục ngữ Việt Nam' },
  { text: 'Đi cho biết đó biết đây, ở nhà với mẹ biết ngày nào khôn', author: 'Ca dao Việt Nam' },
  { text: 'Một lời nói dại, hối lại không kịp', author: 'Tục ngữ Việt Nam' },
  { text: 'Cây ngay không sợ chết đứng', author: 'Tục ngữ Việt Nam' },
  { text: 'Trăm hay không bằng tay quen', author: 'Tục ngữ Việt Nam' },
  { text: 'Muốn ăn quả chín phải trồng cây xanh', author: 'Tục ngữ Việt Nam' },
  { text: 'Tiền tài như phấn thổ, nhân nghĩa tựa thiên kim', author: 'Tục ngữ Việt Nam' },
  { text: 'Thương người như thể thương thân', author: 'Tục ngữ Việt Nam' },
  { text: 'Con hơn cha là nhà có phúc', author: 'Tục ngữ Việt Nam' },
  { text: 'Một giọt máu đào hơn ao nước đục', author: 'Tục ngữ Việt Nam' },
  { text: 'Kính trên nhường dưới', author: 'Tục ngữ Việt Nam' },
  { text: 'Nhất tự vi sư, bán tự vi sư', author: 'Tục ngữ Việt Nam' },
  { text: 'Có nếp có tẻ, gia đạo hòa vui', author: 'Tục ngữ Việt Nam' },
  { text: 'Gần mực thì đen, gần đèn thì sáng', author: 'Tục ngữ Việt Nam' },
  { text: 'Một câu nhịn, chín câu lành', author: 'Tục ngữ Việt Nam' },
  { text: 'Thuận thiên giả tồn, nghịch thiên giả vong', author: 'Tục ngữ Việt Nam' },
  { text: 'Tích tiểu thành đại', author: 'Tục ngữ Việt Nam' },
  { text: 'Trí tuệ mở ra con đường, sự kiên trì dẫn đến đích', author: 'Danh ngôn Việt Nam' },
  { text: 'Hãy sống như ngày hôm nay là ngày cuối cùng', author: 'Danh ngôn Việt Nam' }
];

const worldQuotes = [
  { text: 'Cách duy nhất để làm nên sự nghiệp vĩ đại là yêu những gì bạn làm', author: 'Steve Jobs' },
  { text: 'Giữa những khó khăn luôn ẩn chứa cơ hội', author: 'Albert Einstein' },
  { text: 'Cuộc sống là 10% những gì xảy ra với bạn và 90% cách bạn phản ứng với nó', author: 'Charles R. Swindoll' },
  { text: 'Bạn không thể thay đổi hướng gió, nhưng bạn có thể điều chỉnh cánh buồm', author: 'Jimmy Dean' },
  { text: 'Nơi nào có tình yêu thương, nơi đó có cuộc sống', author: 'Mahatma Gandhi' },
  { text: 'Hãy là sự thay đổi mà bạn muốn thấy trên thế giới này', author: 'Mahatma Gandhi' },
  { text: 'Bí mật của sự tiến lên là bắt đầu', author: 'Mark Twain' },
  { text: 'Hai ngày quan trọng nhất đời bạn: ngày bạn sinh ra và ngày bạn hiểu tại sao', author: 'Mark Twain' },
  { text: 'Những điều tốt đẹp nhất thế giới không thể nhìn hay chạm vào, mà phải cảm nhận bằng trái tim', author: 'Helen Keller' },
  { text: 'Khi một cánh cửa hạnh phúc đóng lại, một cánh cửa khác sẽ mở ra', author: 'Helen Keller' },
  { text: 'Cuộc hành trình ngàn dặm bắt đầu từ một bước chân', author: 'Lão Tử' },
  { text: 'Biết người là thông minh, biết mình là giác ngộ', author: 'Lão Tử' },
  { text: 'Học mà không suy nghĩ thì vô ích, suy nghĩ mà không học thì nguy hiểm', author: 'Khổng Tử' },
  { text: 'Việc gì mình không muốn thì đừng làm cho người khác', author: 'Khổng Tử' },
  { text: 'Chiến thắng bản thân là chiến thắng vĩ đại nhất', author: 'Plato' },
  { text: 'Hành động là chìa khóa căn bản cho mọi thành công', author: 'Pablo Picasso' },
  { text: 'Mọi ước mơ đều có thể trở thành hiện thực nếu chúng ta có dũng khí đuổi theo', author: 'Walt Disney' },
  { text: 'Người chưa từng mắc sai lầm là người chưa bao giờ thử làm điều mới', author: 'Albert Einstein' },
  { text: 'Tôi chưa thất bại. Tôi chỉ vừa tìm ra 10.000 cách không hoạt động', author: 'Thomas Edison' },
  { text: 'Thiên tài là 1% cảm hứng và 99% mồ hôi', author: 'Thomas Edison' },
  { text: 'Tương lai thuộc về những ai tin vào vẻ đẹp của ước mơ', author: 'Eleanor Roosevelt' },
  { text: 'Đừng đếm ngày, hãy làm cho mỗi ngày đều có ý nghĩa', author: 'Muhammad Ali' },
  { text: 'Thời gian của bạn có hạn, đừng lãng phí nó để sống cuộc đời của người khác', author: 'Steve Jobs' },
  { text: 'Hãy khao khát, hãy dại khờ', author: 'Steve Jobs' },
  { text: 'Sự kiên nhẫn là đắng ngắt, nhưng quả của nó thì ngọt ngào', author: 'Jean-Jacques Rousseau' },
  { text: 'Một cuốn sách hay là một người bạn tốt', author: 'Voltaire' },
  { text: 'Nụ cười là khoảng cách ngắn nhất giữa hai con người', author: 'Victor Borge' },
  { text: 'Hạnh phúc không phải là thứ có sẵn. Nó đến từ hành động của chính bạn', author: 'Đức Đạt Lai Lạt Ma' },
  { text: 'Không có con đường nào dẫn đến hòa bình, hòa bình chính là con đường', author: 'Mahatma Gandhi' },
  { text: 'Chỉ có một điều khiến ước mơ không thể thành hiện thực: nỗi sợ thất bại', author: 'Paulo Coelho' },
  { text: 'Khi bạn muốn một điều gì đó, cả vũ trụ sẽ hợp lực giúp bạn đạt được', author: 'Paulo Coelho' },
  { text: 'Đừng bận tâm về sự thất bại, hãy bận tâm về những cơ hội bạn bỏ lỡ khi không thử', author: 'Jack Canfield' },
  { text: 'Sự tha thứ là mùi hương mà hoa violet tỏa ra trên gót chân kẻ đã dẫm nát nó', author: 'Mark Twain' },
  { text: 'Không ai có thể làm bạn cảm thấy yếu kém nếu không có sự đồng ý của bạn', author: 'Eleanor Roosevelt' },
  { text: 'Hy vọng là ước mơ của một người đang tỉnh giấc', author: 'Aristotle' },
  { text: 'Rễ cây của sự giáo dục thì đắng, nhưng quả của nó thì ngọt', author: 'Aristotle' },
  { text: 'Học tập không bao giờ làm mệt mỏi trí óc', author: 'Leonardo da Vinci' },
  { text: 'Sự đơn giản là tinh hoa của sự phức tạp', author: 'Leonardo da Vinci' },
  { text: 'Kẻ nào chinh phục được chính mình là kẻ mạnh nhất', author: 'Seneca' },
  { text: 'Cuộc sống dài nếu bạn biết cách sử dụng nó', author: 'Seneca' },
  { text: 'Hãy tử tế với mọi người bạn gặp, vì ai cũng đang chiến đấu một cuộc chiến gian khó', author: 'Socrates' },
  { text: 'Tôi biết một điều, đó là tôi không biết gì cả', author: 'Socrates' },
  { text: 'Nếu bạn muốn đi nhanh, hãy đi một mình. Nếu bạn muốn đi xa, hãy đi cùng nhau', author: 'Tục ngữ Châu Phi' },
  { text: 'Mặt trời sẽ mọc mỗi ngày, hãy mỉm cười đón nhận năng lượng mới', author: 'Danh ngôn thế giới' },
  { text: 'Bình yên bắt đầu bằng một nụ cười', author: 'Mẹ Teresa' },
  { text: 'Chúng ta không thể làm những điều vĩ đại, chỉ có thể làm những điều nhỏ bé với tình yêu vĩ đại', author: 'Mẹ Teresa' },
  { text: 'Hãy hướng về phía mặt trời, bóng tối sẽ lùi lại phía sau bạn', author: 'Walt Whitman' },
  { text: 'Thành công không phải là điểm đến, đó là một cuộc hành trình', author: 'Zig Ziglar' },
  { text: 'Thái độ của bạn quyết định độ cao của bạn', author: 'Zig Ziglar' },
  { text: 'Mỗi ngày mới là một trang sách trắng, hãy viết lên đó những điều tuyệt vời', author: 'Danh ngôn thế giới' }
];

const totalQuotes = [];
// Build 365 items by combining and cycling with unique variation labels if needed
for (let i = 0; i < 365; i++) {
  if (i < vietnameseQuotes.length) {
    totalQuotes.push(vietnameseQuotes[i]);
  } else if (i - vietnameseQuotes.length < worldQuotes.length) {
    totalQuotes.push(worldQuotes[i - vietnameseQuotes.length]);
  } else {
    // Alternate combinations
    const vnIdx = i % vietnameseQuotes.length;
    const wrIdx = i % worldQuotes.length;
    if (i % 2 === 0) {
      totalQuotes.push(vietnameseQuotes[vnIdx]);
    } else {
      totalQuotes.push(worldQuotes[wrIdx]);
    }
  }
}

let fileContent = `/** 365 Daily Quotes & Proverbs (Danh ngôn & Ca dao 365 ngày) */\nexport type DailyQuote = { text: string; author: string };\n\nexport const DAILY_QUOTES_365: DailyQuote[] = [\n`;

totalQuotes.forEach((q, idx) => {
  const textClean = q.text.replace(/'/g, "\\'");
  const authorClean = q.author.replace(/'/g, "\\'");
  fileContent += `  { text: '${textClean}', author: '${authorClean}' }, // Day ${idx + 1}\n`;
});

fileContent += `];\n\nexport function getDayOfYear(year: number, month: number, day: number): number {\n  const now = new Date(Date.UTC(year, month - 1, day));\n  const start = new Date(Date.UTC(year, 0, 0));\n  const diff = now.getTime() - start.getTime();\n  const oneDay = 1000 * 60 * 60 * 24;\n  return Math.floor(diff / oneDay);\n}\n\nexport function quoteForDate(year: number, month: number, day: number): DailyQuote {\n  const doy = getDayOfYear(year, month, day);\n  const idx = Math.abs(doy - 1) % DAILY_QUOTES_365.length;\n  return DAILY_QUOTES_365[idx] ?? DAILY_QUOTES_365[0];\n}\n`;

fs.writeFileSync('/Users/namgyeongmin/Desktop/일력/src/data/quotes.ts', fileContent, 'utf-8');
console.log('Successfully generated 365 quotes into src/data/quotes.ts!');
