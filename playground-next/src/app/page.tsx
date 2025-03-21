"use client";

import { useCookieConsent } from "../../../dist";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold">Cookie Consent Playground</h1>
      <Link
        href="/ssr-example"
        className="mt-8 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        View SSR Example Page
      </Link>
    </main>
  );
}
