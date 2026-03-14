import type { SpectrumCard } from "@/lib/types";

export const spectrumCards: SpectrumCard[] = [
  { id: "hot-cold", leftLabel: "Hot", rightLabel: "Cold", category: "Energy" },
  { id: "fancy-cheap", leftLabel: "Fancy", rightLabel: "Cheap", category: "Lifestyle" },
  { id: "serious-funny", leftLabel: "Serious", rightLabel: "Funny", category: "Mood" },
  { id: "chaotic-organized", leftLabel: "Chaotic", rightLabel: "Organized", category: "Personality" },
  { id: "cozy-adventurous", leftLabel: "Cozy", rightLabel: "Adventurous", category: "Vibe" },
  { id: "bold-subtle", leftLabel: "Bold", rightLabel: "Subtle", category: "Style" },
  { id: "clean-messy", leftLabel: "Clean", rightLabel: "Messy", category: "Everyday" },
  { id: "romantic-practical", leftLabel: "Romantic", rightLabel: "Practical", category: "Personality" },
  { id: "classic-modern", leftLabel: "Classic", rightLabel: "Modern", category: "Taste" },
  { id: "calm-intense", leftLabel: "Calm", rightLabel: "Intense", category: "Mood" },
  { id: "casual-formal", leftLabel: "Casual", rightLabel: "Formal", category: "Style" },
  { id: "spicy-mild", leftLabel: "Spicy", rightLabel: "Mild", category: "Food" },
  { id: "minimal-maximal", leftLabel: "Minimal", rightLabel: "Maximal", category: "Design" },
  { id: "grounded-dreamy", leftLabel: "Grounded", rightLabel: "Dreamy", category: "Vibe" },
  { id: "safe-risky", leftLabel: "Safe", rightLabel: "Risky", category: "Choices" },
  { id: "bright-moody", leftLabel: "Bright", rightLabel: "Moody", category: "Aesthetic" },
  { id: "playful-elegant", leftLabel: "Playful", rightLabel: "Elegant", category: "Tone" },
  { id: "smooth-crunchy", leftLabel: "Smooth", rightLabel: "Crunchy", category: "Texture" },
  { id: "humble-showy", leftLabel: "Humble", rightLabel: "Showy", category: "Persona" },
  { id: "fast-slow", leftLabel: "Fast", rightLabel: "Slow", category: "Tempo" },
  { id: "soft-sharp", leftLabel: "Soft", rightLabel: "Sharp", category: "Feel" },
  { id: "nostalgic-futuristic", leftLabel: "Nostalgic", rightLabel: "Futuristic", category: "Aesthetic" },
  { id: "sincere-ironic", leftLabel: "Sincere", rightLabel: "Ironic", category: "Tone" },
  { id: "wild-refined", leftLabel: "Wild", rightLabel: "Refined", category: "Taste" },
  { id: "sunrise-midnight", leftLabel: "Sunrise", rightLabel: "Midnight", category: "Mood" },
  { id: "homebody-social", leftLabel: "Homebody", rightLabel: "Social Butterfly", category: "Lifestyle" },
  { id: "vintage-sleek", leftLabel: "Vintage", rightLabel: "Sleek", category: "Style" },
  { id: "quiet-loud", leftLabel: "Quiet", rightLabel: "Loud", category: "Volume" },
  { id: "earthy-glam", leftLabel: "Earthy", rightLabel: "Glam", category: "Aesthetic" },
  { id: "improv-scripted", leftLabel: "Improv", rightLabel: "Scripted", category: "Performance" }
];

export function drawSpectrumCard(recentCardIds: string[]) {
  const availableCards = spectrumCards.filter((card) => !recentCardIds.includes(card.id));
  const pool = availableCards.length > 0 ? availableCards : spectrumCards;
  const selectedCard = pool[Math.floor(Math.random() * pool.length)];

  return {
    selectedCard,
    nextRecentCardIds: [selectedCard.id, ...recentCardIds].slice(0, 6),
  };
}
