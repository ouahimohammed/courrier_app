import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from "jspdf-autotable";

// ─── Firebase dynamic import ──────────────────────────────────────────────────
let db = null;
let fsAddDoc, fsCollection, fsDocs, fsQuery, fsOrderBy, fsServerTimestamp, fsUpdateDoc, fsDoc;

async function initFirebase() {
  try {
    const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js");
    const fs = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");
    const cfg = {
      apiKey: "AIzaSyCWVrDtNQBmYsCWqmioZd_2KpPK8ndxzMw",
      authDomain: "courrier-hadboumoussa.firebaseapp.com",
      projectId: "courrier-hadboumoussa",
      storageBucket: "courrier-hadboumoussa.firebasestorage.app",
      messagingSenderId: "14714284104",
      appId: "1:14714284104:web:771312ed5d71b90cdc907d",
      measurementId: "G-58TGG0QNK4"
    };
    const app = initializeApp(cfg);
    db = fs.getFirestore(app);
    fsAddDoc = fs.addDoc; fsCollection = fs.collection;
    fsDocs = fs.getDocs; fsQuery = fs.query;
    fsOrderBy = fs.orderBy; fsServerTimestamp = fs.serverTimestamp;
    fsUpdateDoc = fs.updateDoc; fsDoc = fs.doc;
    return true;
  } catch { return false; }
}

// ─── Translations ────────────────────────────────────────────────────────────────
const translations = {
  fr: {
    appTitle: "Courrier Admin",
    appSubtitle: "Commune de Had Boumoussa",
    dashboard: "Tableau de bord",
    all: "Tous les courriers",
    depart: "Courriers départ",
    arrivee: "Courriers arrivée",
    enCours: "En cours",
    reduceMenu: "Réduire le menu",
    developedBy: "Développé par",
    totalCourriers: "Total courriers",
    courriersDepart: "Courriers départ",
    courriersArrivee: "Courriers arrivée",
    enCoursStatus: "En cours",
    envoyes: "Envoyés",
    recus: "Reçus",
    tousTypes: "Tous types confondus",
    envoyesCount: "envoyés",
    recusCount: "reçus",
    aTraiter: "À traiter",
    confirmes: "Confirmés",
    enregistres: "Enregistrés",
    repartitionStatut: "Répartition par statut",
    courriersRecents: "Courriers récents",
    voirTous: "Voir tous les courriers",
    nouveauCourrier: "Nouveau courrier",
    rechercher: "Rechercher numéro, objet, ville, destinataire...",
    tousStatuts: "Tous statuts",
    reinitialiser: "Réinitialiser",
    aucunCourrier: "Aucun courrier trouvé",
    numero: "Numéro",
    date: "Date",
    service: "Service",
    destinataire: "Destinataire",
    ville: "Ville",
    objet: "Objet",
    type: "Type",
    statut: "Statut",
    modifierStatut: "Modifier le statut",
    nouveauStatut: "Nouveau statut",
    commentaire: "Commentaire (optionnel)",
    commentairePlaceholder: "Ajoutez un commentaire sur ce changement de statut...",
    annuler: "Annuler",
    mettreAJour: "Mettre à jour",
    enregistrement: "Enregistrement...",
    miseAJour: "Mise à jour...",
    details: "Détails du courrier",
    enregistreLe: "Enregistré le",
    exporterExcel: "Exporter Excel",
    importerExcel: "Importer Excel",
    pdf: "PDF",
    typeCourrier: "Type de courrier",
    numeroAutoGenere: "Numéro auto-généré",
    serviceExpediteur: "Service expéditeur",
    objetCourrier: "Objet du courrier",
    enregistrer: "Enregistrer",
    departLabel: "Départ",
    arriveeLabel: "Arrivée",
    envoye: "Envoyé",
    recu: "Reçu",
    bienvenue: "Bienvenue",
    bienvenueMessage: "Bienvenue dans votre application de gestion",
    synchronisation: "Synchronisation...",
    rafraichir: "Rafraîchir",
    administrateur: "Administrateur",
    statsResume: "Résumé",
    documentGenere: "Document généré par Courrier Admin",
    genererLe: "Généré le",
    voirTousCourriers: "Voir tous les courriers",
    cliquerFiltrer: "Cliquer pour filtrer →",
    total: "Total",
    departCount: "Départ",
    arriveeCount: "Arrivée",
    info: "Information",
    succes: "Succès",
    erreur: "Erreur",
    chargementReussi: "Données chargées avec succès",
    erreurChargement: "Erreur de chargement des données",
    importReussi: "courriers importés avec succès",
    rafraichissementReussi: "Données rafraîchies avec succès",
    erreurRafraichissement: "Erreur lors du rafraîchissement",
    statutMisAJour: "Statut mis à jour avec succès",
    filtreApplique: "Filtre appliqué: Courriers envoyés",
    filtreRecusApplique: "Filtre appliqué: Courriers reçus"
  },
  ar: {
    appTitle: "إدارة المراسلات",
    appSubtitle: "جماعة هاد بوموسى",
    dashboard: "لوحة القيادة",
    all: "جميع المراسلات",
    depart: "المراسلات الصادرة",
    arrivee: "المراسلات الواردة",
    enCours: "قيد المعالجة",
    reduceMenu: "تصغير القائمة",
    developedBy: "طور بواسطة",
    totalCourriers: "إجمالي المراسلات",
    courriersDepart: "المراسلات الصادرة",
    courriersArrivee: "المراسلات الواردة",
    enCoursStatus: "قيد المعالجة",
    envoyes: "مرسلة",
    recus: "مستلمة",
    tousTypes: "جميع الأنواع",
    envoyesCount: "مرسلة",
    recusCount: "مستلمة",
    aTraiter: "للمعالجة",
    confirmes: "مؤكدة",
    enregistres: "مسجلة",
    repartitionStatut: "توزيع الحالات",
    courriersRecents: "أحدث المراسلات",
    voirTous: "عرض جميع المراسلات",
    nouveauCourrier: "مراسلة جديدة",
    rechercher: "بحث بالرقم أو الموضوع أو المدينة أو المستلم...",
    tousStatuts: "جميع الحالات",
    reinitialiser: "إعادة تعيين",
    aucunCourrier: "لا توجد مراسلات",
    numero: "الرقم",
    date: "التاريخ",
    service: "المصلحة",
    destinataire: "المستلم",
    ville: "المدينة",
    objet: "الموضوع",
    type: "النوع",
    statut: "الحالة",
    modifierStatut: "تغيير الحالة",
    nouveauStatut: "حالة جديدة",
    commentaire: "تعليق (اختياري)",
    commentairePlaceholder: "أضف تعليقاً حول هذا التغيير...",
    annuler: "إلغاء",
    mettreAJour: "تحديث",
    enregistrement: "جاري الحفظ...",
    miseAJour: "جاري التحديث...",
    details: "تفاصيل المراسلة",
    enregistreLe: "مسجلة في",
    exporterExcel: "تصدير إكسيل",
    importerExcel: "استيراد إكسيل",
    pdf: "PDF",
    typeCourrier: "نوع المراسلة",
    numeroAutoGenere: "رقم آلي",
    serviceExpediteur: "المصلحة المرسلة",
    objetCourrier: "موضوع المراسلة",
    enregistrer: "حفظ",
    departLabel: "صادر",
    arriveeLabel: "وارد",
    envoye: "مرسل",
    recu: "مستلم",
    bienvenue: "مرحباً",
    bienvenueMessage: "مرحباً في تطبيق إدارة المراسلات",
    synchronisation: "مزامنة...",
    rafraichir: "تحديث",
    administrateur: "مدير",
    statsResume: "ملخص",
    documentGenere: "وثيقة منشأة بواسطة إدارة المراسلات",
    genererLe: "تم الإنشاء في",
    voirTousCourriers: "عرض جميع المراسلات",
    cliquerFiltrer: "انقر للتصفية ←",
    total: "المجموع",
    departCount: "صادر",
    arriveeCount: "وارد",
    info: "معلومات",
    succes: "نجاح",
    erreur: "خطأ",
    chargementReussi: "تم تحميل البيانات بنجاح",
    erreurChargement: "خطأ في تحميل البيانات",
    importReussi: "مراسلة تم استيرادها بنجاح",
    rafraichissementReussi: "تم تحديث البيانات بنجاح",
    erreurRafraichissement: "خطأ في التحديث",
    statutMisAJour: "تم تحديث الحالة بنجاح",
    filtreApplique: "تم تطبيق التصفية: المراسلات المرسلة",
    filtreRecusApplique: "تم تطبيق التصفية: المراسلات المستلمة"
  }
};

