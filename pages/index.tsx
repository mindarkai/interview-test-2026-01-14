import { ConvoView } from "@/components/ConvoView";
import { supClient } from "@/lib/supabase";
import { Mail, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export default function IndexPage()
{

    const [value,setValue]=useState<any>(null);
    useEffect(()=>{
        (async ()=>{
            const r=await supClient().from('kv_store').select('*').limit(1);
            setValue(r.data);
        })();
    },[]);

    const insertExample=useCallback(()=>{
        supClient().from('kv_store').insert({
            
        })
    },[]);

    return (
        <div>
            <section id="request-demo" className="px-6 pt-16">
                <div className="max-w-6xl mx-auto w-full">
                    <div className="glass backdrop-blur-lg rounded p-8 md:p-10 stack-v items-center text-center thin-brand-border">
                        <h3 className="text-hero text-[clamp(28px,4vw,48px)] font-extrabold tracking-tight">
                            The company that remembers, wins.
                        </h3>
                        <p className="text-subtitle max-w-2xl">
                            Echo capture. AI guidance. Instant playbooks. Keep continuity through every transition and ramp
                            successors with confidence.
                        </p>

                        <div className="flex flex-wrap items-center justify-center gap-3">
                            <a href="mailto:hello@mindark.ai" className="btn-primary">
                                <Mail className="w-4 h-4" />
                                Book a Demo
                            </a>
                            <a href="#hidden-cost" className="btn">
                                <Search className="w-4 h-4" />
                                Get a Walkthrough
                            </a>
                            <a href="/sign-in" className="btn-ghost">
                                Unlock Your Echo Today
                            </a>
                        </div>

                        <div className="text-muted text-xs mt-2">
                            Prefer a quick video? Ask for the 15‑second “See Echo in Action” clip.
                        </div>
                    </div>
                </div>
            </section>

            <section>
                <pre><code className="whitespace-pre-wrap">{JSON.stringify(value,null,4)}</code></pre>
            </section>

            <section>
                <ConvoView
                    template={/*convo*/`

> system
You are a friendly travel assistant. Alway suggest a good location to spend holiday at.

> assistant
Hello, where would you like to travel to.

                    `}
                />
            </section>
        </div>
    )
}