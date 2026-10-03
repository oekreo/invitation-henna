/* =====================================================
   1) بيانات الدعوة — غيّر كل شيء من هذا المكان فقط
   ===================================================== */
const weddingData = {
  groomName: "علي عبدالكاظم البهادلي",
  introLines: [
    // سطور الدعوة بالترتيب
    "بسم الله الذي زوج النور بالنور",
    "وعلى حب فاطمة وعلي (ع) نبدأ المسير",
    "بوافر من الحب والسعادة",
    "أتشرف بدعوتكم",
    "لمشاركتي حفل حنتي",
  ],
  weddingDate: "2026-10-12T18:00:00", // التاريخ والساعة (الساعة هنا للعدّاد فقط، غيّرها حسب الحفل)
  showTime: false, // true = تظهر الساعة بجانب التاريخ
  venueName: "قاعة العشق الملكية",
  venueAddress: "بغداد، زيونة",
  mapsLink:
    "https://waze.com/ul/hsvzted1ex" +
    encodeURIComponent("قاعة العشق الملكية زيونة بغداد"), // الأفضل استبداله برابط الموقع الدقيق
  photo: "groom.jpg", // صورة العريس
  musicFile: "زفة.mp3.mp3", // ضع ملفك بجانب الصفحة، أو "" لنغمة هادئة مدمجة
  shareUrl: "", // رابط الدعوة بعد رفعها
  eventId: "ali-henna", // يفصل تهاني هذه الدعوة عن غيرها في نفس الجدول
  supabaseUrl: "https://zyvzsyhtaktfwefyocvv.supabase.co",
  supabaseKey: "sb_publishable_dtG74CGgX7eQgs2ahF3Now_mZtYdjtV",
  locale: "ar-IQ",
  arabicDigits: true,
  sampleWishes: [],
};

/* =====================================================
   2) تجهيزات عامة
   ===================================================== */
const $ = (id) => document.getElementById(id);
const weddingDate = new Date(weddingData.weddingDate);
const loc = `${weddingData.locale}-u-nu-${weddingData.arabicDigits ? "arab" : "latn"}`;
const nf = new Intl.NumberFormat(loc, {
  minimumIntegerDigits: 2,
  useGrouping: false,
});
const dateText = new Intl.DateTimeFormat(loc, { dateStyle: "full" }).format(
  weddingDate,
);
const timeText = new Intl.DateTimeFormat(loc, { timeStyle: "short" }).format(
  weddingDate,
);
if (isNaN(weddingDate))
  console.error("weddingDate غير صالح، استخدم الصيغة 2026-12-18T19:00:00");

// تعبئة النصوص من البيانات
document.title = `دعوة حفل حنة ${weddingData.groomName}`;
weddingData.introLines.forEach((txt, i) => {
  const p = document.createElement("p");
  p.className = "rv";
  p.style.transitionDelay = `${i * 0.15}s`; // ظهور متتابع للسطور
  p.textContent = txt;
  $("lines").append(p);
});
$("groomName").textContent = weddingData.groomName;
$("whenText").textContent = weddingData.showTime
  ? `${dateText}، الساعة ${timeText}`
  : dateText;
$("venueLine").textContent =
  `${weddingData.venueName}، ${weddingData.venueAddress}`;
$("venueName").textContent = weddingData.venueName;
$("venueAddr").textContent = weddingData.venueAddress;
$("mapBtn").href = weddingData.mapsLink;
if (weddingData.photo) {
  $("groomPhoto").src = weddingData.photo;
  $("groomPhoto").alt = weddingData.groomName;
  $("groomPhoto").onerror = () => ($("photoWrap").hidden = true); // لا صورة = لا إطار فارغ
}

let toastTimer;
function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2600);
}

/* =====================================================
   3) العدّ التنازلي
   ===================================================== */
function tick() {
  const diff = Math.max(0, weddingDate - Date.now()) || 0;
  const s = Math.floor(diff / 1000);
  $("cd-d").textContent = nf.format(Math.floor(s / 86400));
  $("cd-h").textContent = nf.format(Math.floor((s % 86400) / 3600));
  $("cd-m").textContent = nf.format(Math.floor((s % 3600) / 60));
  $("cd-s").textContent = nf.format(s % 60);
  if (!diff) $("cdTitle").textContent = "حان موعد الفرحة 🎉";
}
tick();
setInterval(tick, 1000);

/* =====================================================
   4) الموسيقى (ملف mp3 أو نغمة مدمجة احتياطية)
   ===================================================== */
const audio = new Audio();
audio.loop = true;
if (weddingData.musicFile) audio.src = weddingData.musicFile;

let playing = false,
  useSynth = !weddingData.musicFile,
  ctx,
  master,
  synthTimer;

