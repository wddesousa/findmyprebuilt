import React from "react";

export default function Section({ bg, children }: { bg: "w" | "g", children: React.ReactNode }) {
  const bgClass = bg === "w" ? "bg-white" : "bg-gray-100";
    return (
    <section className={bgClass}>
      <div className="m-auto w-11/12 max-w-screen-xl">{children}</div>
    </section>
  );
}
