import { DocsShell } from "@/components/shell/DocsShell";

export default function ChaptersLayout({ children }: { children: React.ReactNode }) {
  return <DocsShell>{children}</DocsShell>;
}
