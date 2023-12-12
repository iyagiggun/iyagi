/* eslint-disable no-multi-assign */
/* eslint-disable no-param-reassign */

function hslToRgb(h, s, l) {
  h /= 360;
  s /= 100;
  l /= 100;

  let r; let g; let
    b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = function hue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

// RGB를 16진법 색상 문자열로 변환하는 함수
function rgbToHex(rgb) {
  return `#${rgb.map((component) => {
    const hex = component.toString(16);
    return hex.length === 1 ? `0${hex}` : hex;
  }).join('')}`;
}

function getRandomHexColorWithLimitedSaturation(maxSaturation) {
  // 랜덤한 Hue(색조) 값 생성 (0부터 360까지)
  const hue = Math.floor(Math.random() * 361);

  // 채도를 일정 수준으로 제한
  const saturation = Math.min(Math.random() * maxSaturation, 100);

  // 명도는 일정 수준으로 설정
  const lightness = 50;

  // HSL을 RGB로 변환
  const rgbColor = hslToRgb(hue, saturation, lightness);

  // RGB를 16진법 색상 문자열로 변환
  const hexColor = rgbToHex(rgbColor);

  return hexColor;
}

const ColorUtils = {
  getColorful: () => getRandomHexColorWithLimitedSaturation(80),
};

export default ColorUtils;
