export const TIPS = [
  {
    en: { tip: "Connection before correction: a child's brain can only learn from someone it feels safe with. Calm first, teach second.", source: "Developmental psychology" },
    vi: { tip: "Kết nối trước, uốn nắn sau: não trẻ chỉ học được từ người khiến con thấy an toàn. Bình tĩnh trước, dạy sau.", source: "Tâm lý học phát triển" },
  },
  {
    en: { tip: "Praise the effort, not the label. \"You kept trying\" builds more courage than \"You're so smart.\"", source: "Growth mindset research" },
    vi: { tip: "Khen nỗ lực, đừng dán nhãn. \"Con đã kiên trì thử\" nuôi lòng can đảm hơn \"Con thông minh quá.\"", source: "Nghiên cứu tư duy phát triển" },
  },
  {
    en: { tip: "End screen time before it starts: agree on the stopping point together, in advance. Brains accept limits they helped set.", source: "Behavioral science" },
    vi: { tip: "Kết thúc giờ màn hình từ trước khi bắt đầu: cùng con thỏa thuận điểm dừng. Não dễ chấp nhận giới hạn mà nó góp phần đặt ra.", source: "Khoa học hành vi" },
  },
  {
    en: { tip: "Di Zi Gui reminds us: speak first with a calm face. Children read your face before they hear your words.", source: "Di Zi Gui" },
    vi: { tip: "Đệ Tử Quy nhắc ta: nói với gương mặt ôn hòa trước đã. Trẻ đọc nét mặt của bạn trước khi nghe lời bạn.", source: "Đệ Tử Quy" },
  },
  {
    en: { tip: "Ten minutes of full attention beats two hours of half attention. Put the phone in another room for one small ritual today.", source: "Attachment research" },
    vi: { tip: "Mười phút chú ý trọn vẹn quý hơn hai giờ chú ý nửa vời. Hôm nay hãy để điện thoại ở phòng khác trong một khoảnh khắc nhỏ cùng con.", source: "Nghiên cứu gắn bó" },
  },
  {
    en: { tip: "Name it to tame it: helping a child say \"I'm frustrated\" activates the calming part of the brain.", source: "Neuroscience (Dan Siegel)" },
    vi: { tip: "Gọi được tên thì dịu được lòng: giúp con nói \"Con đang bực\" sẽ kích hoạt vùng não làm dịu cảm xúc.", source: "Khoa học não bộ (Dan Siegel)" },
  },
  {
    en: { tip: "Repair beats perfection. After you lose your temper, a sincere \"I'm sorry, let's try again\" teaches more than never failing.", source: "Family therapy" },
    vi: { tip: "Sửa chữa quý hơn hoàn hảo. Sau khi lỡ nóng giận, một câu chân thành \"Bố/Mẹ xin lỗi, mình làm lại nhé\" dạy con nhiều hơn cả việc không bao giờ sai.", source: "Trị liệu gia đình" },
  },
];

export const MISSIONS = [
  { en: "Give your child 5 minutes of full, phone-free attention.", vi: "Dành cho con 5 phút chú ý trọn vẹn, không điện thoại." },
  { en: "Catch your child doing something kind — and name it out loud.", vi: "Bắt gặp con làm một điều tử tế — và khen thành lời." },
  { en: "At dinner, everyone shares one good thing and who made it possible.", vi: "Bữa tối, mỗi người kể một điều tốt và ai đã giúp điều đó xảy ra." },
  { en: "Lower your voice once, exactly when you want to raise it.", vi: "Hạ giọng một lần, đúng lúc bạn muốn cao giọng." },
  { en: "Ask your child: \"What was the best part of your day?\" — then only listen.", vi: "Hỏi con: \"Hôm nay điều gì vui nhất?\" — rồi chỉ lắng nghe." },
  { en: "Tell your child one thing you appreciate about who they are (not what they did).", vi: "Nói với con một điều bạn trân trọng ở con người con (không phải việc con làm)." },
  { en: "Do the last 30 minutes before bed with no screens — for the whole family.", vi: "30 phút cuối trước khi ngủ, cả nhà không màn hình." },
];

export function getTipOfTheDay(date = new Date()) {
  return TIPS[Math.floor(date.getTime() / 86400000) % TIPS.length];
}
export function getMissionOfTheDay(date = new Date()) {
  return MISSIONS[Math.floor(date.getTime() / 86400000) % MISSIONS.length];
}
export function dateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}
