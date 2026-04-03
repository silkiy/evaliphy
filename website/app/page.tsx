"use client";

import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-24 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto w-full">
        <div className="flex flex-col items-center text-center space-y-8">
          <div className="inline-flex items-center rounded-full border border-zinc-100 bg-zinc-50 px-3 py-1 text-sm font-medium text-zinc-600">
            🚀 Evaliphy Beta is now live
            <Link
              href="/docs/introduction"
              className="ml-1 text-zinc-900 hover:underline"
            >
              Read the docs
            </Link>
          </div>

          <div className="space-y-4 max-w-4xl">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-zinc-900">
              Evaliphy enables QAs to test RAG pipelines with simplicity. <br className="hidden md:block" />

            </h1>
            <p className="text-xl text-zinc-600 leading-relaxed max-w-3xl mx-auto">
              Evaliphy is an evaluation SDK built for QA engineers — not ML
              researchers, not AI specialists. If you've written end-to-end
              tests before, picking this up will feel familiar. Built-in judges,
              real API testing, and CI-ready reports. No ML background needed,
              no prompt wrangling, no glue code.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() =>
                navigator.clipboard.writeText("npm install evaliphy")
              }
              className="group relative px-8 py-3 bg-zinc-900 text-white rounded-lg font-mono text-sm hover:bg-zinc-800 transition-colors flex items-center gap-2"
            >
              npm install -g evaliphy
              <svg
                className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                />
              </svg>
            </button>
            <Link
              href="/docs/introduction"
              className="px-8 py-3 border border-zinc-200 text-zinc-900 rounded-lg font-medium hover:bg-zinc-50 transition-colors"
            >
              Read the Docs
            </Link>
          </div>
        </div>

        {/* Code & Image Section */}
        <div className="mt-32 flex flex-col items-center space-y-16">
          <div className="text-center space-y-4 max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900">
              If you can write a test, you can evaluate AI. It is as simple as writing Playwright for UI test.
            </h2>
            <p className="text-lg text-zinc-600">
              Stop fighting with Python notebooks, complex ML metrics, and
              brittle API calls. Evaliphy gives you a fluent, type-safe API to
              test RAG pipelines as black boxes.
            </p>
          </div>

          <div className="w-full max-w-4xl space-y-12">
            {/* Code Block */}
            <div className="rounded-xl bg-white p-1 shadow-xl border border-zinc-200 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2 border-b border-zinc-100 bg-zinc-50/50">
                <div className="w-3 h-3 rounded-full bg-zinc-200" />
                <div className="w-3 h-3 rounded-full bg-zinc-200" />
                <div className="w-3 h-3 rounded-full bg-zinc-200" />
                <span className="ml-2 text-xs font-mono text-zinc-400">
                  return-policy.eval.ts
                </span>
              </div>
              <pre className="p-6 overflow-x-auto text-sm font-mono leading-relaxed text-zinc-800 bg-white">
                <code>
                  <span className="text-indigo-600">import</span>{" "}
                  {"{ evaluate, expect } "}{" "}
                  <span className="text-indigo-600">from</span>{" "}
                  <span className="text-emerald-600">'evaliphy'</span>;{"\n\n"}
                  <span className="text-indigo-600">const</span> sample ={" "}
                  {"{\n"}
                  {"  query: "}{" "}
                  <span className="text-emerald-600">
                    "What is the return policy?"
                  </span>
                  ,{"\n"}
                  {"  expectedContext: "}{" "}
                  <span className="text-emerald-600">
                    "Items can be returned within 30 days."
                  </span>
                  {"\n"}
                  {"};\n\n"}
                  <span className="text-indigo-600">evaluate</span>(
                  <span className="text-emerald-600">"Return Policy Chat"</span>
                  , <span className="text-indigo-600">async</span> (
                  {"{ httpClient }"}) ={">"} {"{\n"}
                  {"  // 1. Hit your RAG endpoint\n"}
                  {"  "} <span className="text-indigo-600">const</span> res ={" "}
                  <span className="text-indigo-600">await</span> httpClient.
                  <span className="text-indigo-600">post</span>(
                  <span className="text-emerald-600">'/api/chat'</span>,{" "}
                  {"{ message: sample.query }"});{"\n"}
                  {"  "} <span className="text-indigo-600">const</span> data ={" "}
                  <span className="text-indigo-600">await</span> res.
                  <span className="text-indigo-600">json</span>();{"\n\n"}
                  {"  // 2. Assert in plain English\n"}
                  {"  "} <span className="text-indigo-600">await</span>{" "}
                  <span className="text-indigo-600">expect</span>({"{"}
                  {"\n"}
                  {"    query: sample.query,\n"}
                  {"    response: data.answer,\n"}
                  {"    context: data.retrieved_chunks\n"}
                  {"  "}
                  {"}"}).<span className="text-indigo-600">toBeFaithful</span>
                  ();{"\n"}
                  {"  "} <span className="text-indigo-600">await</span>{" "}
                  <span className="text-indigo-600">expect</span>(data.answer).
                  <span className="text-indigo-600">toBeRelevant</span>();{"\n"}
                  {"}"});
                </code>
              </pre>
            </div>

            {/* Image */}
            <div className="group relative rounded-2xl border border-zinc-200 bg-zinc-50 p-2 overflow-hidden shadow-2xl transition-all hover:shadow-zinc-200/50">
              <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-white/90 backdrop-blur rounded-full text-xs font-medium text-zinc-500 border border-zinc-100 shadow-sm">
                Evaluation Report
              </div>
              <Image
                src="/images/report.png"
                alt="Evaliphy Report Screenshot"
                loading="eager"
                width={1200}
                height={800}
                className="rounded-xl object-cover w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-zinc-50/50 border-y border-zinc-100">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900">
              Built for Quality Engineers, not Data Scientists.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <div className="w-10 h-10 bg-white rounded-lg border border-zinc-100 flex items-center justify-center shadow-sm">
                <svg
                  className="w-5 h-5 text-zinc-900"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-zinc-900">
                Understandable Metrics
              </h3>
              <p className="text-zinc-600 leading-relaxed">
                Forget "Contextual Precision" and "Cosine Similarity." Assert
                against what actually matters:
                <code className="mx-1 text-zinc-900 font-mono text-sm">
                  toBeFaithful()
                </code>
                ,
                <code className="mx-1 text-zinc-900 font-mono text-sm">
                  toBeRelevant()
                </code>
                , and
                <code className="mx-1 text-zinc-900 font-mono text-sm">
                  toBeGrounded()
                </code>
                .
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-10 h-10 bg-white rounded-lg border border-zinc-100 flex items-center justify-center shadow-sm">
                <svg
                  className="w-5 h-5 text-zinc-900"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-zinc-900">
                Explicit, Traceable Data Flow
              </h3>
              <p className="text-zinc-600 leading-relaxed">
                No magic background context. Pass your golden data, CSV rows, or
                database records directly into the assertions so you always know
                exactly what is being tested.
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-10 h-10 bg-white rounded-lg border border-zinc-100 flex items-center justify-center shadow-sm">
                <svg
                  className="w-5 h-5 text-zinc-900"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-zinc-900">
                Battle-Tested Prompts
              </h3>
              <p className="text-zinc-600 leading-relaxed">
                We spent hundreds of hours benchmarking LLM-as-a-judge prompts
                so you don't have to. Just provide your API key, and Evaliphy
                handles the prompting, parsing, and retry logic.
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-10 h-10 bg-white rounded-lg border border-zinc-100 flex items-center justify-center shadow-sm">
                <svg
                  className="w-5 h-5 text-zinc-900"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-zinc-900">
                Runs Where You Run
              </h3>
              <p className="text-zinc-600 leading-relaxed">
                It’s just Node.js. Run your RAG evaluations in GitHub Actions,
                GitLab CI, or Jenkins using the standard
                <code className="mx-1 text-zinc-900 font-mono text-sm">
                  npx evaliphy run
                </code>{" "}
                command.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture Section */}
      <section className="py-24 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto w-full">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-900">
            Two-Phase Architecture. Infinite Reliability.
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="text-4xl font-bold text-zinc-100">01</div>
            <h3 className="text-xl font-semibold text-zinc-900">
              Configure Once
            </h3>
            <p className="text-zinc-600">
              Set your LLM judge models (e.g.,{" "}
              <code className="text-sm">gpt-4o-mini</code>) and confidence
              thresholds globally in{" "}
              <code className="text-sm">evaliphy.config.ts</code>.
            </p>
          </div>
          <div className="space-y-4">
            <div className="text-4xl font-bold text-zinc-100">02</div>
            <h3 className="text-xl font-semibold text-zinc-900">
              Collect & Execute
            </h3>
            <p className="text-zinc-600">
              Evaliphy builds a deterministic test tree, then executes your HTTP
              calls and RAG pipelines in parallel.
            </p>
          </div>
          <div className="space-y-4">
            <div className="text-4xl font-bold text-zinc-100">03</div>
            <h3 className="text-xl font-semibold text-zinc-900">
              Evaluate & Report
            </h3>
            <p className="text-zinc-600">
              The built-in LLM judge evaluates the responses against your
              assertions and returns human-readable failure reasons.
            </p>
          </div>
        </div>
      </section>

      {/* Beta Section */}
      <section className="py-24 bg-zinc-900 text-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl font-bold">Join the Beta Program</h2>
              <p className="text-zinc-400 text-lg">
                We are currently in open beta. We’re looking for QA teams and
                software engineers building RAG applications to help us refine
                the API and expand our matcher library.
              </p>
              <ul className="space-y-4">
                {[
                  "Free for commercial use during Beta",
                  "Direct access to the core engineering team",
                  "Influence the v1.0 roadmap",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <svg
                      className="w-5 h-5 text-zinc-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="flex gap-4">
                <a
                  href="https://github.com/priyanshus/evaliphy"
                  className="px-8 py-3 bg-white text-zinc-900 rounded-lg font-medium hover:bg-zinc-100 transition-colors"
                >
                  Star on GitHub
                </a>
                <button className="px-8 py-3 border border-zinc-700 text-white rounded-lg font-medium hover:bg-zinc-800 transition-colors">
                  Join the Discord
                </button>
              </div>
            </div>
            <div className="bg-zinc-800/50 rounded-2xl p-8 border border-zinc-700">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">
                  Ready to test your RAG pipeline?
                </h3>
                <p className="text-zinc-400">
                  Start evaluating your AI in under 5 minutes.
                </p>
                <div className="bg-black rounded-lg p-4 font-mono text-sm text-zinc-300 space-y-2">
                  <div className="flex gap-2">
                    <span className="text-zinc-500">$</span>
                    <span>npm install -g evaliphy</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-zinc-500">$</span>
                    <span>npx evaliphy init</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
