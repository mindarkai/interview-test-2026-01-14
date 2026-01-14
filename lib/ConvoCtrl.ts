
import { ConversationOptions, ConversationUiCtrl } from "@convo-lang/convo-lang";
import { DisposeContainer, InternalOptions, ReadonlySubject } from "@iyio/common";
import { BehaviorSubject } from "rxjs";

const sep='\n> nop\n// ======== END SYSTEM ========'

export type ConvoCtrlState='loading'|'ready';

export interface ConvoCtrlOptions
{
    template?:string;
}

export class ConvoCtrl
{

    public readonly uiCtrl:ConversationUiCtrl;

    private readonly _state:BehaviorSubject<ConvoCtrlState>=new BehaviorSubject<ConvoCtrlState>('loading');
    public get stateSubject():ReadonlySubject<ConvoCtrlState>{return this._state}
    public get state(){return this._state.value}

    private readonly _saving:BehaviorSubject<boolean>=new BehaviorSubject<boolean>(false);
    public get savingSubject():ReadonlySubject<boolean>{return this._saving}
    public get saving(){return this._saving.value}

    private readonly _sessionId:BehaviorSubject<string|null>=new BehaviorSubject<string|null>(null);
    public get sessionIdSubject():ReadonlySubject<string|null>{return this._sessionId}
    public get sessionId(){return this._sessionId.value}

    private readonly options:InternalOptions<
        ConvoCtrlOptions,'template'
    >;

    public constructor({
        template,
    }:ConvoCtrlOptions){
        this.options={
            template,
        };
        this.uiCtrl=new ConversationUiCtrl({
            convoOptions:this.getConvoOptions(),
        });
    }

    public getConvoOptions():ConversationOptions
    {
        return {
            defaultModel:'us.anthropic.claude-3-7-sonnet-20250219-v1:0',
            //ragCallback:this.ragCallback,
        }
    }

    

    private _resetSession=0;
    public async resetSessionAsync()
    {
        this._resetSession++;
        try{
            await this.loadAsync();
        }finally{
            this._resetSession--;
        }
    }

    public async initAsync(){

        if(this.isDisposed){
            return;
        }
        // load echo or chat session if needed
        await this.loadAsync();

        this._state.next('ready');
    }

    public async loadAsync()
    {;
        
        if(this.options.template){
            this.uiCtrl.template=this.options.template;
        }
        this.uiCtrl.clear();
    }

    private readonly disposables=new DisposeContainer();
    private _isDisposed=false;
    public get isDisposed(){return this._isDisposed}
    public dispose()
    {
        if(this._isDisposed){
            return;
        }
        this._isDisposed=true;
        this.disposables.dispose();
        this.uiCtrl.dispose();
    }
}