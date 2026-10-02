import { createFileRoute } from "@tanstack/react-router";
import {
  Bell, ChevronRight, CircleDollarSign, Download, Headphones, Menu, MessageSquare, Star, WalletCards, X,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { getProfile, getSession } from "@/lib/api";
import { profiles, type Profile } from "@/lib/profiles";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ElinoChat Tanzania | Chati na Wazungu Kiswahili Lipwa Papo Hapo" },
      {
        name: "description",
        content:
          "ElinoChat Tanzania inakuunganisha na watu wanaotaka kujifunza Kiswahili na kukuwezesha kulipwa kwa mazungumzo.",
      },
      {
        property: "og:title",
        content: "ElinoChat Tanzania | Chati na Wazungu Kiswahili Lipwa Papo Hapo",
      },
      {
        property: "og:description",
        content: "Chati, fundisha Kiswahili na ulipwe papo hapo kupitia ElinoChat.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const registerUrl = "/register";
const loginUrl = "/login";
const dashboardUrl = "/dashboard";
const whatsappUrl = "https://whatsapp.com/channel/0029VbD6LxNIiRos6Av1Sn1A";
const supportUrl = "sms:255659970719?body=Hello,%20Nina%20swali%20kuhusu%20ElinoChat";

const paidMembers = [
  { name: "Amina", amount: "TSh 38,500", time: "9s ago" },
  { name: "Sarah", amount: "TSh 60,000", time: "5s ago" },
  { name: "Lydia", amount: "TSh 30,000", time: "3s ago" },
  { name: "Kelvin", amount: "TSh 45,700", time: "7s ago" },
];

const menuItems = [
  ["Home", "#top"],
  ["Jisajili", registerUrl],
  ["Login", loginUrl],
  ["Dashboard", dashboardUrl],
  ["Namna ElinoChat Inavyofanya Kazi", "#profiles"],
  ["FAQ (Maswali na Majibu)", "#reviews"],
  ["WhatsApp Channel", whatsappUrl],
  ["Huduma kwa Wateja", "#assistance"],
  ["Download App", registerUrl],
] as const;

function BrandMark({ large = false }: { large?: boolean }) {
  return (
    <span className={large ? "brand-mark brand-mark-large" : "brand-mark"}>
      <MessageSquare aria-hidden="true" />
    </span>
  );
}

function Index() {
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(true);
  const [typingIndex, setTypingIndex] = useState(0);
  const [typingVisible, setTypingVisible] = useState(false);
  const [paidIndex, setPaidIndex] = useState(0);
  const [paidVisible, setPaidVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 1150);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (loading) return;
    let hideTimer: number | undefined;
    const showTimer = window.setTimeout(() => {
      setTypingVisible(true);
      hideTimer = window.setTimeout(() => setTypingVisible(false), 4500);
    }, 4000);
    const rotationTimer = window.setInterval(() => {
      setTypingIndex((current) => (current + 1) % profiles.length);
      setTypingVisible(true);
      if (hideTimer) window.clearTimeout(hideTimer);
      hideTimer = window.setTimeout(() => setTypingVisible(false), 4500);
    }, 12000);

    return () => {
      window.clearTimeout(showTimer);
      window.clearInterval(rotationTimer);
      if (hideTimer) window.clearTimeout(hideTimer);
    };
  }, [loading]);

  useEffect(() => {
    if (loading) return;
    let showTimer: number | undefined;
    let hideTimer: number | undefined;
    const scheduleToast = () => {
      showTimer = window.setTimeout(() => {
        setPaidVisible(true);
        hideTimer = window.setTimeout(() => {
          setPaidVisible(false);
          setPaidIndex((current) => (current + 1) % paidMembers.length);
          scheduleToast();
        }, 3500);
      }, 5000);
    };
    scheduleToast();

    return () => {
      if (showTimer) window.clearTimeout(showTimer);
      if (hideTimer) window.clearTimeout(hideTimer);
    };
  }, [loading]);

  const startChat = async (profile: Profile) => {
    const session = getSession();
    if (!session) { window.location.href = registerUrl; return; }
    try {
      const account = await getProfile();
      if (account?.account_status === "active") {
        window.location.href = `/chat/${profile.slug}`;
      } else {
        window.location.href = "/payment";
      }
    } catch {
      window.location.href = "/payment";
    }
  };

  const typingProfile = profiles[typingIndex];
  const paidMember = paidMembers[paidIndex];

  if (loading) {
    return (
      <div className="splash-screen">
        <BrandMark large />
        <p>WELCOME ELINOCHAT</p>
      </div>
    );
  }

  return (
    <div id="top" className="min-h-screen bg-background pb-28 text-foreground">
      <header className="site-header">
        <a href="#top" className="brand" aria-label="ElinoChat home">
          <BrandMark />
          <span>Elino<span>Chat</span></span>
        </a>
        <div className="online-count"><i />65,302 <b>online</b></div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Fungua Menu" className="menu-button">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="menu-sheet">
            <SheetHeader className="border-b border-border pb-5">
              <SheetTitle className="flex items-center gap-3"><BrandMark /> ElinoChat</SheetTitle>
              <SheetDescription>Menu</SheetDescription>
            </SheetHeader>
            <nav className="mt-5 flex flex-col">
              {menuItems.map(([label, href]) => (
                <SheetClose asChild key={label}>
                  <a href={href} className="menu-link">{label}<ChevronRight /></a>
                </SheetClose>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </header>

      <main className="app-column">
        <div className="action-row">
          <Button asChild className="top-action install"><a href={registerUrl}><Download />Jisajili</a></Button>
          <div className="balance"><WalletCards /><span>CURRENT BALANCE<strong>0.00 TZS</strong></span></div>
          <Button asChild className="top-action withdrawal"><a href={dashboardUrl}><CircleDollarSign />Dashboard</a></Button>
        </div>

        <section className="notice-shell" aria-label="Notifications">
          <div className="trust-pill"><i />Trusted by 2 Million Africans</div>
          {notice && (
            <div className="notice-card">
              <div className="notice-title"><span><Bell />NOTIFICATIONS</span><Button variant="ghost" size="icon" aria-label="Funga notification" onClick={() => setNotice(false)}><X /></Button></div>
              <p>Mnakumbushwa kutumia lugha zilizo za maadili ili kampuni yetu kuzidi kupata sifa zaidi kwenye nchi zaidi ili kupata Foreigners zaidi wa kujifunza Kiswahili.</p>
            </div>
          )}
        </section>

        <h1 id="profiles" className="profiles-title">TAP ANY PROFILE TO START CHAT AND GET PAID</h1>
        <section className="profile-list" aria-label="Online chat profiles">
          {profiles.map((profile) => <ProfileCard key={profile.name} profile={profile} onStartChat={startChat} />)}
        </section>

        <section id="assistance" className="info-section">
          <h2>Customer Assistance</h2>
          <p>Unahitaji msaada au maelekezo zaidi? Chagua njia hapa chini kuwasiliana nasi:</p>
          <a href={whatsappUrl} className="help-link"><MessageSquare /><span><strong>1️⃣ Join WhatsApp Channel</strong><small>Jiunge na Channel Ya whatsapp ili kupata update MPYA na Mafunzo kila Siku</small></span></a>
          <a href={supportUrl} className="help-link"><Headphones /><span><strong>2️⃣ Wasiliana na Mtoa Huduma Wetu</strong><small>Ukikwama popote au ukiwa na Swali Tuma Ujumbe kwa mtoa Huduma Wetu (Huduma ya haraka 24/7)</small></span></a>
        </section>

        <section id="reviews" className="info-section reviews">
          <h2>REVIEWS</h2>
          <p>Maoni ya wanachama wetu yanayosasishwa muda wote.</p>
          <blockquote><strong>Kelvin J. (Mbeya)</strong><span>“Hii kazi ya online imenisaidia sana kupata pocket money nikiwa chuo. Naitumia jioni nikitoka masomoni and kutoa faida yangu kwa Airtel Money.”</span></blockquote>
        </section>
      </main>

      {typingVisible && typingProfile && (
        <Button variant="ghost" className="typing-toast" onClick={() => startChat(typingProfile)}>
          <img src={typingProfile.image} alt={typingProfile.name} />
          <span><b>{typingProfile.name} ✨</b><em>is typing a message...</em></span>
        </Button>
      )}
      {paidVisible && paidMember && (
        <div className="paid-toast" role="status" aria-live="polite">
          <span className="paid-check">✓</span>
          <span><strong><b>{paidMember.name}</b> ametoa hivi punde {paidMember.amount}</strong><small>{paidMember.time}</small></span>
        </div>
      )}
      <Button asChild className="customer-care"><a href={supportUrl}><Headphones />Customer Care</a></Button>
      <Button asChild className="register-cta"><a href={registerUrl}>JISAJILI SASA</a></Button>

    </div>
  );
}

function ProfileCard({ profile, onStartChat }: { profile: Profile; onStartChat: (profile: Profile) => void }) {
  return (
    <article className="profile-card">
      <button type="button" className="profile-head profile-head-button" onClick={() => onStartChat(profile)} aria-label={`Anza chat na ${profile.name}`}>
        <div className="avatar-wrap"><img src={profile.image} alt={profile.name} /><i /></div>
        <div><h2>{profile.name} <small>✨</small></h2><p><i />online</p><span><Star />{profile.rating}</span></div>
      </button>
      <div className="profile-details">
        <p><b>CHAT TIME :</b> {profile.time}</p>
        <p><b>WANTS :</b> <em>Teach Swahili / Kujifunza Kiswahili ({profile.country})</em></p>
      </div>
      <div className="profile-actions">
        <Button onClick={() => onStartChat(profile)}><MessageSquare />START CHAT</Button>
        <button type="button" className="earn" onClick={() => onStartChat(profile)}><strong>TZS {profile.tzs}</strong><span>Earn USD {profile.usd}</span></button>
      </div>
    </article>
  );
}