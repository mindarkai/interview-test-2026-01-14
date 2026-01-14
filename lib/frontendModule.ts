import { convoCompletionService, convoRagService, HttpConvoCompletionService } from "@convo-lang/convo-lang";
//import { convoPdfDocReaderFactory } from "@convo-lang/convo-lang-pdf";
import { initRootScope, isServerSide, ScopeRegistration } from "@iyio/common";
//import { nextJsModule } from "@iyio/nextjs-common";

let inited=false;
export const initFrontend=()=>{
    if(inited){
        return;
    }
    inited=true;
    initRootScope(frontendModule);
}

export const frontendModule=(reg:ScopeRegistration)=>{

    if(isServerSide){
        return;
    }
    
    reg.implementService(convoCompletionService,scope=>HttpConvoCompletionService.fromScope(scope,'https://api.convo-lang.ai'));
    reg.implementService(convoRagService,scope=>HttpConvoCompletionService.fromScope(scope,'https://api.convo-lang.ai'));

}

