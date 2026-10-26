/* ───────── Editable data — replace the sample values here ───────── */

/* ───────── Types ───────── */
export type IconName =
  | "phone"
  | "message"
  | "close"
  | "chevron-down"
  | "chevron-left"
  | "chevron-right"
  | "copy"
  | "check"
  | "alert"
  | "subway"
  | "bus"
  | "car"
  | "link"
  | "share"
  | "minus"
  | "plus"
  | "arrow-up"
  | "music"
  | "music-off"
  | "petal"
  | "petal-off";

export interface Person {
  name: string;
  short: string;
  en: string;
  /** leave '' for a single-parent family */
  father: string;
  /** leave '' for a single-parent family */
  mother: string;
  order: string;
}
export interface Venue {
  name: string;
  hall: string;
  address: string;
  tel: string;
  naverUrl: string;
  kakaoUrl: string;
  tmapUrl: string;
}
export interface TransitItem {
  icon: Extract<IconName, "subway" | "bus" | "car">;
  title: string;
  lines: string[];
}
export interface Wedding {
  at: Date;
  year: number;
  month: number;
  day: number;
  dateLabel: string;
  timeLabel: string;
  dateDots: string;
  weekdayEn: string;
  rsvpDeadline: string;
  groom: Person;
  bride: Person;
  venue: Venue;
  transit: TransitItem[];
}
export interface Photo {
  src: string;
  w: number;
  h: number;
  alt: string;
}
export interface Contact {
  rel: string;
  name: string;
  tel: string;
}
export interface ContactGroup {
  side: string;
  people: Contact[];
}
export interface Account {
  holder: string;
  bank: string;
  number: string;
}
export interface AccountGroup {
  side: string;
  rows: Account[];
}
export interface GuestbookEntry {
  name: string;
  msg: string;
  at: string;
}
export interface Bgm {
  src: string;
  volume: number;
  credit: string;
}
export interface Intro {
  guestLine: string;
  lines: string[];
  typeMs: number;
  linePauseMs: number;
  holdMs: number;
}

export const WEDDING: Wedding = {
  at: new Date("2027-03-21T13:30:00+09:00"),
  year: 2027,
  month: 3,
  day: 21,
  dateLabel: "2027년 3월 21일 일요일",
  timeLabel: "오후 1시 30분",
  dateDots: "2027 . 03 . 21",
  weekdayEn: "SUNDAY",
  rsvpDeadline: "3월 7일",
  /* Parents: leave father or mother as '' for a single-parent family — the parent line,
     contacts and accounts for that parent are left out automatically. */
  groom: {
    name: "추연학",
    short: "연학",
    en: "Yeonhak",
    father: "추문호",
    mother: "",
    order: "장남",
  },
  bride: {
    name: "홍은미",
    short: "은미",
    en: "Eunmi",
    father: "홍천의",
    mother: "최금순",
    order: "장녀",
  },
  venue: {
    name: "JK아트컨벤션",
    hall: "4층 그랜드홀",
    address: "서울 영등포구 문래로 164 SK리더스뷰 4층",
    tel: "02-2628-9100",
    naverUrl: "https://naver.me/Gn0yrSdR",
    kakaoUrl: "https://kko.to/wglb57sXlG",
    tmapUrl: "https://tmap.life/a6cd2141",
  },
  /* Directions from the venue's official page (jkart.co.kr/location) — re-check before sending. */
  transit: [
    {
      icon: "subway",
      title: "지하철",
      lines: [
        "2호선 문래역 5번 출구에서 전방으로 직진 300m (도보 약 5분)",
        "문래역 4번 출구 뒤쪽에서 셔틀버스 운행",
      ],
    },
    {
      icon: "bus",
      title: "버스",
      lines: [
        "문래역 정류장: 간선 641 · 지선 6211, 6625 · 마을 영등포12",
        "문래주민센터·영일시장 정류장: 마을 영등포05",
        "벽산메가트리움APT 정류장: 지선 6516",
      ],
    },
    {
      icon: "car",
      title: "주차",
      lines: [
        "건물 주차장 동시 1,000여 대 주차 가능",
        '내비게이션에 "JK아트컨벤션" 또는 "문래동 SK리더스뷰" 입력',
        "현장 주차 요원의 안내를 받아 주세요",
      ],
    },
  ],
};

