/**
 * Pakistan NADRA CNIC Visual Templates (SVG Data URIs)
 * Used as mock previews and visual placeholders for National Identity Cards.
 */

export function generateCnicSvg({
  name = 'PAKISTAN NATIONAL',
  cnic = '71501-1234567-1',
  dob = '01.01.1992',
  expiry = '01.01.2032',
  gender = 'M',
  isBack = false,
} = {}) {
  if (isBack) {
    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 315" width="100%" height="100%" style="font-family: Arial, Helvetica, sans-serif;">
  <defs>
    <linearGradient id="bgBack" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E8F5E9" />
      <stop offset="50%" stop-color="#C8E6C9" />
      <stop offset="100%" stop-color="#A5D6A7" />
    </linearGradient>
    <pattern id="guillocheBack" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 0 10 Q 5 0, 10 10 T 20 10" fill="none" stroke="#81C784" stroke-width="0.4" opacity="0.4" />
      <path d="M 0 10 Q 5 20, 10 10 T 20 10" fill="none" stroke="#66BB6A" stroke-width="0.4" opacity="0.4" />
    </pattern>
  </defs>

  <!-- Card Body -->
  <rect x="5" y="5" width="490" height="305" rx="16" fill="url(#bgBack)" stroke="#2E7D32" stroke-width="2" />
  <rect x="5" y="5" width="490" height="305" rx="16" fill="url(#guillocheBack)" />

  <!-- Top Strip -->
  <path d="M 5 21 C 5 12 12 5 21 5 L 479 5 C 488 5 495 12 495 21 L 495 40 L 5 40 Z" fill="#1B5E20" />
  <text x="250" y="26" text-anchor="middle" fill="#FFFFFF" font-size="12" font-weight="bold" letter-spacing="1.5">NATIONAL DATABASE AND REGISTRATION AUTHORITY</text>

  <!-- Content Box -->
  <rect x="25" y="55" width="450" height="135" rx="8" fill="#FFFFFF" fill-opacity="0.85" stroke="#81C784" stroke-width="1" />
  
  <text x="40" y="78" fill="#1B5E20" font-size="10" font-weight="bold">PRESENT ADDRESS / موجودہ پتہ :</text>
  <text x="40" y="98" fill="#263238" font-size="11">House 12, Street 4, Sector B-1, Jutial, Gilgit, Pakistan</text>

  <text x="40" y="125" fill="#1B5E20" font-size="10" font-weight="bold">PERMANENT ADDRESS / مستقل پتہ :</text>
  <text x="40" y="145" fill="#263238" font-size="11">District Gilgit, Gilgit-Baltistan, Pakistan</text>

  <text x="40" y="172" fill="#546E7A" font-size="10">FAMILY NO / خاندان نمبر :</text>
  <text x="170" y="172" fill="#263238" font-size="11" font-weight="bold">4102-9981-01</text>

  <!-- Barcode Simulation -->
  <g transform="translate(30, 205)">
    <rect x="0" y="0" width="300" height="42" fill="#FFFFFF" stroke="#CFD8DC" rx="4" />
    <g fill="#263238">
      <rect x="15" y="6" width="3" height="30"/>
      <rect x="21" y="6" width="2" height="30"/>
      <rect x="26" y="6" width="6" height="30"/>
      <rect x="35" y="6" width="2" height="30"/>
      <rect x="40" y="6" width="4" height="30"/>
      <rect x="47" y="6" width="2" height="30"/>
      <rect x="52" y="6" width="5" height="30"/>
      <rect x="60" y="6" width="2" height="30"/>
      <rect x="65" y="6" width="4" height="30"/>
      <rect x="73" y="6" width="3" height="30"/>
      <rect x="80" y="6" width="6" height="30"/>
      <rect x="90" y="6" width="2" height="30"/>
      <rect x="95" y="6" width="5" height="30"/>
      <rect x="104" y="6" width="3" height="30"/>
      <rect x="110" y="6" width="2" height="30"/>
      <rect x="115" y="6" width="6" height="30"/>
      <rect x="125" y="6" width="4" height="30"/>
      <rect x="132" y="6" width="2" height="30"/>
      <rect x="138" y="6" width="5" height="30"/>
      <rect x="147" y="6" width="3" height="30"/>
      <rect x="153" y="6" width="6" height="30"/>
      <rect x="163" y="6" width="2" height="30"/>
      <rect x="169" y="6" width="4" height="30"/>
      <rect x="176" y="6" width="3" height="30"/>
      <rect x="183" y="6" width="5" height="30"/>
      <rect x="192" y="6" width="2" height="30"/>
      <rect x="197" y="6" width="6" height="30"/>
      <rect x="207" y="6" width="4" height="30"/>
      <rect x="215" y="6" width="2" height="30"/>
      <rect x="221" y="6" width="5" height="30"/>
      <rect x="230" y="6" width="3" height="30"/>
      <rect x="236" y="6" width="6" height="30"/>
      <rect x="246" y="6" width="2" height="30"/>
      <rect x="252" y="6" width="4" height="30"/>
      <rect x="260" y="6" width="3" height="30"/>
      <rect x="267" y="6" width="5" height="30"/>
      <rect x="276" y="6" width="2" height="30"/>
    </g>
  </g>

  <!-- Bottom Official Stamp -->
  <text x="400" y="225" text-anchor="middle" fill="#1B5E20" font-size="10" font-weight="bold">REGISTRAR GENERAL</text>
  <path d="M 360 240 Q 400 230 440 245 T 420 255" fill="none" stroke="#2E7D32" stroke-width="1.5" />
  <text x="400" y="260" text-anchor="middle" fill="#546E7A" font-size="9">NADRA ISLAMABAD</text>

  <!-- Bottom MRZ lines -->
  <rect x="5" y="265" width="490" height="45" rx="4" fill="#1B5E20" fill-opacity="0.1" />
  <text x="25" y="284" fill="#37474F" font-size="10" font-family="Courier, monospace" letter-spacing="1">IDPAK${cnic.replace(/-/g, '')}&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</text>
  <text x="25" y="299" fill="#37474F" font-size="10" font-family="Courier, monospace" letter-spacing="1">${dob.replace(/\./g, '')}7M${expiry.replace(/\./g, '')}4PAK&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;8</text>
</svg>
    `.trim();
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  // Front Side
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 315" width="100%" height="100%" style="font-family: Arial, Helvetica, sans-serif;">
  <defs>
    <linearGradient id="bgFront" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E8F5E9" />
      <stop offset="50%" stop-color="#C8E6C9" />
      <stop offset="100%" stop-color="#A5D6A7" />
    </linearGradient>
    <pattern id="guilloche" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 0 10 Q 5 0, 10 10 T 20 10" fill="none" stroke="#81C784" stroke-width="0.4" opacity="0.4" />
      <path d="M 0 10 Q 5 20, 10 10 T 20 10" fill="none" stroke="#66BB6A" stroke-width="0.4" opacity="0.4" />
    </pattern>
  </defs>

  <!-- Card Body -->
  <rect x="5" y="5" width="490" height="305" rx="16" fill="url(#bgFront)" stroke="#2E7D32" stroke-width="2" />
  <rect x="5" y="5" width="490" height="305" rx="16" fill="url(#guilloche)" />

  <!-- Header Banner -->
  <path d="M 5 21 C 5 12 12 5 21 5 L 479 5 C 488 5 495 12 495 21 L 495 52 L 5 52 Z" fill="#1B5E20" />
  
  <!-- Pakistani Crescent & Star Symbol -->
  <g transform="translate(25, 12)">
    <circle cx="14" cy="14" r="12" fill="#FFFFFF" />
    <circle cx="17" cy="12" r="10.5" fill="#1B5E20" />
    <polygon points="18,10 20,15 15,12 21,12 16,15" fill="#FFFFFF" />
  </g>

  <text x="65" y="27" fill="#FFFFFF" font-size="13" font-weight="bold" letter-spacing="0.5">ISLAMIC REPUBLIC OF PAKISTAN</text>
  <text x="65" y="44" fill="#A5D6A7" font-size="10" font-weight="600">National Database and Registration Authority (NADRA)</text>
  <text x="475" y="32" text-anchor="end" fill="#FFFFFF" font-size="14" font-weight="bold">حکومت پاکستان</text>

  <!-- Smart Chip Simulation -->
  <g transform="translate(30, 75)">
    <rect x="0" y="0" width="52" height="42" rx="6" fill="#FBC02D" stroke="#D79B00" stroke-width="1.5" />
    <rect x="12" y="10" width="28" height="22" rx="3" fill="#FFE082" stroke="#F57F17" stroke-width="0.8" />
    <line x1="0" y1="21" x2="12" y2="21" stroke="#D79B00" stroke-width="1.5" />
    <line x1="40" y1="21" x2="52" y2="21" stroke="#D79B00" stroke-width="1.5" />
    <line x1="26" y1="0" x2="26" y2="10" stroke="#D79B00" stroke-width="1.5" />
    <line x1="26" y1="32" x2="26" y2="42" stroke="#D79B00" stroke-width="1.5" />
  </g>

  <!-- Photo Box -->
  <g transform="translate(30, 135)">
    <rect x="0" y="0" width="105" height="135" rx="8" fill="#ECEFF1" stroke="#2E7D32" stroke-width="1.5" />
    <!-- User Silhouette -->
    <circle cx="52.5" cy="50" r="28" fill="#90A4AE" />
    <path d="M 12 125 C 12 90, 93 90, 93 125 Z" fill="#607D8B" />
    <rect x="8" y="115" width="89" height="14" rx="4" fill="#2E7D32" fill-opacity="0.9" />
    <text x="52.5" y="125" text-anchor="middle" fill="#FFFFFF" font-size="8" font-weight="bold">VERIFIED HOLDER</text>
  </g>

  <!-- Details Content -->
  <g transform="translate(155, 75)">
    <text x="0" y="14" fill="#1B5E20" font-size="9" font-weight="bold">NAME / نام :</text>
    <text x="0" y="32" fill="#102A43" font-size="14" font-weight="bold">${name.toUpperCase()}</text>

    <text x="0" y="58" fill="#1B5E20" font-size="9" font-weight="bold">FATHER NAME / والد کا نام :</text>
    <text x="0" y="74" fill="#243B53" font-size="12" font-weight="600">GHULAM MOHAMMAD</text>

    <g transform="translate(0, 95)">
      <text x="0" y="0" fill="#1B5E20" font-size="9" font-weight="bold">GENDER / جنس :</text>
      <text x="0" y="16" fill="#243B53" font-size="11" font-weight="bold">${gender}</text>

      <text x="90" y="0" fill="#1B5E20" font-size="9" font-weight="bold">COUNTRY :</text>
      <text x="90" y="16" fill="#243B53" font-size="11" font-weight="bold">PAKISTAN</text>

      <text x="185" y="0" fill="#1B5E20" font-size="9" font-weight="bold">DATE OF BIRTH :</text>
      <text x="185" y="16" fill="#243B53" font-size="11" font-weight="bold">${dob}</text>
    </g>

    <!-- Identity Number Box -->
    <g transform="translate(0, 138)">
      <text x="0" y="0" fill="#1B5E20" font-size="9" font-weight="bold">IDENTITY NUMBER / شناختی کارڈ نمبر :</text>
      <rect x="0" y="8" width="315" height="32" rx="6" fill="#1B5E20" />
      <text x="157" y="30" text-anchor="middle" fill="#FFFFFF" font-size="16" font-weight="bold" letter-spacing="3">${cnic}</text>
    </g>

    <!-- Dates -->
    <g transform="translate(0, 198)">
      <text x="0" y="0" fill="#546E7A" font-size="9">DATE OF ISSUE :</text>
      <text x="0" y="14" fill="#263238" font-size="10" font-weight="bold">14.08.2021</text>

      <text x="160" y="0" fill="#546E7A" font-size="9">DATE OF EXPIRY :</text>
      <text x="160" y="14" fill="#2E7D32" font-size="10" font-weight="bold">${expiry}</text>
    </g>
  </g>
</svg>
  `.trim();
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const SAMPLE_CNIC_FRONT = generateCnicSvg({
  name: 'Hunza Heritage Homes',
  cnic: '71501-1928374-1',
  dob: '15.06.1988',
  expiry: '15.06.2031',
  isBack: false,
});

export const SAMPLE_CNIC_BACK = generateCnicSvg({
  cnic: '71501-1928374-1',
  dob: '15.06.1988',
  expiry: '15.06.2031',
  isBack: true,
});
