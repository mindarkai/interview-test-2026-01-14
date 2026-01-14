import { cn } from "@/lib/util";
import { Loader2 } from "lucide-react";

export interface LoadingProps
{
    className?:string;   
}

export function Loading({
    className,
}:LoadingProps){

    return (
        <Loader2 className={cn("w-4 h-4 animate-spin",className)} />
    )

}