export const POEM: string[][] = [
  [
    "서로가 마주 보며 다져온 사랑을",
    "이제 함께 한곳을 바라보며",
    "걸어가려 합니다.",
  ],
  [
    "저희 두 사람의 새로운 시작에",
    "따뜻한 걸음으로 함께해 주시면",
    "더없는 기쁨으로 간직하겠습니다.",
  ],
];

export const COVER: Photo = {
  src: "photos/cover.png",
  w: 1080,
  h: 1620,
  alt: "메인 웨딩 사진",
};
export const CLOSING: Photo = {
  src: "photos/end.jpeg",
  w: 1080,
  h: 721,
  alt: "마지막 웨딩 사진",
};

export const PHOTOS: Photo[] = [
  {
    src: "photos/01.jpeg",
    w: 1080,
    h: 630,
    alt: "웨딩 사진 1",
  },
  {
    src: "photos/02.jpeg",
    w: 1080,
    h: 720,
    alt: "웨딩 사진 2",
  },
  {
    src: "photos/03.jpeg",
    w: 1080,
    h: 720,
    alt: "웨딩 사진 3",
  },
  {
    src: "photos/04.jpeg",
    w: 1080,
    h: 720,
    alt: "웨딩 사진 4",
  },
  {
    src: "photos/05.jpeg",
    w: 1080,
    h: 720,
    alt: "웨딩 사진 5",
  },
  {
    src: "photos/06.jpeg",
    w: 1080,
    h: 720,
    alt: "웨딩 사진 6",
  },
  {
    src: "photos/07.jpeg",
    w: 1080,
    h: 720,
    alt: "웨딩 사진 6",
  },
  {
    src: "photos/08.jpeg",
    w: 1080,
    h: 720,
    alt: "웨딩 사진 8",
  },
  {
    src: "photos/09.jpeg",
    w: 1080,
    h: 720,
    alt: "웨딩 사진 9",
  },
  {
    src: "photos/10.jpeg",
    w: 1080,
    h: 720,
    alt: "웨딩 사진 10",
  },
  {
    src: "photos/11.jpeg",
    w: 1080,
    h: 720,
    alt: "웨딩 사진 11",
  },
  {
    src: "photos/12.jpeg",
    w: 1080,
    h: 720,
    alt: "웨딩 사진 12",
  },
  {
    src: "photos/13.png",
    w: 1080,
    h: 720,
    alt: "웨딩 사진 13",
  },
  {
    src: "photos/14.jpeg",
    w: 1080,
    h: 720,
    alt: "웨딩 사진 14",
  },
  {
    src: "photos/15.jpeg",
    w: 1080,
    h: 720,
    alt: "웨딩 사진 15",
  },
  {
    src: "photos/16.jpeg",
    w: 1080,
    h: 720,
    alt: "웨딩 사진 16",
  },
  {
    src: "photos/17.jpeg",
    w: 1080,
    h: 720,
    alt: "웨딩 사진 17",
  },
  {
    src: "photos/18.jpeg",
    w: 1080,
    h: 720,
    alt: "웨딩 사진 18",
  },
  {
    src: "photos/19.jpeg",
    w: 1080,
    h: 720,
    alt: "웨딩 사진 19",
  },
  {
    src: "photos/20.jpeg",
    w: 1080,
    h: 720,
    alt: "웨딩 사진 20",
  },
  {
    src: "photos/21.jpeg",
    w: 1080,
    h: 720,
    alt: "웨딩 사진 21",
  },
  {
    src: "photos/22.jpeg",
    w: 1080,
    h: 720,
    alt: "웨딩 사진 22",
  },
  {
    src: "photos/23.jpeg",
    w: 1080,
    h: 720,
    alt: "웨딩 사진 23",
  },
  {
    src: "photos/24.jpeg",
    w: 1080,
    h: 720,
    alt: "웨딩 사진 24",
  },
  {
    src: "photos/25.jpeg",
    w: 1080,
    h: 720,
    alt: "웨딩 사진 25",
  },
  {
    src: "photos/26.jpeg",
    w: 1080,
    h: 720,
    alt: "웨딩 사진 26",
  },
  {
    src: "photos/27.jpeg",
    w: 1080,
    h: 720,
    alt: "웨딩 사진 27",
  },
  {
    src: "photos/28.jpeg",
    w: 1080,
    h: 720,
    alt: "웨딩 사진 28",
  },
  {
    src: "photos/29.jpeg",
    w: 1080,
    h: 720,
    alt: "웨딩 사진 29",
  },
  {
    src: "photos/30.jpeg",
    w: 1080,
    h: 720,
    alt: "웨딩 사진 30",
  },
  {
    src: "photos/31.jpeg",
    w: 1080,
    h: 720,
    alt: "웨딩 사진 31",
  },
];

