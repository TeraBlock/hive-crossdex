import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
    fontFamily: {
      primary: ["Lato"],
      secondary: ["Poppins"],
      inter: ["Inter"],
    },
    animation: {
      spin: "spin 2s linear infinite", // This is the default animation-spin class provided by Tailwind
      slow: "spin 4s linear infinite", // Custom slow animation class
    },
    screens: {
      xxs: "320px",
      xs: "360px",
      tab: "665px",
      lappy: "850px",
      tabletMax: { max: "854px" },
      iPadPro: { max: "954px" },
      ipadProMax: { max: "950px" },
      mobileCheck: { max: "490px" },
      "macbook-m2": { max: "1319px" },
      "tabletcheck-md": { max: "503px" },
      mediumDeviceCheck: { max: "685px" },
      "lappy-md": { max: "800px" },
      "laptol-lg": { max: "1461px" },
      tabletCheck: "834px",
      tabletRange: { min: "834px", max: "1040px" },
      laptopRange: { min: "1040px", max: "1320px" },
      laptopLarge: { max: "1670px" },
      desktopCheck: { max: "1320px" },
      desktopRange: { min: "1320px", max: "1550px" },
      desktop: { max: "1880px" },
      "desktop-large": { max: "1464px" },
      "macbook-ultra": { max: "1414px" },
      "desktop-xs": { max: "1560px" },
      "desktop-lg": "1693px",
      "desktop-md": { max: "1688px" },
      "desktop-sm": { max: "1600px" },
      "tablet-xl": { max: "1206px" },
      laptop: { max: "1252px" },
      "laptop-lg": { max: "1692px" },
      "laptop-md": { max: "1440px" },
      "laptop-sm": { max: "1300px" },
      macCheck: { max: "1334px" },
      "tablet-medium": { max: "1030px" },
      "tablet-extralarge": { max: "1030px" },
      "tablet-small": { max: "900px" },
      "tablet-xxs": { max: "890px" },
      "tablet-lg": { max: "1024px" },
      "tablet-md": { max: "882px" },
      "tablet-sm": { max: "820px" },
      tablet: { max: "834px" },
      "tablet-large": { max: "950px" },
      tabletSmall: { max: "580px" },
      "tablet-xs": { max: "552px" },
      "medium-device": { max: "790px" },
      mobile: { max: "650px" },
      "mobile-max-md": { max: "640px" },
      "mobile-md": { max: "429px" },
      "mobile-lg": { max: "438px" },
      "mobile-min-md": { min: "430px" },
      "mobile-sm": { max: "375px" },
      "mobile-xs": { max: "358px" },
      "macbook-air": { max: "1360px" },
      "macbook-pro": { max: "1150px" },
    },
    boxShadow: {
      "3xl": "1px 2px 40px 0px rgba(0, 0, 0, 0.08)",
      "2xl": "2px 2px 20px 0px #0052FF24",
      "1xl": "2px 2px 16px 0px rgba(55, 91, 210, 0.19)",
      xl: "0px 2px 8px 0px rgba(0, 0, 0, 0.04)",
      "4xl": "0px -2px 32px 0px rgba(0, 0, 0, 0.12)",
      "5xl": "2px 2px 12px 0px rgba(0, 0, 0, 0.08)",
      "6xl": "0px 4px 40px rgba(0, 0, 0, 0.25)",
    },
  },
  variants: {
    fill: ["hover", "focus"], // this line does the trick
  },
  plugins: [],
}
export default config

