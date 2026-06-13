/**
 * Maps an asteroid's maximum estimated diameter (meters) to a relatable
 * real-world object, for the "about the size of..." framing used
 * throughout the UI.
 */
const SIZE_REFS = [
  { max: 5, label: 'a car', emoji: '\u{1F697}' },
  { max: 15, label: 'a school bus', emoji: '\u{1F68C}' },
  { max: 50, label: 'a football field', emoji: '\u{1F3DF}\uFE0F' },
  { max: 150, label: 'the Statue of Liberty', emoji: '\u{1F5FD}' },
  { max: 300, label: 'the Eiffel Tower', emoji: '\u{1F5FC}' },
  { max: Infinity, label: 'the Burj Khalifa', emoji: '\u{1F3D9}\uFE0F' },
];

export function sizeLabel(diameterMax) {
  return SIZE_REFS.find((ref) => diameterMax <= ref.max);
}

/**
 * Approximate heights/lengths (meters) for the reference objects above,
 * used to draw the size-comparison bars in the detail view.
 */
export const SIZE_REFERENCE_HEIGHTS = {
  'a car': 1.6,
  'a school bus': 3.2,
  'a football field': 110,
  'the Statue of Liberty': 93,
  'the Eiffel Tower': 330,
  'the Burj Khalifa': 828,
};

export function formatMeters(value) {
  if (value >= 1000) return `${(value / 1000).toFixed(1)} km`;
  return `${Math.round(value)} m`;
}