function startSynth() {
  master = ctx.createGain();
  master.gain.value = 0.16;
  master.connect(ctx.destination);
  const notes = [
    261.63, 329.63, 392, 523.25, 392, 329.63, 293.66, 349.23, 440, 349.23,
    329.63, 293.66,
  ];
  let i = 0;
  const note = () => {
    const t = ctx.currentTime,
      o = ctx.createOscillator(),
      g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = notes[i++ % notes.length];
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.6, t + 0.3);
    g.gain.exponentialRampToValueAtTime(0.001, t + 3.2);
    o.connect(g).connect(master);
    o.start(t);
    o.stop(t + 3.3);
  };
  note();
  synthTimer = setInterval(note, 1100);
}
function stopSynth() {
  clearInterval(synthTimer);
  if (master) master.disconnect();
}
function setMusicUI(on) {
  $("musicBtn").classList.toggle("on", on);
  $("musicBtn").setAttribute("aria-pressed", on);
  $("musicBtn").setAttribute(
    "aria-label",
    on ? "إيقاف الموسيقى" : "تشغيل الموسيقى",
  );
}
async function playMusic() {
  playing = true;
  setMusicUI(true);
  // نجهّز الصوت داخل لحظة الضغط نفسها لأن المتصفحات تمنعه بعدها
  ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
  ctx.resume();
  if (!useSynth) {
    try {
      await audio.play();
      return;
    } catch {
      useSynth = true;
    } // الملف غير موجود → النغمة المدمجة
  }
  if (playing) startSynth();
}
function stopMusic() {
  playing = false;
  setMusicUI(false);
  audio.pause();
  stopSynth();
}
$("musicBtn").addEventListener("click", () =>
  playing ? stopMusic() : playMusic(),
);

/* =====================================================
   5) فتح الدعوة
   ===================================================== */
function initReveal() {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.15 },
  );
  document.querySelectorAll(".rv").forEach((el) => io.observe(el));
}

$("openBtn").addEventListener("click", () => {
  const intro = $("intro");
  if (intro.classList.contains("open")) return;
  intro.classList.add("open"); // الظرف يُفتح والبطاقة تخرج
  playMusic(); // الموسيقى تبدأ بعد تفاعل المستخدم
  setTimeout(() => intro.classList.add("out"), 1500);
  setTimeout(() => {
    document.body.classList.remove("locked");
    $("page").inert = false;
    $("page").classList.add("shown");
    $("musicBtn").hidden = false;
    window.scrollTo(0, 0);
    initReveal();
  }, 1700);
  setTimeout(() => intro.remove(), 2800);
});

/* =====================================================
   6) دفتر التهاني — مشترك لكل الضيوف عبر Supabase
   (إذا تركت supabaseUrl فارغًا يُحفظ على جهاز الزائر فقط)
   ===================================================== */
const db =
  weddingData.supabaseUrl && window.supabase
    ? supabase.createClient(weddingData.supabaseUrl, weddingData.supabaseKey)
    : null;
if (!db) console.warn("Supabase غير متصل: التهاني تُحفظ على هذا الجهاز فقط");
const KEY = "wedding-wishes-" + weddingData.eventId; // مفتاح منفصل لكل دعوة
const savedWishes = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
};
function addCard({ name, text }) {
  const card = document.createElement("article");
  card.className = "wish";
  const n = document.createElement("b");
  const p = document.createElement("p");
  n.textContent = name; // textContent يمنع إدخال أكواد ضارة
  p.textContent = text;
  card.append(n, p);
  $("wishes").prepend(card); // الأحدث في الأعلى
}
async function loadWishes() {
  if (!db)
    return [...weddingData.sampleWishes, ...savedWishes()].forEach(addCard);
  const { data, error } = await db
    .from("wishes")
    .select("name,message")
    .eq("event", weddingData.eventId)
    .order("created_at", { ascending: true })
    .limit(200);
  if (error) return console.error("تعذّر تحميل التهاني:", error.message);
  data.forEach((w) => addCard({ name: w.name, text: w.message }));
}
loadWishes();

$("wishForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target,
    btn = form.querySelector("button");
  const name = $("gName").value.trim();
  const text = $("gMsg").value.trim();
  if (!name || !text) return;
  btn.disabled = true;
  if (db) {
    const { error } = await db
      .from("wishes")
      .insert({ name, message: text, event: weddingData.eventId });
    if (error) {
      console.error(error.message);
      btn.disabled = false;
      return toast("تعذّر الإرسال، حاول مرة ثانية");
    }
  } else {
    try {
      localStorage.setItem(
        KEY,
        JSON.stringify([...savedWishes(), { name, text }]),
      );
    } catch {}
  }
  addCard({ name, text });
  form.reset();
  btn.disabled = false;
  toast("شكرًا لك! أُضيفت تهنئتك ❤️");
});

/* =====================================================
   7) مشاركة الدعوة على واتساب
   ===================================================== */
$("shareBtn").addEventListener("click", () => {
  const url = weddingData.shareUrl || location.href;
  const msg = `يسرّني دعوتكم لحضور حفل حنتي 💍\n${weddingData.groomName}\n${dateText}\n${url}`;
  window.open(
    "https://wa.me/?text=" + encodeURIComponent(msg),
    "_blank",
    "noopener",
  );
});
