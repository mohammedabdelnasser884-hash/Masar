import React, { useState, useEffect, useRef } from "react";
import { Cpu, Send, AlertTriangle, Play, RefreshCw, Loader2 } from "lucide-react";

interface BotDashboardProps {
  language: "ar" | "en";
  t: any;
}

export const BotDashboard: React.FC<BotDashboardProps> = ({ language, t }) => {
  const isRtl = language === "ar";
  
  // Real server states
  const [botStatus, setBotStatus] = useState<any>({ activeToken: false, logs: [], subscriptionsCount: 0 });
  const [loading, setLoading] = useState(false);
  const [broadcastLoading, setBroadcastLoading] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState("");

  // Sandbox Tester Chat states
  const [chatMessages, setChatMessages] = useState<any[]>([
    { id: "wel", sender: "bot", text: "أهلاً بك في محاكي بوت تليجرام الافتراضي! اكتب موجهك أو جرب الأزرار أدناه لرؤية رد البوت الفعلي." }
  ]);
  const [userText, setUserText] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const fetchBotStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/telegram/status");
      const data = await res.json();
      if (data.success) {
        setBotStatus({
          activeToken: data.activeToken,
          logs: data.logs || [],
          subscriptionsCount: data.subscriptionsCount || 0
        });
      }
    } catch (err) {
      console.error("Failed to load Telegram status", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBotStatus();
    const interval = setInterval(fetchBotStatus, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const sendTerminalTester = async (cmdText: string) => {
    if (!cmdText.trim()) return;
    
    // Add user message locally
    const userMsgId = `usr-${Date.now()}`;
    setChatMessages((prev) => [...prev, { id: userMsgId, sender: "user", text: cmdText }]);
    setUserText("");

    try {
      const res = await fetch("/api/telegram/test-command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: cmdText, username: "مرشح" })
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.replies)) {
        // Add all replies sequentially
        data.replies.forEach((reply: string, i: number) => {
          setTimeout(() => {
            setChatMessages((prev) => [
              ...prev,
              { id: `bot-${Date.now()}-${i}`, sender: "bot", text: reply }
            ]);
          }, i * 300);
        });
        
        // Refresh server logs logs instantly
        setTimeout(fetchBotStatus, 1500);
      }
    } catch (err) {
      setChatMessages((prev) => [...prev, { id: `err-${Date.now()}`, sender: "bot", text: "❌ فشل الاتصال بالخادم الداخلي لتجربة المحاكاة." }]);
    }
  };

  const handleTriggerBroadcast = async () => {
    setBroadcastLoading(true);
    setBroadcastResult("");
    try {
      const res = await fetch("/api/telegram/trigger-broadcast", { method: "POST" });
      const data = await res.json();
      if (data.success && data.stats) {
        if (data.stats.skipped) {
          setBroadcastResult(isRtl ? "⚠️ تخطي البث: لا يوجد مشتركون مسجلون بالخادم حالياً لتلقي الفرز." : "⚠️ Skipped: No active subscriber channels registered on server.");
        } else {
          setBroadcastResult(isRtl ? `📢 بث ناجح! تم إرسال أفضل وظائف تليجرام للمشتركين.` : `📢 Broadcast completed successfully to subscriber channels.`);
        }
        fetchBotStatus();
      }
    } catch (err) {
      setBroadcastResult("❌ Failed triggering broadcast tasks.");
    } finally {
      setBroadcastLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuration status box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 text-white">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600/20 text-indigo-400 p-2.5 rounded-xl shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-md font-extrabold">{t.botHeader}</h3>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <span>{t.botStatus}</span>
              <strong className={botStatus.activeToken ? "text-emerald-400" : "text-amber-400 font-normal"}>
                {botStatus.activeToken ? t.botOnline : t.botOffline}
              </strong>
            </p>
          </div>
        </div>

        <button
          onClick={fetchBotStatus}
          className="bg-slate-800 hover:bg-slate-750 p-2 rounded-xl border border-slate-700 transition"
        >
          <RefreshCw className="w-4 h-4 text-slate-300" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: INTERACTIVE TELEGRAM CLIENT SANDBOX */}
        <div className="md:col-span-7 bg-slate-950 border border-slate-900 shadow-xl rounded-2xl overflow-hidden flex flex-col h-[550px] text-slate-100">
          {/* Mock App Header */}
          <div className="bg-slate-900 p-4 border-b border-slate-850 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></div>
              <span className="text-xs font-bold font-mono tracking-wider">MOCK TELEGRAM CONSOLE v1.2</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Channel: ID 555777</span>
          </div>

          {/* Sandbox Chat view port */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-none font-sans flex flex-col">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs font-sans whitespace-pre-line leading-relaxed ${
                  msg.sender === "bot"
                    ? "bg-slate-900 text-slate-100 self-start rounded-tl-none border border-slate-850"
                    : "bg-indigo-600 text-white self-end rounded-tr-none"
                }`}
              >
                {msg.text.replace(/<[^>]+>/g, "").replace(/&#[0-9]+;/g, "")}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Tester Command quick tags */}
          <div className="px-4 py-2 border-t border-slate-900 bg-slate-950 flex flex-wrap gap-1.5">
            <button
              onClick={() => sendTerminalTester("/start")}
              className="text-[10px] bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded px-2 py-1 text-slate-300 transition cursor-pointer"
            >
              {t.botCmdStart}
            </button>
            <button
              onClick={() => sendTerminalTester("/search شغلانة جدة")}
              className="text-[10px] bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded px-2 py-1 text-slate-300 transition cursor-pointer"
            >
              /search شغلانة جدة
            </button>
            <button
              onClick={() => sendTerminalTester("/search محاسب قطر")}
              className="text-[10px] bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded px-2 py-1 text-slate-300 transition cursor-pointer"
            >
              /search محاسب قطر
            </button>
            <button
              onClick={() => sendTerminalTester("/cv")}
              className="text-[10px] bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded px-2 py-1 text-slate-300 transition cursor-pointer"
            >
              {t.botCmdCv}
            </button>
          </div>

          {/* Mock Console Chat footer */}
          <div className="p-3 bg-slate-900 border-t border-slate-850 flex gap-2">
            <input
              type="text"
              value={userText}
              onChange={(e) => setUserText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendTerminalTester(userText)}
              placeholder={t.botTesterPlaceholder}
              className="flex-1 bg-slate-950 text-xs text-slate-100 outline-none border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2.5 font-sans"
            />
            <button
              onClick={() => sendTerminalTester(userText)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold p-2.5 rounded-xl transition cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>


        {/* RIGHT COLUMN: LIVESTREAM STATUS LOGS & BROADCAST BUTTONS */}
        <div className="md:col-span-5 flex flex-col gap-6">
          
          {/* Broadcast Trigger Board */}
          <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b pb-2">
              📢 {isRtl ? "شحن ونشر الإعلانات اليومية" : "Subscribers newsletters broadcast"}
            </h4>

            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg text-xs">
              <span className="font-medium text-slate-600">{t.botSubsCount}</span>
              <strong className="text-slate-900 font-mono text-sm">{botStatus.subscriptionsCount}</strong>
            </div>

            {broadcastResult && (
              <div className="bg-slate-50 border p-3 rounded-lg text-xs text-indigo-700 font-semibold text-center">
                {broadcastResult}
              </div>
            )}

            <button
              onClick={handleTriggerBroadcast}
              disabled={broadcastLoading}
              className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {broadcastLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{isRtl ? "جاري البث..." : "Broadcasting..."}</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>{t.botTriggerDaily}</span>
                </>
              )}
            </button>
          </div>


          {/* Bot Log History console */}
          <div className="bg-slate-950 border border-slate-900 rounded-2xl p-5 flex-1 flex flex-col min-h-[250px]">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono border-b border-slate-900 pb-2 flex justify-between items-center">
              <span>{t.botLogsTitle}</span>
              <span className="text-[9px] bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded font-mono">SSE ACTIVE</span>
            </h4>

            {/* Logs stream */}
            <div className="flex-1 overflow-y-auto pt-3 font-mono text-[10px] space-y-2.5 max-h-[220px]">
              {botStatus.logs.length === 0 ? (
                <p className="text-slate-600 italic text-center text-[9px] pt-8">
                  {isRtl ? "[البوت جاهز وبانتظار موجهات الأوامر]" : "[Active. Awaiting incoming commands]"}
                </p>
              ) : (
                botStatus.logs.map((log: any, idx: number) => (
                  <div key={idx} className="flex gap-2 leading-relaxed">
                    <span className="text-slate-500 font-mono shrink-0 select-none">[{log.timestamp}]</span>
                    <span
                      className={`${
                        log.type === "error"
                          ? "text-red-400"
                          : log.type === "success"
                          ? "text-emerald-400"
                          : log.type === "command"
                          ? "text-indigo-400"
                          : "text-slate-350"
                      }`}
                    >
                      {log.message}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
