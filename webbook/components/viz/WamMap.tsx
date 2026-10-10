import { getRef } from "@/lib/refs";
import { WAM_MODELS } from "@/content/ch06/data";
import { WamMapClient, type MapEntry } from "./WamMapClient";

/** Figure 6.1 (server part): joins the model list with the reference collection. */
export function WamMap() {
  const entries: MapEntry[] = WAM_MODELS.map((m) => {
    const r = getRef(m.key);
    return { ...m, title: r.title, date: r.date, arxiv: r.arxiv, url: r.url };
  });
  return <WamMapClient entries={entries} />;
}
