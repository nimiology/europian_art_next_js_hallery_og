import Link from "next/link";
import Header from "@/components/Header";

export default function NotFound() {
  return (
    <>
      <div className="sticky"><Header /></div>
      <main className="centered">
        <p className="eyebrow">404</p>
        <h1 className="serif-msg">Nothing hangs on this wall.</h1>
        <p className="muted" style={{ margin: 0, fontSize: 14 }}>The page or artwork you&apos;re looking for isn&apos;t in the collection.</p>
        <Link href="/" className="btn btn-primary" style={{ marginTop: 6 }}>Browse the collection</Link>
      </main>
    </>
  );
}
