export const blankReflection = () => ({
  answers: Array.from({ length: 5 }, () => ({ selected: [], note: "" })),
  lastStep: 0,
  summary: "",
  reviewed: false,
});
export const blankPlan = () => ({
  primaryGoal: "",
  backupGoal: "",
  steps: [],
  reviewed: false,
});
export const blankOption = (label = "") => ({
  id: crypto.randomUUID(),
  label,
  values: {
    interest: null,
    ability: null,
    cost: null,
    support: null,
    opportunity: null,
  },
  reason: "",
});
export const blankComparison = () => ({
  options: [blankOption(), blankOption()],
  reviewed: false,
});
export const reflectionSteps = [
  {
    label: "Kegiatan disukai",
    title: "Apa yang membuatmu ingin mencoba?",
    description:
      "Pilih kegiatan yang terasa menarik. Kamu boleh memilih beberapa atau menulis sendiri.",
    options: [
      "Membuat atau memperbaiki benda",
      "Mencari tahu cara sesuatu bekerja",
      "Menggambar atau membuat karya",
      "Mendengarkan dan membantu teman",
      "Mengajak orang mencoba ide",
      "Menata catatan dan kegiatan",
    ],
  },
  {
    label: "Pelajaran",
    title: "Pelajaran apa yang kamu nikmati?",
    description: "Tidak perlu nilai rapor. Ingat saja kegiatan belajarnya.",
    options: [
      "Matematika",
      "Bahasa Indonesia",
      "Bahasa asing",
      "Biologi",
      "Fisika",
      "Kimia",
      "Ekonomi",
      "Sosiologi",
      "Seni",
      "Informatika",
      "Olahraga",
      "Agama",
    ],
  },
  {
    label: "Kekuatan",
    title: "Hal apa yang terasa alami bagimu?",
    description:
      "Kekuatan bisa muncul dalam hal kecil di sekolah maupun rumah.",
    options: [
      "Mengamati pola",
      "Mendengarkan dengan sabar",
      "Menyusun kegiatan",
      "Membuat gagasan visual",
      "Memperbaiki barang",
      "Menyampaikan ide",
      "Belajar alat digital",
      "Bekerja sama",
    ],
  },
  {
    label: "Nilai kerja",
    title: "Apa yang penting dalam pekerjaanmu kelak?",
    description:
      "Pilih hal yang bermakna bagimu saat ini. Kamu boleh mengubahnya nanti.",
    options: [
      "Membantu orang",
      "Kreativitas",
      "Penghasilan stabil",
      "Waktu yang seimbang",
      "Belajar hal baru",
      "Kemandirian",
      "Kerja sama",
      "Dampak bagi lingkungan",
    ],
  },
  {
    label: "Dukungan",
    title: "Dukungan apa yang membantumu melangkah?",
    description:
      "Cukup gambaran umum. Lewati hal yang belum nyaman kamu ceritakan.",
    options: [
      "Teman diskusi",
      "Informasi biaya",
      "Dukungan orang tua",
      "Waktu untuk mencoba",
      "Pelatihan keterampilan",
      "Informasi jalur",
      "Pendampingan guru BK",
    ],
  },
  {
    label: "Ringkasan",
    title: "Ini cerita tentang dirimu, menurutmu.",
    description:
      "Ringkasan berasal dari jawabanmu sendiri. Perbaiki sebelum kamu mengonfirmasi.",
  },
];
export const summarizeAnswers = (answers) =>
  answers
    .map(
      (a, i) =>
        `${reflectionSteps[i].label}: ${[...a.selected, a.note].filter(Boolean).join("; ") || "Dilewati dulu"}`,
    )
    .join("\n\n");
