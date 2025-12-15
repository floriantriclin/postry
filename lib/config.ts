// Ce fichier centralise toutes les options de l'application.

export const LANGUAGES = [
  { code: 'fr', flag: 'fr', label: 'Français' },
  { code: 'en', flag: 'gb', label: 'English' },
  { code: 'es', flag: 'es', label: 'Español' },
  { code: 'de', flag: 'de', label: 'Deutsch' },
  { code: 'it', flag: 'it', label: 'Italiano' },
  { code: 'pt', flag: 'pt', label: 'Português' },
];

export const GOALS = [
  { value: 'visibilité', label: '👁️ Visibilité (Maximiser les vues)' },
  { value: 'engagement', label: '💬 Engagement (Générer des débats)' },
  { value: 'vente', label: '💰 Conversion (Vendre / Leads)' },
  { value: 'autorité', label: '🏆 Autorité (Preuve d\'expertise)' },
];

export const TONES = [
  { value: 'pédagogue', label: '🎓 Pédagogue & Expert' },
  { value: 'storytelling', label: '✨ Émotionnel & Personnel' },
  { value: 'clivant', label: '🔥 Clivant & Direct' },
  { value: 'professionnel', label: '💼 Formel & Corporate' },
  { value: 'humoristique', label: '😂 Léger & Drôle' },
];

export const SPEAKERS = [
  { value: 'je', label: 'Je' },
  { value: 'nous', label: 'Nous' },
  { value: 'neutre', label: 'Neutre (Impersonnel)' },
];

export const GENDERS = [
  { value: 'homme', label: 'Homme' },
  { value: 'femme', label: 'Femme' },
];

export const AUDIENCES = [
  { value: 'tu', label: 'Tu (Proximité)' },
  { value: 'vous', label: 'Vous (Professionnel)' },
  { value: 'none', label: 'Personne (Style éditorial)' },
];