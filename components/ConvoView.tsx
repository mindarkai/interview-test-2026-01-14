import { ConvoCtrl } from "@/lib/ConvoCtrl";
import { cn } from "@/lib/util";
import { ConversationView, ConversationViewProps } from "@convo-lang/convo-lang-react";
import { downloadText, getTimestampString } from "@iyio/common";
import { useSubject } from "@iyio/react-common";
import { AlertCircle, Bot, Copy, DownloadIcon, Loader2, Send, User as UserIcon } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { MessagesView } from "./convo/MessagesView";




export interface ConvoViewProps extends ConversationViewProps{
    /**
     * A conversation template in Convo-Lang format
     */
    template?: string;

    /**
     * Id of an echo to load. When loaded the user will be able to chat with the echo
     */
    echoId?: string;

    className?: string;

    chatSessionId?:string;

    accountId?:string;

    headerTitle?:string;

    headerSubtitle?:string;
}

export function ConvoView({
    template,
    echoId,
    className,
    chatSessionId,
    imports,
    accountId:accountIdProp,
    enableMarkdown=true,
    headerSubtitle="Ask anything",
    headerTitle="Conversation",
    ...props
}:ConvoViewProps){

    const inEchoMode = !!echoId;
    const mode: "interview" | "echo" = inEchoMode ? "echo" : "interview";

    const [ctrl,setCtrl]=useState<ConvoCtrl|null>(null);
    const currentTask=useSubject(ctrl?.uiCtrl.currentTaskSubject);
    const showSource=useSubject(ctrl?.uiCtrl.showSourceSubject);
    useEffect(()=>{
       
        let m=true;
        const ctrl=new ConvoCtrl({
            template,
            
        });
        setTimeout(()=>{
            if(!m){
                return;
            }
            setCtrl(ctrl);
            ctrl.initAsync();
        },10);
        return ()=>{
            m=false;
            ctrl.dispose();
        }
    },[template]);

    // State
    ///const [transcript, setTranscript] = useState<string>("");
    const [userMessage, setUserMessage] = useState<string>("");
    //const [isTyping, setIsTyping] = useState<boolean>(false);
    const isTyping=currentTask?true:false;
    const [saving, setSaving] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Internal flags
    const initializedRef = useRef(false);
    const [logRef,setLogRef]=useState<HTMLDivElement|null>(null);
    const [inputRef,setInputRef] = useState<HTMLTextAreaElement|null>(null);

    useAutoGrowTextArea(inputRef, userMessage);

    // Scroll to bottom whenever content changes
    // useEffect(() => {
    //     const el = logRef.current;
    //     if (!el) return;
    //     el.scrollTop = el.scrollHeight;
    // }, [transcript, isTyping]);

    //const messages = useMemo(() => parseConvo(transcript), [transcript]);

    

    

    const copyTranscript = useCallback(async () => {
        if(!ctrl){
            return;
        }
        try {
            await navigator.clipboard.writeText(ctrl.uiCtrl.convo?.convo || "");
            setError(null);
        } catch {
            setError("Unable to copy transcript");
        }
    }, [ctrl]);

    const exportTranscript = useCallback(async () => {
        if(!ctrl){
            return;
        }
        try {
            await downloadText(`${'convo'}-${getTimestampString()}.convo`,ctrl.uiCtrl.convo?.convo || "",'application/convo');
            setError(null);
        } catch {
            setError("Unable to copy transcript");
        }
    }, [ctrl]);

    const sendMessage=()=>{
        if(!ctrl || !userMessage.trim()){
            return;
        }
        setUserMessage('');
        ctrl.uiCtrl.appendUiMessageAsync(userMessage.trim());
    }

    // Keyboard handling
    const onKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
        if (e.key === "Escape") {
            (e.currentTarget as HTMLTextAreaElement).blur();
            return;
        }
        const isEnter = e.key === "Enter";
        const hasShift = e.shiftKey;
        const meta = e.metaKey || e.ctrlKey;

        if (isEnter && (!hasShift || meta)) {
            e.preventDefault();
            sendMessage();
            return;
        }
    };

    const headerAvatar = (() => {
        return (
            <div className="w-9 h-9 rounded-full thin-brand-border glass flex items-center justify-center">
                <Bot className="w-5 h-5 text-secondary" />
            </div>
        );
    })();

    return (
        <section className={cn("ConvoView stack-v glass p-4 sm:p-5 rounded", className)}>
            {/* Header */}
            <header className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    {headerAvatar}
                    <div className="min-w-0">
                        <div className="text-primary font-semibold truncate">{headerTitle}</div>
                        <div className="text-muted text-xs truncate">
                            {headerSubtitle}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        className="btn-ghost"
                        onClick={copyTranscript}
                        aria-label="Copy transcript"
                        title="Copy transcript"
                    >
                        <Copy className="w-4 h-4" />
                        <span className="hidden sm:inline">Copy</span>
                    </button>
                    <button
                        className="btn-ghost"
                        onClick={exportTranscript}
                        aria-label="Copy transcript"
                        title="Copy transcript"
                    >
                        <DownloadIcon className="w-4 h-4" />
                        <span className="hidden sm:inline">Export</span>
                    </button>
                </div>
            </header>

            {/* Error chip */}
            {error && (
                <div className="flex items-start gap-2 p-2 rounded border border-red-500/30 bg-red-500/10">
                    <AlertCircle className="w-4 h-4 text-red-400 mt-0.5" />
                    <div className="flex-1">
                        <div className="text-red-300 text-sm">{error}</div>
                    </div>
                </div>
            )}

            {/* Transcript */}
            <div
                ref={setLogRef}
                role="log"
                aria-live="polite"
                aria-relevant="additions"
                className={cn(
                    "flex-1 min-h-[280px] max-h-[55vh] flex flex-col p-2 rounded surface overflow-y-auto scrollbar-thin"
                )}
            >
                {ctrl?(
                    <>
                    <ConversationView
                        {...props}
                        enableMarkdown={enableMarkdown}
                        ctrl={ctrl.uiCtrl}
                        noInput
                        redirectMessagesView={showSource?undefined:emptyFn}
                        className={showSource?undefined:"hidden!"}
                        enabledInitMessage
                        enabledSlashCommands
                    />
                    {!showSource&&<MessagesView
                        autoHeight
                        enableMarkdown={enableMarkdown}
                        ctrl={ctrl.uiCtrl}
                        messageClassName="break-words p-3 rounded whitespace-pre-wrap"
                        assistantClassName="glass thin-brand-border"
                        userClassName="surface-glass"
                        userIconRender={()=>(
                            <div className="w-8 h-8 rounded-full glass flex items-center justify-center shrink-0">
                            <UserIcon className="w-4 h-4 text-secondary" />
                        </div>
                        )}
                        assistantIconRender={()=>(
                            <div className="w-8 h-8 rounded-full glass flex items-center justify-center shrink-0">
                            <Bot className="w-4 h-4 text-secondary" />
                        </div>
                        )}
                    />}
                    </>
                ):
                    null
                }

                
            </div>

            {/* Composer */}
            <div className="stack-v">
                <div className="flex items-end gap-2">
                    <label className="flex-1 stack-v w-full">
                        <span className="sr-only">Message</span>
                        <textarea
                            ref={setInputRef}
                            className="input w-full resize-none"
                            placeholder={
                                mode === "interview"
                                    ? "Type your knowledge—Shift+Enter for new line"
                                    : "Ask the Echo… Shift+Enter for new line"
                            }
                            value={userMessage}
                            onChange={(e) => setUserMessage(e.target.value)}
                            onKeyDown={onKeyDown}
                            aria-label="Message composer"
                            rows={1}
                            maxLength={4000}
                        />
                    </label>
                    <button
                        className="btn-primary"
                        onClick={sendMessage}
                        disabled={isTyping || saving || !userMessage.trim()}
                        aria-label="Send message"
                        title="Send"
                    >
                        {isTyping || saving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                        <span className="hidden sm:inline">Send</span>
                    </button>
                </div>

                {inEchoMode && (
                    <div className="text-muted text-xs">
                        Sessions are saved to your account for this Echo.
                        {saving && <span className="ml-2 inline-flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Saving…
                        </span>}
                    </div>
                )}
                {!inEchoMode && (
                    <div className="text-muted text-xs">
                        This interview capture is local to this step. You can continue and submit in the next step.
                    </div>
                )}
            </div>
        </section>
    );
}


function useAutoGrowTextArea(ref: HTMLTextAreaElement|null, value: string) {
    useEffect(() => {
        const el = ref;
        if (!el) return;
        el.style.height = "auto";
        el.style.height = Math.max(16,Math.min(el.scrollHeight, 220)) + "px";
    }, [ref, value]);
}

const emptyFn=()=>{}