// ─── Demo Data ────────────────────────────────────────────────────────────────
const DEMO = [
  { id:"1", numero:"DEP/2026/001", type:"depart",  date:"2026-04-01", service:"Direction Générale",      destinataire:"Ministère de l'Intérieur",  ville:"Rabat",       objet:"Rapport annuel d'activité 2025",             status:"envoyé",   createdAt:new Date("2026-04-01") },
  { id:"2", numero:"ARR/2026/001", type:"arrivee", date:"2026-04-02", service:"Service Technique",       destinataire:"Wilaya de Béni Mellal",      ville:"Béni Mellal", objet:"Note circulaire marchés publics",            status:"reçu",     createdAt:new Date("2026-04-02") },
  { id:"3", numero:"DEP/2026/002", type:"depart",  date:"2026-04-03", service:"Ressources Humaines",     destinataire:"CNOPS",                      ville:"Casablanca",  objet:"Liste des agents pour mutuelle 2026",        status:"en cours", createdAt:new Date("2026-04-03") },
  { id:"4", numero:"ARR/2026/002", type:"arrivee", date:"2026-04-04", service:"Service Financier",       destinataire:"Trésorerie Générale",        ville:"Rabat",       objet:"Avis de virement budgétaire Q1 2026",       status:"reçu",     createdAt:new Date("2026-04-04") },
  { id:"5", numero:"DEP/2026/003", type:"depart",  date:"2026-04-05", service:"Affaires Juridiques",     destinataire:"Tribunal Administratif",     ville:"Fès",         objet:"Dossier de recours administratif n°07",     status:"envoyé",   createdAt:new Date("2026-04-05") },
  { id:"6", numero:"ARR/2026/003", type:"arrivee", date:"2026-03-28", service:"Direction Urbanisme",     destinataire:"Agence Urbaine",             ville:"Béni Mellal", objet:"Plan d'aménagement territorial 2026-2030",  status:"en cours", createdAt:new Date("2026-03-28") },
  { id:"7", numero:"DEP/2026/004", type:"depart",  date:"2026-03-25", service:"Service Informatique",    destinataire:"MAGG",                       ville:"Rabat",       objet:"Rapport migration système d'information",   status:"envoyé",   createdAt:new Date("2026-03-25") },
  { id:"8", numero:"ARR/2026/004", type:"arrivee", date:"2026-03-20", service:"Direction des Achats",    destinataire:"Fournisseur ABC",             ville:"Marrakech",   objet:"Bon de commande matériel bureautique",      status:"reçu",     createdAt:new Date("2026-03-20") },
];

// ─── Constants ────────────────────────────────────────────────────────────────
const SM = {
  "envoyé":   { labelFr:"Envoyé", labelAr:"مرسل", bg:"#dcfce7", color:"#166534", dot:"#16a34a" },
  "en cours": { labelFr:"En cours", labelAr:"قيد المعالجة", bg:"#fef9c3", color:"#854d0e", dot:"#ca8a04" },
  "reçu":     { labelFr:"Reçu", labelAr:"مستلم", bg:"#dbeafe", color:"#1e40af", dot:"#2563eb" },
};
const TM = {
  depart:  { labelFr:"Départ", labelAr:"صادر", bg:"#ede9fe", color:"#5b21b6", icon:"↑" },
  arrivee: { labelFr:"Arrivée", labelAr:"وارد", bg:"#fee2e2", color:"#991b1b", icon:"↓" },
};

const getNav = (t) => [
  { id:"dashboard", icon:"⊞", label: t.dashboard },
  { id:"tous",      icon:"☰", label: t.all },
  { id:"depart",    icon:"↑", label: t.depart },
  { id:"arrivee",   icon:"↓", label: t.arrivee },
  { id:"enCours",   icon:"◐", label: t.enCours },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const genNum = (type, list) => {
  const pfx = type==="depart"?"DEP":"ARR", yr = new Date().getFullYear();
  const n = list.filter(c=>c.numero?.startsWith(`${pfx}/${yr}/`)).length;
  return `${pfx}/${yr}/${String(n+1).padStart(3,"0")}`;
};
const fmtD = (v) => {
  if (!v) return "—";
  const d = v?.toDate?v.toDate():(v instanceof Date?v:new Date(v));
  return isNaN(d)?(""+v):d.toLocaleDateString("fr-FR");
};

// ─── Badge ────────────────────────────────────────────────────────────────────
const Badge = ({ m, onClick, clickable, language }) => (
  <span onClick={clickable ? onClick : undefined}
    style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"2px 10px",
      borderRadius:999, fontSize:11, fontWeight:700, background:m.bg, color:m.color, 
      whiteSpace:"nowrap", cursor:clickable ? "pointer" : "default",
      transition:"transform 0.1s" }}
    onMouseEnter={e => clickable && (e.currentTarget.style.transform = "scale(1.05)")}
    onMouseLeave={e => clickable && (e.currentTarget.style.transform = "scale(1)")}>
    {m.dot&&<span style={{ width:6,height:6,borderRadius:"50%",background:m.dot,flexShrink:0 }}/>}
    {language === 'ar' ? m.labelAr : m.labelFr}
    {clickable && <span style={{ marginLeft:4, fontSize:9 }}>▼</span>}
  </span>
);

// ─── Overlay ──────────────────────────────────────────────────────────────────
const Overlay = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <div style={{ position:"fixed", inset:0, zIndex:300, background:"rgba(15,23,42,0.6)",
      display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem" }}
      onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{
        background:"#fff", borderRadius:16, width:"100%", maxWidth:560,
        maxHeight:"92vh", overflowY:"auto", boxShadow:"0 24px 80px rgba(0,0,0,0.25)" }}>
        {children}
      </div>
    </div>
  );
};

// ─── Language Switcher ──────────────────────────────────────────────────────────
function LanguageSwitcher({ language, setLanguage, t }) {
  return (
    <div style={{
      display: "flex",
      gap: 8,
      padding: "4px",
      background: "#f1f5f9",
      borderRadius: 40,
      border: "1px solid #e2e8f0"
    }}>
      <button
        onClick={() => setLanguage('fr')}
        style={{
          padding: "6px 16px",
          borderRadius: 30,
          border: "none",
          background: language === 'fr' ? "#3b82f6" : "transparent",
          color: language === 'fr' ? "#fff" : "#64748b",
          cursor: "pointer",
          fontSize: 12,
          fontWeight: 600,
          transition: "all 0.2s ease"
        }}
      >
        FR
      </button>
      <button
        onClick={() => setLanguage('ar')}
        style={{
          padding: "6px 16px",
          borderRadius: 30,
          border: "none",
          background: language === 'ar' ? "#3b82f6" : "transparent",
          color: language === 'ar' ? "#fff" : "#64748b",
          cursor: "pointer",
          fontSize: 12,
          fontWeight: 600,
          transition: "all 0.2s ease"
        }}
      >
        عربي
      </button>
    </div>
  );
}

