"use client";

export default function PageContainer({ children, className = "" }) {
  return (
    <div className={`mx-auto max-w-7xl space-y-6 p-6 ${className}`.trim()}>
      {children}
    </div>
  );
}
