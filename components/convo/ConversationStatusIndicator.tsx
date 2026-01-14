import { Conversation, ConversationUiCtrl } from "@convo-lang/convo-lang";
import { useSubject } from "@iyio/react-common";
import { Bot } from "lucide-react";
import { ConvoTaskView } from "./ConvoTaskView";

export interface ConversationStatusIndicatorProps
{
    uiCtrl?:ConversationUiCtrl|null;
    conversation?:Conversation|null;
    busy?:boolean;
    loadingIndicator?:any;
    convoTaskViewClassName?:string;
}

export function ConversationStatusIndicator({
    uiCtrl,
    conversation,
    busy,
    loadingIndicator,
    convoTaskViewClassName,
}:ConversationStatusIndicatorProps){

    const uiConvo=useSubject(uiCtrl?.convoSubject);
    const currentTask=useSubject(uiCtrl?.currentTaskSubject);

    conversation=conversation??uiConvo;

    const convoTasks=useSubject(conversation?.openTasksSubject);

    return (<>{
        convoTasks?.length?
            convoTasks.map((t,i)=><ConvoTaskView mt05={i!==0} className={convoTaskViewClassName} key={i} task={t} />)
        :(currentTask || busy)?
            (loadingIndicator??(
                <div className="flex items-start gap-2">
                    <div className="w-8 h-8 rounded-full glass flex items-center justify-center shrink-0">
                        <Bot className="w-4 h-4 text-secondary" />
                    </div>
                    <div className="glass thin-brand-border p-3 rounded inline-flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full shimmer-surface animate-shimmer"></span>
                        <span className="w-2 h-2 rounded-full shimmer-surface animate-shimmer"></span>
                        <span className="w-2 h-2 rounded-full shimmer-surface animate-shimmer"></span>
                    </div>
                </div>
            ))
        :
            null

    }</>)

}
