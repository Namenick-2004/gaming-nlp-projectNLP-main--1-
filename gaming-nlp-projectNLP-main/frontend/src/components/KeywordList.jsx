import { Heart } from "lucide-react";
import AnalysisPanel from "./AnalysisPanel.jsx";

export default function KeywordList({ comments = [], language = "th" }) {
  const en = language === "en";
  const items = [...comments].sort((a, b) => b.like_count - a.like_count).slice(0, 10);
  return <AnalysisPanel title={en ? "Top comments" : "ความคิดเห็นยอดนิยม"} subtitle={en ? "The 10 most-liked comments on this video" : "10 ความคิดเห็นที่ได้รับการกดถูกใจมากที่สุด"} badge={en ? "Top 10" : "10 อันดับ"}>
    {items.length ? <ol className="divide-y divide-slate-100">{items.map((item, index) => <li key={item.id || `${item.text}-${index}`} className="flex items-start gap-3 py-3.5 first:pt-0">
      <span className="w-6 shrink-0 text-xs font-semibold tabular-nums text-slate-400">{String(index + 1).padStart(2, "0")}</span>
      <div className="min-w-0 flex-1"><p className="break-words text-sm leading-6 text-slate-800">{item.text}</p><p className="mt-1 truncate text-xs text-slate-500">{item.author || (en ? "YouTube viewer" : "ผู้ชม YouTube")}</p></div>
      <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-rose-50 px-2.5 py-1 text-sm font-semibold tabular-nums text-rose-600"><Heart size={13} fill="currentColor" />{Number(item.like_count || 0).toLocaleString()}</span>
    </li>)}</ol> : <p className="py-12 text-center text-sm text-slate-500">{en ? "No comments yet" : "ยังไม่มีความคิดเห็น"}</p>}
  </AnalysisPanel>;
}
