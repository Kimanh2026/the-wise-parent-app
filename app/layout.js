import "./globals.css";
import Providers from "@/components/Providers";

export const metadata = {
  title: "The Wise Parent — by Mind Peace Stories",
  description: "AI Parenting Companion for ages 3–15. Ancient wisdom, modern science, one small action a day.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          // set theme before paint to avoid flash
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem('wp_theme')==='dark')document.documentElement.classList.add('dark')}catch(e){}`,
          }}
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