/* Names come from WEDDING; a parent left blank there drops out of this list too. */
const g = WEDDING.groom;
const b = WEDDING.bride;
export const CONTACTS: ContactGroup[] = [
  {
    side: "신랑측",
    people: [
      { rel: "신랑", name: g.name, tel: "010-0000-0001" },
      { rel: "신랑 아버지", name: g.father, tel: "010-0000-0002" },
      { rel: "신랑 어머니", name: g.mother, tel: "010-0000-0003" },
    ],
  },
  {
    side: "신부측",
    people: [
      { rel: "신부", name: b.name, tel: "010-0000-0004" },
      { rel: "신부 아버지", name: b.father, tel: "010-0000-0005" },
      { rel: "신부 어머니", name: b.mother, tel: "010-0000-0006" },
    ],
  },
];

export const ACCOUNTS: AccountGroup[] = [
  {
    side: "신랑측",
    rows: [
      {
        holder: `신랑 ${g.name}`,
        bank: "국민은행",
        number: "000000-00-000001",
      },
      {
        holder: g.father ? `아버지 ${g.father}` : "",
        bank: "신한은행",
        number: "000-000-000002",
      },
      {
        holder: g.mother ? `어머니 ${g.mother}` : "",
        bank: "우리은행",
        number: "0000-000-000003",
      },
    ],
  },
  {
    side: "신부측",
    rows: [
      {
        holder: `신부 ${b.name}`,
        bank: "카카오뱅크",
        number: "0000-00-0000004",
      },
      {
        holder: b.father ? `아버지 ${b.father}` : "",
        bank: "하나은행",
        number: "000-000000-00005",
      },
      {
        holder: b.mother ? `어머니 ${b.mother}` : "",
        bank: "농협은행",
        number: "000-0000-0000-06",
      },
    ],
  },
];

export const GUESTBOOK_KEY = "inv-guestbook-doyun-seoyeon";
export const GUESTBOOK_SEED: GuestbookEntry[] = [
  {
    name: "정하린",
    msg: "두 사람 정말 잘 어울려요! 오래오래 행복하게 지내길 바라요 :)",
    at: "2026-10-20T19:12:00+09:00",
  },
  {
    name: "박준서",
    msg: "연학아 결혼 진심으로 축하한다. 그날 꼭 갈게!",
    at: "2026-10-18T22:40:00+09:00",
  },
];

export const BGM: Bgm = {
  src: "audio/canon-in-d.mp3",
  volume: 0.5,
  credit:
    "배경음악: J. Pachelbel, Canon in D — 미 공군 군악대 Strolling Strings 연주 (퍼블릭 도메인, Wikimedia Commons)",
};

/* Intro cover typed before the invitation opens.
   `guestLine` is typed first only when the link carries ?to=이름 — {name} is replaced. */
export const INTRO: Intro = {
  guestLine: "소중한 {name} 님께,",
  lines: ["저희 두 사람,", "이제 하나 되어 걸어가려 합니다."],
  typeMs: 90,
  linePauseMs: 450,
  holdMs: 1600,
};
