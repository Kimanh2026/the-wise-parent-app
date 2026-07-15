// The Wisdom Guide: a built-in, offline coach used when the server has no
// Anthropic API key or the API call fails. Keyword-routed, hand-written advice
// following the same rules: warm, no shame, one simple action.

const TOPICS = [
  {
    keys: ["screen", "phone", "ipad", "tablet", "youtube", "tiktok", "tv", "game", "gaming", "màn hình", "điện thoại", "chơi game"],
    en: `Screens are designed to hold attention, so it's not a weakness in you or your child — it's biology meeting very clever engineering. Dopamine loops make stopping genuinely hard for a young brain.

Ancient wisdom agrees with modern science here: Di Zi Gui teaches "When there is order, the mind is at ease." Children fight limits less when limits are predictable, not personal.

Instead of pulling the device away mid-video (which triggers a fight), set the ending *before* it starts: "Two episodes, then we water the plants together." The brain accepts limits it agreed to in advance far more easily.

Tonight, try this: agree on tomorrow's screen plan with your child before bed — when, how long, and the fun thing that comes after. Write it where they can see it.`,
    vi: `Màn hình được thiết kế để giữ sự chú ý, nên đây không phải lỗi của bạn hay của con — đó là não bộ gặp công nghệ quá khéo léo.

Đệ Tử Quy dạy: khi mọi việc có nề nếp, tâm sẽ an. Trẻ ít chống đối khi giới hạn được báo trước, thay vì bất ngờ.

Thay vì giật thiết bị giữa chừng (dễ gây xung đột), hãy thỏa thuận điểm dừng *trước khi* con bắt đầu xem: "Hai tập, rồi mình cùng tưới cây nhé."

Tối nay, hãy thử: cùng con lên kế hoạch màn hình cho ngày mai — xem lúc nào, bao lâu, và việc vui gì sẽ làm sau đó. Viết ra nơi con nhìn thấy.`,
  },
  {
    keys: ["angry", "anger", "tantrum", "yell", "scream", "meltdown", "giận", "ăn vạ", "la hét", "cáu"],
    en: `Big feelings are not bad behavior — they are a young brain still building its braking system. The prefrontal cortex, which calms emotion, isn't fully wired until the mid-20s. Your child isn't giving you a hard time; they're having a hard time.

The old teachers knew this too: "First calm the water, then look into it." A child in a storm cannot hear reasons.

So connect before you correct. Get low, soften your voice, name the feeling: "You're really angry. I'm here." Teaching comes later, when the storm passes.

Tonight, try this: when the next meltdown starts, say only one sentence — "I'm here, you're safe" — and wait. Count your own ten slow breaths while you wait.`,
    vi: `Cảm xúc lớn không phải là hư — đó là bộ não non trẻ chưa xây xong "hệ thống phanh". Vùng não giúp bình tĩnh chỉ hoàn thiện sau tuổi 20. Con không cố làm khó bạn; con đang gặp khó.

Người xưa dạy: nước lặng rồi mới soi được. Trẻ đang trong "cơn bão" thì không nghe được lý lẽ.

Vậy hãy kết nối trước, uốn nắn sau. Hạ thấp người, dịu giọng, gọi tên cảm xúc: "Con đang rất giận. Mẹ/Bố ở đây."

Tối nay, hãy thử: khi con bùng nổ, chỉ nói một câu — "Bố/Mẹ ở đây, con an toàn" — rồi chờ, và tự hít thở chậm mười nhịp.`,
  },
  {
    keys: ["respect", "rude", "talk back", "disrespect", "lễ phép", "hỗn", "cãi"],
    en: `Respect is learned by receiving it, not by demanding it. Children copy tone long before they understand lectures — mirror neurons make your calm (or your sharpness) contagious.

Di Zi Gui begins with respect at home because the home is the rehearsal room for all other relationships. But it teaches respect as warmth with order, never fear.

When your child speaks rudely, resist the urge to win the moment. Stay steady: "I want to hear you. Try that again in your respectful voice." Then genuinely listen when they do — that's the reward that rewires the habit.

Tonight, try this: catch your child speaking kindly once, and name it out loud: "That was a respectful way to ask. I love hearing that."`,
    vi: `Trẻ học lễ phép bằng cách được đối xử lễ phép, không phải bằng cách bị ép. Trẻ bắt chước giọng điệu trước khi hiểu lời dạy.

Đệ Tử Quy bắt đầu từ sự kính trọng trong gia đình, vì gia đình là nơi tập dượt cho mọi mối quan hệ. Nhưng kính trọng đến từ ấm áp và nề nếp, không phải sợ hãi.

Khi con nói hỗn, đừng cố "thắng". Hãy giữ giọng vững: "Mẹ/Bố muốn nghe con. Con nói lại bằng giọng lễ phép nhé." Rồi thật sự lắng nghe khi con làm được.

Tối nay, hãy thử: bắt gặp một lần con nói năng tử tế và khen ngay: "Con hỏi rất lễ phép. Mẹ/Bố rất vui khi nghe vậy."`,
  },
  {
    keys: ["sleep", "bedtime", "wake", "ngủ", "giờ đi ngủ"],
    en: `Bedtime battles usually aren't about sleep — they're about separation and transition. A child's brain treats sudden endings ("Bed! Now!") as small alarms.

The gentle path is a rhythm, not a rule. The same 3–4 steps in the same order every night (bath → pajamas → story → light off) let the body start producing melatonin before the head touches the pillow. Old households knew this as "evening order brings morning peace."

Keep the last 30 minutes dim and screen-free; blue light delays the sleep hormone by up to an hour.

Tonight, try this: tell your child the bedtime steps as a little story — "First bath, then our book, then I'll tuck you in" — and follow the exact same order.`,
    vi: `"Trận chiến giờ ngủ" thường không phải vì giấc ngủ, mà vì sự chuyển tiếp quá đột ngột. Não trẻ coi mệnh lệnh bất ngờ ("Đi ngủ ngay!") như một báo động nhỏ.

Cách nhẹ nhàng là nhịp điệu, không phải mệnh lệnh: 3–4 bước giống nhau, thứ tự giống nhau mỗi tối (tắm → đồ ngủ → đọc truyện → tắt đèn). Cơ thể sẽ tự tiết melatonin trước khi con nằm xuống.

30 phút cuối nên giảm ánh sáng và không màn hình — ánh sáng xanh làm chậm hormone ngủ đến cả tiếng.

Tối nay, hãy thử: kể trước các bước như một câu chuyện nhỏ — "Tắm xong, mình đọc sách, rồi mẹ đắp chăn cho con" — và làm đúng thứ tự đó.`,
  },
  {
    keys: ["grateful", "gratitude", "thank", "spoiled", "biết ơn", "cảm ơn"],
    en: `Gratitude isn't taught by saying "say thank you" — that trains manners, not the heart. Real gratitude grows from *noticing*: seeing the effort behind things.

The old teaching says: "Who eats the rice should know the farmer's sweat." Neuroscience adds that naming good things activates the brain's reward circuits, making appreciation feel good and self-repeating.

So make noticing a family habit, not a correction. At dinner, each person shares one small good thing and *who made it possible*. Children copy what the family repeats.

Tonight, try this: at dinner or bedtime, ask "What was one good thing today — and who helped make it happen?" Answer first, so your child hears how it sounds.`,
    vi: `Lòng biết ơn không đến từ việc bắt con "nói cảm ơn đi" — đó chỉ là phép lịch sự. Biết ơn thật sự lớn lên từ việc *nhận ra* công sức phía sau mọi thứ.

Người xưa dạy: ăn bát cơm, nhớ người cày ruộng. Khoa học não bộ cho biết: gọi tên điều tốt kích hoạt vùng tưởng thưởng, khiến sự trân trọng trở thành thói quen dễ chịu.

Hãy biến "nhận ra" thành nếp nhà: mỗi bữa tối, mỗi người kể một điều tốt nhỏ và *ai đã giúp điều đó xảy ra*.

Tối nay, hãy thử: hỏi con "Hôm nay có điều gì vui — và ai đã giúp con có điều đó?" Bạn trả lời trước để con nghe mẫu.`,
  },
];

