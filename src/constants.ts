import { ParagraphSegment } from './types';

export const DEFAULT_FANTASY_TEXT = `Le monde naît dans un sifflement de givre — une odeur de métal froid et d'ozone brûlé, comme si l'air lui-même avait été forgé puis trempé trop vite.

La conscience revient comme une aiguille glacée enfoncée sous les tempes, balayant tout arrière-plan. Pas de douleur, pas de passé, aucune attache : tu es un canevas blanc sur un autel de pierre noire, et la pierre se souvient de ton poids avant même que tu ne te souviennes de toi.

Autour de toi, les vestiges d'une architecture cyclopéenne percent un ciel de cendre. La léthargie millénaire se fissure, tes muscles se délient sous une couche de glace en liquéfaction lente — un bruit de verre qui pleure.

Un seul écho persiste au centre du néant, ancré comme une obsession, comme la dernière page d'un livre qu'on aurait brûlé : Elenya.

Le sommeil des siècles prend fin, la lumière du jour exige ton éveil.`;

export const DEFAULT_TTS_DIRECTIVES = `Lis ce texte en français de France, comme une narration de livre audio de fantasy. Voix naturelle, posée et immersive. Débit légèrement lent, pauses souples entre les phrases, émotion retenue. Évite le ton publicitaire et la diction mécanique. Dans les dialogues, adapte subtilement l’intention du personnage. Respecte exactement le texte. Voix seule, sans musique ni bruitage.`;

export { VOICE_OPTIONS } from './voices';

export const MYSTIC_TTS_DIRECTIVES = "Interprète le texte en français de France comme une présence ancienne qui confie un secret oublié. Timbre naturel, intime, légèrement soufflé, sans forcer la gravité. Fais sentir le sacré, le froid et le mystère. Débit lent mais vivant ; varie doucement le rythme et laisse un silence après les images fortes et les révélations. Commence dans une retenue presque chuchotée, puis laisse grandir une tension discrète. Évite le chuchotement permanent, la monotonie et le ton de bande-annonce. Dans les dialogues, fais varier subtilement l’intention sans caricature. Respecte exactement le texte fourni, sans ajout ni omission. Ne lis pas ces consignes. Voix seule, sans musique, bruitage ni réverbération ajoutée.";

export const INITIAL_PARAGRAPHS: ParagraphSegment[] = [
  {
    id: 1,
    text: "Le monde naît dans un sifflement de givre — une odeur de métal froid et d'ozone brûlé, comme si l'air lui-même avait été forgé puis trempé trop vite.",
  },
  {
    id: 2,
    text: "La conscience revient comme une aiguille glacée enfoncée sous les tempes, balayant tout arrière-plan. Pas de douleur, pas de passé, aucune attache : tu es un canevas blanc sur un autel de pierre noire, et la pierre se souvient de ton poids avant même que tu ne te souviennes de toi.",
  },
  {
    id: 3,
    text: "Autour de toi, les vestiges d'une architecture cyclopéenne percent un ciel de cendre. La léthargie millénaire se fissure, tes muscles se délient sous une couche de glace en liquéfaction lente — un bruit de verre qui pleure.",
  },
  {
    id: 4,
    text: "Un seul écho persiste au centre du néant, ancré comme une obsession, comme la dernière page d'un livre qu'on aurait brûlé : Elenya.",
  },
  {
    id: 5,
    text: "Le sommeil des siècles prend fin, la lumière du jour exige ton éveil.",
  },
];
