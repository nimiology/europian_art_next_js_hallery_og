import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Art of the moment",
  description: "One random artwork from 51,459 European paintings, sculptures and drawings. Press “Show me another” for the next.",
  alternates: { canonical: "/moment" },
  openGraph: { url: "/moment" },
};

export default function MomentLayout({ children }: { children: React.ReactNode }) {
  return children;
}