const GENERIC = {
  en: `Thank you for sharing this — the fact that you're asking already says a lot about the parent you are.

Two anchors help in almost every situation. First, connection before correction: a child's brain can only learn from someone it feels safe with, so calm yourself first, then get close, then guide. Second, small and consistent beats big and occasional — the nervous system learns from repetition, not intensity. Di Zi Gui's quiet insight is the same: daily small conduct shapes the heart.

Pick the smallest version of the change you want, and repeat it warmly every day this week.

Tonight, try this: choose one 5-minute moment of full attention with your child — no phone, no teaching, just presence — and protect it like an appointment.

(For advice tailored exactly to your situation, the live AI Coach will respond here once the app's server key is configured — see Settings.)`,
  vi: `Cảm ơn bạn đã chia sẻ — việc bạn đặt câu hỏi đã nói lên nhiều điều về người cha/mẹ trong bạn.

Hai điểm tựa giúp ích trong hầu hết tình huống. Một: kết nối trước, uốn nắn sau — não trẻ chỉ học được từ người khiến con thấy an toàn. Hai: nhỏ mà đều thắng lớn mà thỉnh thoảng — hệ thần kinh học từ sự lặp lại, không phải cường độ. Đệ Tử Quy cũng dạy như vậy: nết nhỏ mỗi ngày nuôi tâm lớn.

Hãy chọn phiên bản nhỏ nhất của thay đổi bạn muốn, và lặp lại nó một cách ấm áp mỗi ngày tuần này.

Tối nay, hãy thử: dành 5 phút chú ý trọn vẹn cho con — không điện thoại, không dạy dỗ, chỉ hiện diện.

(Khi máy chủ được kết nối API, AI Coach trực tiếp sẽ trả lời riêng cho tình huống của bạn ngay tại đây — xem phần Cài đặt.)`,
};

export function getFallbackReply(lastMessage, language = "en") {
  const text = String(lastMessage || "").toLowerCase();
  for (const t of TOPICS) {
    if (t.keys.some((k) => text.includes(k))) return language === "vi" ? t.vi : t.en;
  }
  return language === "vi" ? GENERIC.vi : GENERIC.en;
}
