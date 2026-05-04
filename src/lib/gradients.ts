export const gradients = [
  { key: 'pink-blue', label: 'Rosa → Azul', css: 'linear-gradient(135deg,#fbc2eb 0%,#a6c1ee 100%)' },
  { key: 'purple-teal', label: 'Morado → Turquesa', css: 'linear-gradient(135deg,#f6d365 0%,#fda085 100%)' },
  { key: 'sunset', label: 'Sunset', css: 'linear-gradient(135deg,#f093fb 0%,#f5576c 100%)' },
  { key: 'ocean', label: 'Ocean', css: 'linear-gradient(135deg,#a8edea 0%,#fed6e3 100%)' },
  { key: 'mint', label: 'Mint', css: 'linear-gradient(135deg,#c1f7d5 0%,#a1c4fd 100%)' },
];

export const getGradient = (key: string) => gradients.find(g => g.key === key)?.css || gradients[0].css;
