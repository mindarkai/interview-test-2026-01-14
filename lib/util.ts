import { getContentType, cn as ioCn } from "@iyio/common";

export const cn=ioCn;




/**
 * Returns the file name of a preview file for the given file.
 */
export const getPreviewFileName=(name:string,pageIndex=0):string=>{
    if(name.startsWith('.')){
        return name;
    }
    const contentType=getContentType(name);
    if(contentType.startsWith('image/')){
        return `.__preview__.${name}.jpg`;
    }else{
        return `.__meta__.${name}/page_${pageIndex+1}.jpg`;
    }
}

/**
 * Returns the full path of a preview file for the given path.
 */
export const getPreviewPath=(path:string,pageIndex=0):string=>{
    const parts=path.split('/');
    const parentDir=parts[parts.length-2]??'';
    if(parentDir.startsWith('.__meta__.') && getContentType(path).startsWith('image/')){
        return path;
    }
    const i=path.lastIndexOf('/');
    if(i===-1){
        return getPreviewFileName(path);
    }
    return path.substring(0,i+1)+getPreviewFileName(path.substring(i+1),pageIndex);
}

export const getStartOfUserConversation=(convo:string):string=>{
    if(!convo){
        return '-';
    }
    const i=convo.indexOf('\n> nop');
    const u=convo.indexOf('\n> user',i===-1?0:i);
    const txt=u===-1?'-':convo.substring(u,u+80);
    return txt.split('\n').filter(v=>{
        v=v.trim();
        return !v.startsWith('>') && !v.startsWith('@');
    }).join(' ');
}

export const timeSince = (dateString: string): string => {
    if(!dateString){
        return 'never';
    }
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    const now = Date.now();
    let diff = now - d.getTime();
    if (diff < 1000) return 'just now';

    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return `${seconds} ${seconds === 1 ? 'second' : 'seconds'} ago`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;

    const days = Math.floor(hours / 24);
    const monthMs = 30 * 24 * 60 * 60 * 1000;
    if (diff < monthMs) return `${days} ${days === 1 ? 'day' : 'days'} ago`;

    return d.toLocaleDateString();
};