// ─── Sidebar Améliorée ──────────────────────────────────────────────────────────
function Sidebar({ active, onChange, counts, col, setCol, language, t }) {
  const [hoveredItem, setHoveredItem] = useState(null);
  const w = col ? 72 : 260;
  const NAV = getNav(t);
  
  return (
    <>
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes glow {
          0%, 100% {
            box-shadow: 0 0 5px rgba(37, 99, 235, 0.3);
          }
          50% {
            box-shadow: 0 0 20px rgba(37, 99, 235, 0.6);
          }
        }
        .sidebar-item {
          position: relative;
          overflow: hidden;
        }
        .sidebar-item::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          transform: translate(-50%, -50%);
          transition: width 0.6s, height 0.6s;
        }
        .sidebar-item:hover::before {
          width: 300px;
          height: 300px;
        }
        .sidebar-tooltip {
          position: fixed;
          background: #1e293b;
          color: #fff;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 500;
          white-space: nowrap;
          z-index: 1000;
          pointer-events: none;
          animation: slideIn 0.2s ease-out;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .sidebar-tooltip::before {
          content: '';
          position: absolute;
          left: -6px;
          top: 50%;
          transform: translateY(-50%);
          border-width: 6px;
          border-style: solid;
          border-color: transparent #1e293b transparent transparent;
        }
      `}</style>
      
      <aside style={{ 
        width: w, 
        minHeight: "100vh", 
        background: "linear-gradient(180deg, #0f172a 0%, #0a0f1c 100%)",
        display: "flex",
        flexDirection: "column", 
        transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)", 
        flexShrink: 0, 
        zIndex: 20,
        position: "relative",
        boxShadow: "4px 0 20px rgba(0,0,0,0.1)"
      }}>
        
        {/* Logo avec animation */}
        <div style={{ 
          padding: col ? "20px 0" : "20px 20px", 
          display: "flex", 
          alignItems: "center",
          gap: 12, 
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          justifyContent: col ? "center" : language === 'ar' ? "flex-end" : "flex-start", 
          minHeight: 72, 
          boxSizing: "border-box",
          position: "relative",
          overflow: "hidden"
        }}>
          <div style={{
            position: "absolute",
            top: -20,
            right: -20,
            width: 100,
            height: 100,
            background: "radial-gradient(circle, rgba(37,99,235,0.1) 0%, transparent 70%)",
            borderRadius: "50%"
          }} />
          
          <div style={{ 
            width: 40, 
            height: 40, 
            borderRadius: 12, 
            background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
            display: "flex",
            alignItems: "center", 
            justifyContent: "center", 
            fontSize: 20, 
            flexShrink: 0,
            boxShadow: "0 4px 10px rgba(37,99,235,0.3)",
            transition: "transform 0.2s ease"
          }}
          onMouseEnter={e => e.currentTarget.style.transform = "rotate(5deg) scale(1.05)"}
          onMouseLeave={e => e.currentTarget.style.transform = "rotate(0deg) scale(1)"}>
            🏛️
          </div>
          
          {!col && (
            <div style={{ animation: "slideIn 0.3s ease-out", textAlign: language === 'ar' ? "right" : "left" }}>
              <p style={{ 
                margin: 0, 
                fontWeight: 800, 
                color: "#fff", 
                fontSize: 14, 
                lineHeight: 1.3,
                letterSpacing: "0.5px"
              }}>
                {t.appTitle}
              </p>
              <p style={{ 
                margin: "4px 0 0", 
                color: "rgba(255,255,255,0.6)", 
                fontSize: 10,
                fontWeight: 500
              }}>
                {t.appSubtitle}
              </p>
            </div>
          )}
        </div>

        {/* Navigation items */}
        <nav style={{ padding: "16px 10px", flex: 1 }}>
          {NAV.map((item, index) => {
            const isActive = active === item.id;
            const count = counts[item.id];
            
            return (
              <button
                key={item.id}
                className="sidebar-item"
                onClick={() => onChange(item.id)}
                onMouseEnter={(e) => {
                  if (col) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setHoveredItem({
                      label: item.label,
                      x: rect.right + 10,
                      y: rect.top + rect.height / 2
                    });
                  }
                }}
                onMouseLeave={() => setHoveredItem(null)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: col ? "12px 0" : "10px 14px",
                  justifyContent: col ? "center" : "flex-start",
                  borderRadius: 10,
                  border: "none",
                  cursor: "pointer",
                  marginBottom: 6,
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  background: isActive 
                    ? "linear-gradient(90deg, rgba(37,99,235,0.2) 0%, rgba(37,99,235,0.05) 100%)"
                    : "transparent",
                  color: isActive ? "#fff" : "rgba(255,255,255,0.6)",
                  position: "relative",
                  transform: isActive ? "translateX(4px)" : "translateX(0)",
                  direction: language === 'ar' ? "rtl" : "ltr"
                }}
              >
                {isActive && (
                  <div style={{
                    position: "absolute",
                    left: language === 'ar' ? "auto" : 0,
                    right: language === 'ar' ? 0 : "auto",
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 3,
                    height: 30,
                    background: "#3b82f6",
                    borderRadius: "0 4px 4px 0",
                    animation: "glow 2s infinite"
                  }} />
                )}
                
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  transition: "all 0.2s ease",
                  background: isActive ? "rgba(59,130,246,0.2)" : "transparent"
                }}>
                  {item.icon}
                </div>
                
                {!col && (
                  <>
                    <span style={{ 
                      fontSize: 13, 
                      fontWeight: isActive ? 600 : 500, 
                      flex: 1, 
                      textAlign: language === 'ar' ? "right" : "left",
                      letterSpacing: "0.3px"
                    }}>
                      {item.label}
                    </span>
                    
                    {count != null && (
                      <span style={{ 
                        fontSize: 10, 
                        fontWeight: 700, 
                        minWidth: 24,
                        textAlign: "center",
                        background: isActive ? "#3b82f6" : "rgba(255,255,255,0.1)",
                        color: isActive ? "#fff" : "rgba(255,255,255,0.6)",
                        padding: "2px 8px",
                        borderRadius: 20,
                        transition: "all 0.2s ease"
                      }}>
                        {count}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {/* Collapse toggle amélioré */}
        <button 
          onClick={() => setCol(v => !v)} 
          style={{ 
            margin: "0 10px 16px", 
            padding: "10px 0",
            borderRadius: 10, 
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.03)",
            color: "rgba(255,255,255,0.5)",
            cursor: "pointer", 
            fontSize: 13, 
            display: "flex", 
            alignItems: "center",
            justifyContent: col ? "center" : language === 'ar' ? "flex-end" : "flex-start", 
            gap: 10, 
            paddingLeft: col ? 0 : 16,
            paddingRight: col ? 0 : 16,
            transition: "all 0.2s ease"
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "rgba(255,255,255,0.08)";
            e.currentTarget.style.color = "#fff";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "rgba(255,255,255,0.03)";
            e.currentTarget.style.color = "rgba(255,255,255,0.5)";
          }}
        >
          <span style={{ fontSize: 14 }}>{col ? (language === 'ar' ? "←" : "→") : (language === 'ar' ? "→" : "←")}</span>
          {!col && <span style={{ fontSize: 12, fontWeight: 500 }}>{t.reduceMenu}</span>}
        </button>

        {/* Footer avec crédit amélioré */}
        {!col && (
          <div style={{ 
            padding: "16px 20px", 
            borderTop: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(0,0,0,0.2)",
            textAlign: language === 'ar' ? "right" : "left"
          }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              marginBottom: 12
            }}>
              👨‍💻
            </div>
            <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>
              {t.developedBy}
            </p>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "#fff", fontWeight: 700 }}>
              Mohamed Ouahi
            </p>
          </div>
        )}
      </aside>
      
      {col && hoveredItem && (
        <div 
          className="sidebar-tooltip"
          style={{
            left: hoveredItem.x,
            top: hoveredItem.y - 15
          }}
        >
          {hoveredItem.label}
        </div>
      )}
    </>
  );
}

// ─── Stat Card Clickable ──────────────────────────────────────────────────────
const StatCard = ({ label, value, color, icon, sub, onClick, filterType, language }) => (
  <div onClick={() => onClick && onClick(filterType)}
    style={{ 
      background:"#fff", 
      borderRadius:12, 
      padding:"1.1rem 1.25rem",
      border:"1px solid #f1f5f9",
      cursor: onClick ? "pointer" : "default",
      transition: "all 0.2s ease",
      position: "relative",
      overflow: "hidden"
    }}
    onMouseEnter={e => {
      if (onClick) {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 12px 24px -8px rgba(0,0,0,0.15)";
      }
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "none";
    }}>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
      <p style={{ margin:0, fontSize:10, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.07em" }}>{label}</p>
      <span style={{ fontSize:16, width:32, height:32, borderRadius:8, background:color+"1a",
        display:"flex", alignItems:"center", justifyContent:"center" }}>{icon}</span>
    </div>
    <p style={{ margin:"0 0 4px", fontSize:28, fontWeight:800, color }}>{value}</p>
    {sub&&<p style={{ margin:0, fontSize:11, color:"#94a3b8" }}>{sub}</p>}
    {onClick && (
      <div style={{
        position: "absolute",
        bottom: 8,
        right: 12,
        fontSize: 11,
        color: "#94a3b8",
        opacity: 0.6
      }}>
        {language === 'ar' ? "انقر للتصفية ←" : "Cliquer pour filtrer →"}
      </div>
    )}
  </div>
);

// ─── Dashboard Amélioré ──────────────────────────────────────────────────────────────
function Dashboard({ courriers, onAdd, onFilterClick, language, t }) {
  const s = useMemo(()=>({
    total:   courriers.length,
    depart:  courriers.filter(c=>c.type==="depart").length,
    arrivee: courriers.filter(c=>c.type==="arrivee").length,
    envoye:  courriers.filter(c=>c.status==="envoyé").length,
    enCours: courriers.filter(c=>c.status==="en cours").length,
    recu:    courriers.filter(c=>c.status==="reçu").length,
  }), [courriers]);

  const percentages = {
    envoye: s.total > 0 ? (s.envoye / s.total) * 100 : 0,
    recu: s.total > 0 ? (s.recu / s.total) * 100 : 0,
    enCours: s.total > 0 ? (s.enCours / s.total) * 100 : 0
  };

  return (
    <div style={{ animation: "fadeIn 0.5s ease-out", direction: language === 'ar' ? "rtl" : "ltr" }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .stat-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .stat-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 25px -12px rgba(0, 0, 0, 0.15);
        }
        .recent-item {
          transition: all 0.2s ease;
        }
        .recent-item:hover {
          transform: translateX(5px);
          background: linear-gradient(90deg, #f8fafc 0%, #ffffff 100%);
        }
      `}</style>

      <div style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        borderRadius: "20px",
        padding: "1.75rem 2rem",
        marginBottom: "2rem",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 10px 30px -10px rgba(0,0,0,0.2)"
      }}>
        <div style={{
          position: "absolute",
          top: "-50%",
          right: "-10%",
          width: "300px",
          height: "300px",
          background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)",
          borderRadius: "50%"
        }} />
        <div style={{
          position: "absolute",
          bottom: "-30%",
          left: "-5%",
          width: "200px",
          height: "200px",
          background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 70%)",
          borderRadius: "50%"
        }} />
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 2 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "28px", fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>
              {t.dashboard}
            </h1>
            <p style={{ margin: "8px 0 0", fontSize: "14px", color: "rgba(255,255,255,0.9)" }}>
              {language === 'ar' ? "نظرة عامة على مراسلات البلدية" : "Vue d'ensemble du courrier municipal"}
            </p>
          </div>
          <button 
            onClick={onAdd} 
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "12px 28px",
              borderRadius: "50px",
              border: "none",
              background: "#fff",
              color: "#667eea",
              fontWeight: 700,
              fontSize: "14px",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.1)";
            }}
          >
            <span style={{ fontSize: "18px" }}>+</span>
            {t.nouveauCourrier}
          </button>
        </div>
      </div>

      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", 
        gap: "20px", 
        marginBottom: "24px" 
      }}>
        <StatCard 
          label={t.totalCourriers} 
          value={s.total} 
          color="#0f172a" 
          icon="📋" 
          onClick={onFilterClick} 
          filterType="tous"
          language={language}
        />
        <StatCard 
          label={t.courriersDepart} 
          value={s.depart} 
          color="#7c3aed" 
          icon="↑" 
          sub={`${s.envoye} ${t.envoyesCount}`}
          onClick={onFilterClick} 
          filterType="depart"
          language={language}
        />
        <StatCard 
          label={t.courriersArrivee} 
          value={s.arrivee} 
          color="#dc2626" 
          icon="↓" 
          sub={`${s.recu} ${t.recusCount}`}
          onClick={onFilterClick} 
          filterType="arrivee"
          language={language}
        />
      </div>

      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", 
        gap: "20px", 
        marginBottom: "24px" 
      }}>
        <StatCard 
          label={t.enCoursStatus} 
          value={s.enCours} 
          color="#d97706" 
          icon="◐" 
          sub={t.aTraiter}
          onClick={onFilterClick} 
          filterType="enCours"
          language={language}
        />
        <StatCard 
          label={t.envoyes} 
          value={s.envoye} 
          color="#16a34a" 
          icon="✓" 
          sub={t.confirmes}
          onClick={onFilterClick} 
          filterType="envoyé"
          language={language}
        />
        <StatCard 
          label={t.recus} 
          value={s.recu} 
          color="#2563eb" 
          icon="✉" 
          sub={t.enregistres}
          onClick={onFilterClick} 
          filterType="reçu"
          language={language}
        />
      </div>

      {s.total > 0 && (
        <div style={{
          background: "#fff",
          borderRadius: "20px",
          padding: "1.5rem",
          border: "1px solid rgba(0,0,0,0.05)",
          marginBottom: "24px",
          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
          transition: "all 0.3s ease"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#1e293b" }}>
              📊 {t.repartitionStatut}
            </p>
            <div style={{
              padding: "4px 12px",
              background: "#f1f5f9",
              borderRadius: "20px",
              fontSize: "11px",
              color: "#64748b",
              fontWeight: 600
            }}>
              {t.total}: {s.total}
            </div>
          </div>
          
          <div style={{
            display: "flex",
            borderRadius: "12px",
            overflow: "hidden",
            height: "40px",
            gap: "4px",
            marginBottom: "20px",
            boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)"
          }}>
            {s.envoye > 0 && (
              <div style={{
                flex: s.envoye,
                background: "linear-gradient(90deg, #22c55e 0%, #16a34a 100%)",
                transition: "flex 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                borderRadius: "8px",
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: "12px",
                fontWeight: 600
              }}>
                {percentages.envoye > 15 && `${Math.round(percentages.envoye)}%`}
              </div>
            )}
            {s.recu > 0 && (
              <div style={{
                flex: s.recu,
                background: "linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)",
                transition: "flex 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: "12px",
                fontWeight: 600
              }}>
                {percentages.recu > 15 && `${Math.round(percentages.recu)}%`}
              </div>
            )}
            {s.enCours > 0 && (
              <div style={{
                flex: s.enCours,
                background: "linear-gradient(90deg, #f59e0b 0%, #d97706 100%)",
                transition: "flex 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: "12px",
                fontWeight: 600
              }}>
                {percentages.enCours > 15 && `${Math.round(percentages.enCours)}%`}
              </div>
            )}
          </div>
          
          <div style={{
            display: "flex",
            gap: "24px",
            flexWrap: "wrap",
            justifyContent: "center"
          }}>
            {[
              { color: "#16a34a", label: t.envoyes, value: s.envoye, icon: "✓" },
              { color: "#2563eb", label: t.recus, value: s.recu, icon: "✉" },
              { color: "#d97706", label: t.enCoursStatus, value: s.enCours, icon: "◐" }
            ].map((item) => (
              <div key={item.label} style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 12px",
                background: "#f8fafc",
                borderRadius: "10px",
                transition: "transform 0.2s ease"
              }}
              onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
              onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
                <div style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "8px",
                  background: `linear-gradient(135deg, ${item.color}20 0%, ${item.color}40 100%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "14px"
                }}>
                  {item.icon}
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: "11px", color: "#64748b", fontWeight: 500 }}>
                    {item.label}
                  </p>
                  <p style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: item.color }}>
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{
        background: "#fff",
        borderRadius: "20px",
        border: "1px solid rgba(0,0,0,0.05)",
        overflow: "hidden",
        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)"
      }}>
        <div style={{
          padding: "16px 20px",
          borderBottom: "1px solid #f1f5f9",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "20px" }}>📋</span>
            <p style={{ margin: 0, fontWeight: 700, fontSize: "15px", color: "#1e293b" }}>
              {t.courriersRecents}
            </p>
          </div>
          <div style={{
            padding: "4px 12px",
            background: "#e2e8f0",
            borderRadius: "20px",
            fontSize: "11px",
            color: "#64748b",
            fontWeight: 600
          }}>
            5 {language === 'ar' ? 'الأحدث' : 'derniers'}
          </div>
        </div>
        
        {courriers.slice(0, 5).map((c, index) => {
          const tm = TM[c.type];
          const sm = SM[c.status] || SM["en cours"];
          return (
            <div
              key={c.id}
              className="recent-item"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                padding: "14px 20px",
                borderBottom: index < 4 ? "1px solid #f1f5f9" : "none",
                cursor: "pointer",
                animation: `slideIn 0.3s ease-out ${index * 0.1}s both`,
                direction: language === 'ar' ? "rtl" : "ltr"
              }}
            >
              <div style={{
                width: "48px",
                height: "48px",
                borderRadius: "16px",
                background: tm.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "22px",
                color: tm.color,
                fontWeight: 900,
                transition: "transform 0.2s ease",
                flexShrink: 0
              }}
              onMouseEnter={e => e.currentTarget.style.transform = "rotate(5deg) scale(1.1)"}
              onMouseLeave={e => e.currentTarget.style.transform = "rotate(0deg) scale(1)"}>
                {tm.icon}
              </div>
              
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  margin: 0,
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#1e293b",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap"
                }}>
                  {c.objet}
                </p>
                <div style={{ display: "flex", gap: "8px", marginTop: "4px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                    📍 {c.destinataire}
                  </span>
                  <span style={{ fontSize: "11px", color: "#cbd5e1" }}>•</span>
                  <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                    🏙️ {c.ville}
                  </span>
                </div>
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px", flexShrink: 0 }}>
                <Badge m={sm} language={language} />
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "10px",
                  color: "#94a3b8"
                }}>
                  <span>📅</span>
                  <span>{fmtD(c.date || c.createdAt)}</span>
                </div>
              </div>
            </div>
          );
        })}
        
        {courriers.length > 5 && (
          <div style={{
            padding: "12px 20px",
            borderTop: "1px solid #f1f5f9",
            textAlign: "center",
            background: "#fafafa"
          }}>
            <button
              onClick={() => onFilterClick && onFilterClick("tous")}
              style={{
                background: "none",
                border: "none",
                color: "#3b82f6",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                transition: "gap 0.2s ease"
              }}
              onMouseEnter={e => e.currentTarget.style.gap = "8px"}
              onMouseLeave={e => e.currentTarget.style.gap = "4px"}
            >
              {t.voirTousCourriers}
              <span>→</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Export/Import Tools ──────────────────────────────────────────────────────
function ExportImportTools({ courriers, onImport, language, t }) {
  const fileInputRef = useRef(null);

  const exportToExcel = () => {
    const exportData = courriers.map(c => ({
      [t.numero]: c.numero,
      [t.type]: c.type === 'depart' ? t.departLabel : t.arriveeLabel,
      [t.date]: fmtD(c.date || c.createdAt),
      [t.service]: c.service,
      [t.destinataire]: c.destinataire,
      [t.ville]: c.ville,
      [t.objet]: c.objet,
      [t.statut]: language === 'ar' ? SM[c.status]?.labelAr : SM[c.status]?.labelFr,
      [language === 'ar' ? 'تاريخ الإنشاء' : 'Date création']: fmtD(c.createdAt)
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, language === 'ar' ? 'المراسلات' : 'Courriers');
    ws['!cols'] = [{wch:15}, {wch:10}, {wch:12}, {wch:20}, {wch:25}, {wch:15}, {wch:35}, {wch:12}, {wch:15}];
    XLSX.writeFile(wb, `${language === 'ar' ? 'المراسلات' : 'courriers'}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, pageWidth, 45, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(t.appTitle, pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(t.appSubtitle, pageWidth / 2, 32, { align: 'center' });
    
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(10);
    doc.text(`${t.genererLe}: ${new Date().toLocaleDateString(language === 'ar' ? 'ar-MA' : 'fr-FR')}`, pageWidth - 20, 55, { align: 'right' });
    
    const total = courriers.length;
    const depart = courriers.filter(c => c.type === 'depart').length;
    const arrivee = courriers.filter(c => c.type === 'arrivee').length;
    const envoye = courriers.filter(c => c.status === 'envoyé').length;
    const enCours = courriers.filter(c => c.status === 'en cours').length;
    const recu = courriers.filter(c => c.status === 'reçu').length;
    
    doc.setFillColor(248, 250, 252);
    doc.rect(14, 65, pageWidth - 28, 35, 'F');
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(t.statsResume, 20, 78);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`${t.total}: ${total} | ${t.departCount}: ${depart} | ${t.arriveeCount}: ${arrivee} | ${t.envoyes}: ${envoye} | ${t.enCoursStatus}: ${enCours} | ${t.recus}: ${recu}`, 20, 90);
    
    const tableData = courriers.map(c => [
      c.numero,
      language === 'ar' ? (c.type === 'depart' ? t.departLabel : t.arriveeLabel) : (c.type === 'depart' ? 'Départ' : 'Arrivée'),
      fmtD(c.date || c.createdAt),
      c.service,
      c.destinataire,
      c.ville,
      c.objet.length > 30 ? c.objet.substring(0, 30) + '...' : c.objet,
      language === 'ar' ? SM[c.status]?.labelAr : SM[c.status]?.labelFr
    ]);
    
    autoTable(doc, {
      startY: 115,
      head: [[t.numero, t.type, t.date, t.service, t.destinataire, t.ville, t.objet, t.statut]],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9
      },
      bodyStyles: {
        fontSize: 8
      },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 15 },
        2: { cellWidth: 20 },
        3: { cellWidth: 30 },
        4: { cellWidth: 30 },
        5: { cellWidth: 20 },
        6: { cellWidth: 50 },
        7: { cellWidth: 20 }
      },
      margin: { left: 14, right: 14 }
    });
    
    const finalY = doc.lastAutoTable.finalY || 200;
    doc.setDrawColor(226, 232, 240);
    doc.line(14, finalY + 10, pageWidth - 14, finalY + 10);
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(8);
    doc.text(`${t.documentGenere} - ${new Date().toLocaleString(language === 'ar' ? 'ar-MA' : 'fr-FR')}`, pageWidth / 2, finalY + 20, { align: 'center' });
    
    doc.save(`${language === 'ar' ? 'المراسلات' : 'courriers'}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

const importFromExcel = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    const importedCourriers = jsonData.map((row, index) => {
      const typeLabel = row[t.type] || row['Type'];
      let type = typeLabel === t.departLabel || typeLabel === 'Départ' ? 'depart' : 'arrivee';
      let status = 'en cours';
      const statusLabel = row[t.statut] || row['Statut'];
      if (statusLabel === t.envoye || statusLabel === 'Envoyé') status = 'envoyé';
      if (statusLabel === t.recu || statusLabel === 'Reçu') status = 'reçu';
      
      return {
        id: `import_${Date.now()}_${index}`,
        numero: row[t.numero] || row['Numéro'] || genNum(type, courriers),
        type: type,
        date: row[t.date] || row['Date'] || new Date().toISOString().split('T')[0],
        service: row[t.service] || row['Service'] || '',
        destinataire: row[t.destinataire] || row['Destinataire'] || '',
        ville: row[t.ville] || row['Ville'] || '',
        objet: row[t.objet] || row['Objet'] || '',
        status: status,
        createdAt: new Date()
      };
    });
    
    if (window.confirm(`${importedCourriers.length} ${t.importReussi}`)) {
      onImport(importedCourriers);  // Appelle directement onImport avec les données
    }
  };
  reader.readAsArrayBuffer(file);
  event.target.value = '';
};
  return (
    <div style={{ display: "flex", gap: 8 }}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={importFromExcel}
        accept=".xlsx, .xls, .csv"
        style={{ display: "none" }}
      />
      <button
        onClick={() => fileInputRef.current.click()}
        style={{
          padding: "8px 16px",
          borderRadius: 8,
          border: "1px solid #e2e8f0",
          background: "#fff",
          cursor: "pointer",
          fontSize: 12,
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: 6,
          color: "#475569"
        }}
      >
        📥 {t.importerExcel}
      </button>
      <button
        onClick={exportToExcel}
        style={{
          padding: "8px 16px",
          borderRadius: 8,
          border: "1px solid #10b981",
          background: "#10b981",
          cursor: "pointer",
          fontSize: 12,
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: 6,
          color: "#fff"
        }}
      >
        📊 {t.exporterExcel}
      </button>
      <button
        onClick={exportToPDF}
        style={{
          padding: "8px 16px",
          borderRadius: 8,
          border: "1px solid #ef4444",
          background: "#ef4444",
          cursor: "pointer",
          fontSize: 12,
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: 6,
          color: "#fff"
        }}
      >
        📄 {t.pdf}
      </button>
    </div>
  );
}

// ─── Table View ───────────────────────────────────────────────────────────────
function TableView({ courriers, typeFilter, onSelect, onAdd, onUpdateStatus, language, t }) {
  const [search, setSearch] = useState("");
  const [fDate, setFDate]   = useState("");
  const [fStat, setFStat]   = useState("tous");
  const [sCol, setSCol]     = useState("date");
  const [sDir, setSDir]     = useState("desc");

  const getTitle = () => {
    if (typeFilter==="tous") return t.all;
    if (typeFilter==="depart") return t.depart;
    if (typeFilter==="arrivee") return t.arrivee;
    if (typeFilter==="envoyé") return t.envoyes;
    if (typeFilter==="reçu") return t.recus;
    return t.enCoursStatus;
  };

  const rows = useMemo(()=>{
    let list = [...courriers];
    if (typeFilter==="enCours") list=list.filter(c=>c.status==="en cours");
    else if (typeFilter==="envoyé") list=list.filter(c=>c.status==="envoyé");
    else if (typeFilter==="reçu") list=list.filter(c=>c.status==="reçu");
    else if (typeFilter!=="tous") list=list.filter(c=>c.type===typeFilter);
    if (fStat!=="tous") list=list.filter(c=>c.status===fStat);
    if (fDate) list=list.filter(c=>(c.date||"").startsWith(fDate));
    if (search) { const q=search.toLowerCase();
      list=list.filter(c=>[c.numero,c.objet,c.ville,c.destinataire,c.service].some(f=>f?.toLowerCase().includes(q))); }
    list.sort((a,b)=>{
      let va=a[sCol]||"", vb=b[sCol]||"";
      if(sCol==="date"){va=new Date(va||0);vb=new Date(vb||0);}
      return sDir==="asc"?(va>vb?1:-1):(va<vb?1:-1);
    });
    return list;
  },[courriers,typeFilter,search,fDate,fStat,sCol,sDir]);

  const toggleSort = c => { if(sCol===c)setSDir(d=>d==="asc"?"desc":"asc"); else{setSCol(c);setSDir("desc");} };
  const si = c => sCol===c?(sDir==="asc"?"↑":"↓"):"⇅";

  const TH = ({ col, children }) => (
    <th onClick={col?()=>toggleSort(col):undefined}
      style={{ padding:"10px 14px", textAlign: language === 'ar' ? "right" : "left", fontSize:11, fontWeight:700, color:"#94a3b8",
        textTransform:"uppercase", letterSpacing:"0.05em", borderBottom:"1px solid #f1f5f9",
        whiteSpace:"nowrap", cursor:col?"pointer":"default", userSelect:"none" }}>
      {children} {col&&<span style={{opacity:0.5}}>{si(col)}</span>}
    </th>
  );
  const td = { padding:"11px 14px", fontSize:13, color:"#1e293b", borderBottom:"1px solid #f8fafc", verticalAlign:"middle", textAlign: language === 'ar' ? "right" : "left" };

  return (
    <div style={{ direction: language === 'ar' ? "rtl" : "ltr" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.25rem" }}>
        <div>
          <h1 style={{ margin:0, fontSize:20, fontWeight:800, color:"#0f172a" }}>{getTitle()}</h1>
          <p style={{ margin:"3px 0 0", fontSize:12, color:"#94a3b8" }}>{rows.length} {language === 'ar' ? 'نتيجة' : 'résultat'}{rows.length!==1 && language !== 'ar' ? 's' : ''}</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
<ExportImportTools courriers={rows} onImport={(data) => onAdd(data)} language={language} t={t} />
          <button onClick={onAdd} style={{ display:"flex",alignItems:"center",gap:7,padding:"9px 20px",
            borderRadius:9,border:"none",background:"#2563eb",color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer" }}>
            + {t.nouveauCourrier}
          </button>
        </div>
      </div>

      <div style={{ background:"#fff", borderRadius:12, padding:"12px 14px", border:"1px solid #f1f5f9",
        marginBottom:"1rem", display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
        <div style={{ flex:1, minWidth:200, position:"relative" }}>
          <span style={{ position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",fontSize:14,color:"#94a3b8" }}>⌕</span>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder={t.rechercher}
            style={{ width:"100%",padding:"8px 12px 8px 32px",borderRadius:8,border:"1px solid #e2e8f0",
              fontSize:13,outline:"none",fontFamily:"inherit",boxSizing:"border-box" }}/>
        </div>
        <input type="date" value={fDate} onChange={e=>setFDate(e.target.value)}
          style={{ padding:"8px 12px",borderRadius:8,border:"1px solid #e2e8f0",fontSize:13,outline:"none",fontFamily:"inherit" }}/>
        <select value={fStat} onChange={e=>setFStat(e.target.value)}
          style={{ padding:"8px 12px",borderRadius:8,border:"1px solid #e2e8f0",fontSize:13,
            outline:"none",fontFamily:"inherit",background:"#fff",color:"#1e293b" }}>
          <option value="tous">{t.tousStatuts}</option>
          <option value="envoyé">{t.envoye}</option>
          <option value="en cours">{t.enCoursStatus}</option>
          <option value="reçu">{t.recu}</option>
        </select>
        {(search||fDate||fStat!=="tous")&&(
          <button onClick={()=>{setSearch("");setFDate("");setFStat("tous");}}
            style={{ padding:"8px 12px",borderRadius:8,fontSize:12,border:"1px solid #fecaca",
              background:"#fff7f7",color:"#dc2626",cursor:"pointer",fontWeight:600 }}>
            ✕ {t.reinitialiser}
          </button>
        )}
      </div>

      <div style={{ background:"#fff", borderRadius:12, border:"1px solid #f1f5f9", overflow:"hidden" }}>
        {rows.length===0 ? (
          <div style={{ padding:"4rem", textAlign:"center" }}>
            <p style={{ fontSize:36,margin:"0 0 8px" }}>📭</p>
            <p style={{ margin:0, color:"#94a3b8", fontSize:14 }}>{t.aucunCourrier}</p>
          </div>
        ) : (
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ background:"#fafafa" }}>
                  <TH col="numero">{t.numero}</TH>
                  <TH col="date">{t.date}</TH>
                  <TH>{t.service}</TH>
                  <TH col="destinataire">{t.destinataire}</TH>
                  <TH col="ville">{t.ville}</TH>
                  <TH>{t.objet}</TH>
                  <TH>{t.type}</TH>
                  <TH>{t.statut}</TH>
                </tr>
              </thead>
              <tbody>
                {rows.map(c=>(
                  <tr key={c.id} style={{ cursor:"pointer" }}
                    onMouseEnter={e=>e.currentTarget.style.background="#f8fafc"}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <td style={td} onClick={()=>onSelect(c)}>
                      <span style={{ fontFamily:"monospace",fontWeight:700,fontSize:12,color:"#475569" }}>{c.numero}</span>
                    </td>
                    <td style={td} onClick={()=>onSelect(c)}>
                      <span style={{ color:"#64748b" }}>{fmtD(c.date||c.createdAt)}</span>
                    </td>
                    <td style={{ ...td, maxWidth:140, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }} onClick={()=>onSelect(c)}>
                      <span title={c.service} style={{ color:"#64748b" }}>{c.service}</span>
                    </td>
                    <td style={td} onClick={()=>onSelect(c)}>
                      <span style={{ fontWeight:600 }}>{c.destinataire}</span>
                    </td>
                    <td style={td} onClick={()=>onSelect(c)}>{c.ville}</td>
                    <td style={{ ...td, maxWidth:220, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }} onClick={()=>onSelect(c)}>
                      <span title={c.objet}>{c.objet}</span>
                    </td>
                    <td style={td} onClick={()=>onSelect(c)}>
                      <Badge m={TM[c.type]} language={language} />
                    </td>
                    <td style={td}>
                      <Badge 
                        m={SM[c.status]||SM["en cours"]} 
                        clickable={true}
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateStatus(c);
                        }}
                        language={language}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Add Form ─────────────────────────────────────────────────────────────────
function AddForm({ list, onSave, onClose, language, t }) {
  const [type, setType] = useState("depart");
  const [f, setF] = useState({ date:new Date().toISOString().slice(0,10), service:"", destinataire:"", ville:"", objet:"", status:"en cours" });
  const [err, setErr] = useState({});
  const [loading, setLoading] = useState(false);

  const numero = useMemo(()=>genNum(type,list),[type,list]);
  const setVal = (k,v)=>{ setF(p=>({...p,[k]:v})); setErr(e=>({...e,[k]:null})); };

  const validate = () => {
    const e={};
    if(!f.service)e.service= language === 'ar' ? "مطلوب" : "Requis";
    if(!f.destinataire)e.destinataire= language === 'ar' ? "مطلوب" : "Requis";
    if(!f.ville)e.ville= language === 'ar' ? "مطلوب" : "Requis";
    if(!f.objet)e.objet= language === 'ar' ? "مطلوب" : "Requis";
    setErr(e); return !Object.keys(e).length;
  };

  const submit = async () => {
    if(!validate())return;
    setLoading(true);
    try {
      const data={...f,type,numero};
      if(db){ await fsAddDoc(fsCollection(db,"courriers"),{...data,createdAt:fsServerTimestamp()}); }
      onSave({...data, id:Date.now().toString(), createdAt:new Date()});
      onClose();
    } catch { setErr({form: language === 'ar' ? "خطأ في Firebase - تحقق من الإعدادات" : "Erreur Firebase — vérifiez votre configuration."}); }
    finally { setLoading(false); }
  };

  const I = (k, ph, type="text") => ({
    value:f[k], type, placeholder:ph,
    onChange:e=>setVal(k,e.target.value),
    style:{ width:"100%", padding:"9px 12px", borderRadius:8, fontFamily:"inherit", fontSize:13,
      boxSizing:"border-box", outline:"none",
      border:`1px solid ${err[k]?"#fca5a5":"#e2e8f0"}`,
      background:err[k]?"#fff7f7":"#f8fafc" }
  });
  const L = (txt,req) => (
    <label style={{ display:"block",fontSize:10,fontWeight:800,color:"#94a3b8",marginBottom:4,
      textTransform:"uppercase",letterSpacing:"0.07em" }}>
      {txt}{req&&<span style={{color:"#ef4444"}}> *</span>}
    </label>
  );

  return (
    <div style={{ padding:"1.25rem 1.5rem", direction: language === 'ar' ? "rtl" : "ltr" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",marginBottom:"1rem" }}>
        <div>
          <h2 style={{ margin:0,fontSize:17,fontWeight:800,color:"#0f172a" }}>{t.nouveauCourrier}</h2>
          <p style={{ margin:"2px 0 0",fontSize:11,color:"#94a3b8" }}>{language === 'ar' ? 'املأ النموذج أدناه' : 'Remplissez le formulaire ci-dessous'}</p>
        </div>
        <button onClick={onClose} style={{ background:"none",border:"none",cursor:"pointer",fontSize:20,color:"#94a3b8",padding:"2px 6px" }}>✕</button>
      </div>

      <div style={{ background:"#f0f9ff",border:"1px solid #bae6fd",borderRadius:9,padding:"10px 14px",
        marginBottom:"1rem",display:"flex",alignItems:"center",gap:10 }}>
        <span style={{ fontSize:18 }}>🔢</span>
        <div>
          <p style={{ margin:0,fontSize:10,color:"#0369a1",fontWeight:800,textTransform:"uppercase",letterSpacing:"0.06em" }}>{t.numeroAutoGenere}</p>
          <p style={{ margin:0,fontFamily:"monospace",fontWeight:800,color:"#0c4a6e",fontSize:16 }}>{numero}</p>
        </div>
      </div>

      <div style={{ marginBottom:"1rem" }}>
        {L(t.typeCourrier,true)}
        <div style={{ display:"flex",gap:8 }}>
          {["depart","arrivee"].map(tp=>(
            <button key={tp} onClick={()=>setType(tp)} style={{
              flex:1,padding:"10px 0",borderRadius:9,fontSize:13,fontWeight:700,cursor:"pointer",
              border:`2px solid ${type===tp?(tp==="depart"?"#7c3aed":"#dc2626"):"#e2e8f0"}`,
              background:type===tp?(tp==="depart"?"#ede9fe":"#fee2e2"):"#fff",
              color:type===tp?(tp==="depart"?"#5b21b6":"#991b1b"):"#94a3b8",transition:"all 0.14s" }}>
              {tp==="depart"?`↑ ${t.departLabel}`:`↓ ${t.arriveeLabel}`}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.85rem",marginBottom:"0.85rem" }}>
        <div>{L(t.date,true)}<input {...I("date","","date")}/></div>
        <div>{L(t.statut)}
          <select value={f.status} onChange={e=>setVal("status",e.target.value)}
            style={{ width:"100%",padding:"9px 12px",borderRadius:8,fontFamily:"inherit",
              fontSize:13,border:"1px solid #e2e8f0",background:"#f8fafc",outline:"none" }}>
            <option value="en cours">{t.enCoursStatus}</option>
            <option value="envoyé">{t.envoye}</option>
            <option value="reçu">{t.recu}</option>
          </select>
        </div>
      </div>
      <div style={{ marginBottom:"0.85rem" }}>
        {L(t.serviceExpediteur,true)}
        <input {...I("service", language === 'ar' ? "مثال: المديرية المالية" : "Ex: Direction des Finances")}/>
        {err.service&&<p style={{ margin:"3px 0 0",fontSize:11,color:"#ef4444" }}>{err.service}</p>}
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.85rem",marginBottom:"0.85rem" }}>
        <div>{L(t.destinataire,true)}<input {...I("destinataire", language === 'ar' ? "الاسم أو المؤسسة" : "Nom ou organisme")}/>
          {err.destinataire&&<p style={{ margin:"3px 0 0",fontSize:11,color:"#ef4444" }}>{err.destinataire}</p>}</div>
        <div>{L(t.ville,true)}<input {...I("ville", t.ville)}/>
          {err.ville&&<p style={{ margin:"3px 0 0",fontSize:11,color:"#ef4444" }}>{err.ville}</p>}</div>
      </div>
      <div style={{ marginBottom:"1rem" }}>
        {L(t.objetCourrier,true)}
        <textarea rows={3} {...I("objet", t.objetCourrier)}
          style={{ ...I("objet","").style, resize:"vertical" }}/>
        {err.objet&&<p style={{ margin:"3px 0 0",fontSize:11,color:"#ef4444" }}>{err.objet}</p>}
      </div>

      {err.form&&<div style={{ background:"#fff7f7",border:"1px solid #fecaca",borderRadius:8,
        padding:"10px 14px",marginBottom:"1rem",fontSize:13,color:"#dc2626" }}>{err.form}</div>}

      <div style={{ display:"flex",gap:8,justifyContent:"flex-end" }}>
        <button onClick={onClose} style={{ padding:"9px 20px",borderRadius:9,border:"1px solid #e2e8f0",
          background:"#fff",cursor:"pointer",fontSize:13,color:"#64748b",fontWeight:600 }}>{t.annuler}</button>
        <button onClick={submit} disabled={loading}
          style={{ padding:"9px 24px",borderRadius:9,border:"none",
            background:loading?"#94a3b8":"#2563eb",color:"#fff",
            cursor:loading?"not-allowed":"pointer",fontSize:13,fontWeight:700 }}>
          {loading ? t.enregistrement : `✓ ${t.enregistrer}`}
        </button>
      </div>
    </div>
  );
}

// ─── Status Update Modal ──────────────────────────────────────────────────────
function StatusUpdateModal({ courrier, onUpdate, onClose, language, t }) {
  const [status, setStatus] = useState(courrier?.status || "en cours");
  const [loading, setLoading] = useState(false);
  const [comment, setComment] = useState("");

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const updates = { status };
      if (comment) updates.comment = comment;
      
      if (db) {
        const docRef = fsDoc(db, "courriers", courrier.id);
        await fsUpdateDoc(docRef, updates);
      }
      
      onUpdate(courrier.id, status);
      onClose();
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (s) => {
    switch(s) {
      case "envoyé": return "#16a34a";
      case "reçu": return "#2563eb";
      default: return "#ca8a04";
    }
  };

  return (
    <div style={{ padding:"1.25rem 1.5rem", direction: language === 'ar' ? "rtl" : "ltr" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1rem" }}>
        <div>
          <h2 style={{ margin:0, fontSize:17, fontWeight:800, color:"#0f172a" }}>{t.modifierStatut}</h2>
          <p style={{ margin:"2px 0 0", fontSize:11, color:"#94a3b8" }}>
            {language === 'ar' ? 'مراسلة' : 'Courrier'}: <span style={{ fontFamily:"monospace", fontWeight:600 }}>{courrier?.numero}</span>
          </p>
        </div>
        <button onClick={onClose} style={{ background:"none",border:"none",cursor:"pointer",fontSize:20,color:"#94a3b8" }}>✕</button>
      </div>

      <div style={{ marginBottom:"1.25rem" }}>
        <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#475569", marginBottom:8 }}>
          {t.nouveauStatut}
        </label>
        <div style={{ display:"flex", gap:10 }}>
          {["en cours", "envoyé", "reçu"].map(s => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              style={{
                flex:1,
                padding:"10px",
                borderRadius:8,
                border:`2px solid ${status === s ? getStatusColor(s) : "#e2e8f0"}`,
                background: status === s ? `${getStatusColor(s)}10` : "#fff",
                color: status === s ? getStatusColor(s) : "#64748b",
                fontWeight: status === s ? 700 : 500,
                fontSize:13,
                cursor:"pointer",
                transition:"all 0.14s"
              }}
            >
              {s === "en cours" ? `◐ ${t.enCoursStatus}` : s === "envoyé" ? `✓ ${t.envoye}` : `✉ ${t.recu}`}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom:"1.25rem" }}>
        <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#475569", marginBottom:8 }}>
          {t.commentaire}
        </label>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder={t.commentairePlaceholder}
          rows={3}
          style={{
            width:"100%",
            padding:"9px 12px",
            borderRadius:8,
            border:"1px solid #e2e8f0",
            fontSize:13,
            fontFamily:"inherit",
            resize:"vertical",
            outline:"none"
          }}
        />
      </div>

      <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
        <button
          onClick={onClose}
          style={{
            padding:"9px 20px",
            borderRadius:9,
            border:"1px solid #e2e8f0",
            background:"#fff",
            cursor:"pointer",
            fontSize:13,
            color:"#64748b",
            fontWeight:600
          }}
        >
          {t.annuler}
        </button>
        <button
          onClick={handleUpdate}
          disabled={loading || status === courrier?.status}
          style={{
            padding:"9px 24px",
            borderRadius:9,
            border:"none",
            background:(loading || status === courrier?.status) ? "#94a3b8" : "#2563eb",
            color:"#fff",
            cursor:(loading || status === courrier?.status) ? "not-allowed" : "pointer",
            fontSize:13,
            fontWeight:700
          }}
        >
          {loading ? t.miseAJour : `✓ ${t.mettreAJour}`}
        </button>
      </div>
    </div>
  );
}

// ─── Detail View ──────────────────────────────────────────────────────────────
function Detail({ c, onClose, onUpdateStatus, language, t }) {
  if (!c) return null;
  const tm=TM[c.type], sm=SM[c.status]||SM["en cours"];
  const Row = ({l,v}) => (
    <div style={{ display:"flex",gap:14,padding:"9px 0",borderBottom:"1px solid #f8fafc" }}>
      <span style={{ width:130,flexShrink:0,fontSize:10,fontWeight:800,color:"#94a3b8",
        textTransform:"uppercase",letterSpacing:"0.06em",paddingTop:1 }}>{l}</span>
      <span style={{ fontSize:13,color:"#1e293b",flex:1 }}>{v||"—"}</span>
    </div>
  );
  
  return (
    <div style={{ padding:"1.25rem 1.5rem", direction: language === 'ar' ? "rtl" : "ltr" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"1rem" }}>
        <div style={{ display:"flex",gap:12,alignItems:"center" }}>
          <div style={{ width:42,height:42,borderRadius:10,background:tm.bg,
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:22,color:tm.color,fontWeight:900 }}>{tm.icon}</div>
          <div>
            <p style={{ margin:0,fontFamily:"monospace",fontSize:14,fontWeight:800,color:tm.color }}>{c.numero}</p>
            <p style={{ margin:0,fontSize:11,color:"#94a3b8" }}>{t.enregistreLe} {fmtD(c.createdAt)}</p>
          </div>
        </div>
        <button onClick={onClose} style={{ background:"none",border:"none",cursor:"pointer",fontSize:20,color:"#94a3b8" }}>✕</button>
      </div>
      <p style={{ margin:"0 0 12px",fontSize:15,fontWeight:700,color:"#0f172a",lineHeight:1.45 }}>{c.objet}</p>
      <div style={{ display:"flex",gap:7,marginBottom:"1.25rem", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex",gap:7 }}>
          <Badge m={tm} language={language}/>
          <Badge 
            m={sm} 
            clickable={true}
            onClick={() => onUpdateStatus(c)}
            language={language}
          />
        </div>
        <button 
          onClick={() => onUpdateStatus(c)}
          style={{
            padding:"5px 12px",
            borderRadius:6,
            border:"1px solid #e2e8f0",
            background:"#fff",
            cursor:"pointer",
            fontSize:11,
            color:"#475569",
            fontWeight:600,
            display:"flex",
            alignItems:"center",
            gap:5
          }}
        >
          ✏️ {t.modifierStatut}
        </button>
      </div>
      <Row l={t.date} v={fmtD(c.date||c.createdAt)}/>
      <Row l={t.service} v={c.service}/>
      <Row l={t.destinataire} v={c.destinataire}/>
      <Row l={t.ville} v={c.ville}/>
      <Row l={t.statut} v={language === 'ar' ? sm.labelAr : sm.labelFr}/>
      {c.comment && <Row l={t.commentaire} v={c.comment}/>}
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [courriers, setCourriers] = useState(DEMO);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState("dashboard");
  const [sCol, setSCol] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [sel, setSel] = useState(null);
  const [statusUpdateCourrier, setStatusUpdateCourrier] = useState(null);
  const [language, setLanguage] = useState("fr");
  const [notifications, setNotifications] = useState([
    { id: 1, titleFr: "Bienvenue", titleAr: "مرحباً", messageFr: "Bienvenue dans votre application de gestion", messageAr: "مرحباً في تطبيق إدارة المراسلات", time: "À l'instant", read: false, icon: "🎉" },
  ]);

  const t = translations[language];

  const addNotification = (message, type = "info") => {
    const newNotif = {
      id: Date.now(),
      titleFr: type === "success" ? "Succès" : type === "error" ? "Erreur" : "Information",
      titleAr: type === "success" ? "نجاح" : type === "error" ? "خطأ" : "معلومات",
      messageFr: message,
      messageAr: message,
      time: "À l'instant",
      read: false,
      icon: type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️"
    };
    setNotifications(prev => [newNotif, ...prev]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotif.id));
    }, 5000);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      const ok = await initFirebase();
      if (ok && db) {
        try {
          const q = fsQuery(fsCollection(db, "courriers"), fsOrderBy("createdAt", "desc"));
          const snap = await fsDocs(q);
          if (snap.docs.length > 0) {
            setCourriers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            addNotification(t.chargementReussi, "success");
          }
        } catch (error) {
          console.error("Erreur de chargement:", error);
          addNotification(t.erreurChargement, "error");
        }
      }
      setLoading(false);
    })();
  }, []);

  const handleFilterClick = (filterType) => {
    if (filterType === "tous") setPage("tous");
    else if (filterType === "depart") setPage("depart");
    else if (filterType === "arrivee") setPage("arrivee");
    else if (filterType === "enCours") setPage("enCours");
    else if (filterType === "envoyé") {
      setPage("tous");
      addNotification(t.filtreApplique, "info");
    } else if (filterType === "reçu") {
      setPage("tous");
      addNotification(t.filtreRecusApplique, "info");
    }
  };

// Remplacer cette fonction dans le composant App (vers la fin du fichier) :

 const handleImport = (importedCourriers) => {
  // Vérifier que c'est un tableau et non un événement
  if (!importedCourriers || !Array.isArray(importedCourriers)) {
    console.error("Données invalides:", importedCourriers);
    addNotification("Erreur: données d'importation invalides", "error");
    return;
  }
  setCourriers(prev => [...importedCourriers, ...prev]);
  addNotification(`${importedCourriers.length} ${t.importReussi}`, "success");
};
  const handleRefresh = async () => {
    setLoading(true);
    try {
      if (db) {
        const q = fsQuery(fsCollection(db, "courriers"), fsOrderBy("createdAt", "desc"));
        const snap = await fsDocs(q);
        if (snap.docs.length > 0) {
          setCourriers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        }
      }
      addNotification(t.rafraichissementReussi, "success");
    } catch (error) {
      addNotification(t.erreurRafraichissement, "error");
    }
    setLoading(false);
  };

  const handleUpdateStatus = (courrier) => {
    setStatusUpdateCourrier(courrier);
  };

  const handleStatusUpdate = (id, newStatus) => {
    setCourriers(prevCourriers => 
      prevCourriers.map(c => 
        c.id === id ? { ...c, status: newStatus } : c
      )
    );
    addNotification(t.statutMisAJour, "success");
  };

  const counts = useMemo(() => ({
    tous: courriers.length,
    depart: courriers.filter(c => c.type === "depart").length,
    arrivee: courriers.filter(c => c.type === "arrivee").length,
    enCours: courriers.filter(c => c.status === "en cours").length,
  }), [courriers]);

  const getTypeFilter = () => {
    if (page === "dashboard") return null;
    if (page === "tous") return "tous";
    if (page === "depart") return "depart";
    if (page === "arrivee") return "arrivee";
    if (page === "enCours") return "enCours";
    return null;
  };

  const typeFilter = getTypeFilter();

  const styles = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div style={{ 
        display: "flex", 
        minHeight: "100vh", 
        background: "#f1f5f9",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        direction: language === 'ar' ? "rtl" : "ltr"
      }}>
        <Sidebar active={page} onChange={setPage} counts={counts} col={sCol} setCol={setSCol} language={language} t={t} />

        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          
          <div style={{ 
            height: 64, 
            background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
            borderBottom: "1px solid #e2e8f0",
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between",
            padding: "0 1.5rem", 
            gap: 12, 
            flexShrink: 0,
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
          }}>
            
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                color: "#fff",
                transition: "transform 0.2s ease"
              }}
              onMouseEnter={e => e.currentTarget.style.transform = "rotate(5deg) scale(1.05)"}
              onMouseLeave={e => e.currentTarget.style.transform = "rotate(0deg) scale(1)"}>
                📅
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#1e293b" }}>
                  {new Date().toLocaleDateString(language === 'ar' ? 'ar-MA' : 'fr-FR', {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                  })}
                </p>
                <p style={{ margin: "2px 0 0", fontSize: 10, color: "#94a3b8" }}>
                  ⏰ {new Date().toLocaleTimeString(language === 'ar' ? 'ar-MA' : 'fr-FR', { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>

            <LanguageSwitcher language={language} setLanguage={setLanguage} t={t} />

            {loading && (
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 14px",
                background: "#f0f9ff",
                borderRadius: 20,
                border: "1px solid #bae6fd"
              }}>
                <div style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#0ea5e9",
                  animation: "spin 1s linear infinite"
                }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: "#0369a1" }}>
                  {t.synchronisation}
                </span>
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button
                onClick={handleRefresh}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  border: "1px solid #e2e8f0",
                  background: "#fff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "#f8fafc";
                  e.currentTarget.style.transform = "rotate(45deg)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "#fff";
                  e.currentTarget.style.transform = "rotate(0deg)";
                }}
                title={t.rafraichir}
              >
                🔄
              </button>
            </div>

            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "4px 8px 4px 12px",
              borderRadius: 40,
              background: "#fff",
              border: "1px solid #e2e8f0",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "#f8fafc";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "#fff";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}>
              <div style={{ textAlign: language === 'ar' ? "left" : "right" }}>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#1e293b" }}>
                  Mohamed Ouahi
                </p>
                <p style={{ margin: "2px 0 0", fontSize: 10, color: "#94a3b8" }}>
                  {t.administrateur}
                </p>
              </div>
              <div style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                color: "#fff",
                fontWeight: 800,
                position: "relative"
              }}>
                MO
                <span style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: "#10b981",
                  border: "2px solid #fff"
                }} />
              </div>
            </div>
          </div>

          <main style={{ flex: 1, padding: "1.5rem", overflowY: "auto" }}>
            {page === "dashboard"
              ? <Dashboard 
                  courriers={courriers} 
                  onAdd={() => setShowAdd(true)} 
                  onFilterClick={handleFilterClick}
                  language={language}
                  t={t}
                />
              : <TableView 
                  courriers={courriers} 
                  typeFilter={typeFilter}
                  onSelect={setSel} 
                  onAdd={handleImport}
                  onUpdateStatus={handleUpdateStatus}
                  language={language}
                  t={t}
                />
            }
          </main>

          <footer style={{ 
            background: "#fff", 
            borderTop: "1px solid #f1f5f9", 
            padding: "10px 1.5rem", 
            textAlign: "center" 
          }}>
            <p style={{ margin: 0, fontSize: 11, color: "#cbd5e1" }}>
              Gestion du Courrier Administratif — Developed by{" "}
              <span style={{ color: "#64748b", fontWeight: 700 }}>Mohamed Ouahi</span>
            </p>
          </footer>
        </div>

        <Overlay open={showAdd} onClose={() => setShowAdd(false)}>
          <AddForm 
            list={courriers} 
            onSave={doc => setCourriers(p => [doc, ...p])} 
            onClose={() => setShowAdd(false)}
            language={language}
            t={t}
          />
        </Overlay>
        
        <Overlay open={!!sel} onClose={() => setSel(null)}>
          <Detail 
            c={sel} 
            onClose={() => setSel(null)}
            onUpdateStatus={handleUpdateStatus}
            language={language}
            t={t}
          />
        </Overlay>
        
        <Overlay open={!!statusUpdateCourrier} onClose={() => setStatusUpdateCourrier(null)}>
          <StatusUpdateModal 
            courrier={statusUpdateCourrier}
            onUpdate={handleStatusUpdate}
            onClose={() => setStatusUpdateCourrier(null)}
            language={language}
            t={t}
          />
        </Overlay>
      </div>
    </>
  );
} 