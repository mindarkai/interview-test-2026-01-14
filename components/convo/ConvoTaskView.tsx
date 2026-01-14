import { ConvoTask } from "@convo-lang/convo-lang";
import { atDotCss } from "@iyio/at-dot-css";
import { BaseLayoutProps } from "@iyio/common";
import { ProgressBar, SlimButton, useSubject } from "@iyio/react-common";
import { useEffect, useState } from "react";
import { Loading } from "./Loading";

export interface ConvoTaskViewProps
{
    task:ConvoTask;
}

export function ConvoTaskView({
    task,
    ...props
}:ConvoTaskViewProps & BaseLayoutProps){

    const progress=useSubject(task.progress?.progressSubject);
    const status=useSubject(task.progress?.statusSubject);

    const delay=task.delayMs;
    const [ready,setReady]=useState(!delay);
    useEffect(()=>{
        if(!delay){
            return;
        }
        const iv=setTimeout(()=>{
            setReady(true);
        },delay);
        return ()=>{
            clearTimeout(iv);
        }
    },[delay]);

    if(!ready){
        return null;
    }

    return (
        <div className={style.root(null,null,props)}>
            <div className="flex flex-row items-center g2 opacity-75">
                {task.documentUrl?
                    <SlimButton openLinkInNewWindow to={task.documentUrl}>
                        <span className="text-sm underline">{task.name}</span>
                    </SlimButton>
                :
                    <span className="text-sm">{task.name}</span>
                }
                <Loading/>
            </div>
            {!!status && <span className="mt-2 text-sm">{status}</span>}
            {progress!==undefined && <ProgressBar className={style.bar()} mt025 value={progress} />}

        </div>
    )

}

const style=atDotCss({name:'ConvoTaskView',css:`
    @.root{
        display:flex;
        flex-direction:column;
    }
    @.bar{
        max-width:250px;
    }
`});
