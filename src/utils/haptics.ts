// Simple haptic feedback utility for mobile web
export const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
  if ('vibrate' in navigator) {
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30]
    };
    navigator.vibrate(patterns[type]);
  }
};

// Button press haptic
export const buttonPress = () => triggerHaptic('light');

// Success action haptic
export const successHaptic = () => triggerHaptic('medium');

// Error action haptic  
export const errorHaptic = () => triggerHaptic('heavy');
