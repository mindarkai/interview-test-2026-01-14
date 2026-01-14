import { MainLayout } from "@/components/MainLayout";
import "@/styles/globals.css";
import { NextJsStyleSheets } from "@iyio/nextjs-common";
import type { AppProps } from "next/app";
import Head from "next/head";
import { useEffect } from "react";


export default function App({ Component, pageProps }: AppProps) {

    useEffect(()=>{
        import('@/lib/frontendModule').then(m=>{
            m.initFrontend();
        });
    },[]);
    
    return (
        <>
            <Head>
                <title>MindArk AI: Onboarding and Offboarding Made Easy</title>
                <meta key="head:description" name="description" content="Capture and activate employee expertise with an AI powered platform ensuring continuity across transitions and exits" />
                <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no" />
                <link rel="icon" href="/favicon.png" />
                <meta key="head:og:title" property="og:title" content="MindArk AI: Onboarding and Offboarding Made Easy" />
                <meta key="head:og:description" property="og:description" content="Capture and activate employee expertise with an AI powered platform ensuring continuity across transitions and exits" />
                <meta key="head:og:type" property="og:type" content="website" />
                <meta key="head:og:image" property="og:image" content={`${process.env['NEXT_PUBLIC_FRONTEND_PUBLIC_URL']}/opengraph.jpg`} />
                <meta key="head:og:url" property="og:url" content={`${process.env['NEXT_PUBLIC_FRONTEND_PUBLIC_URL']}/`} />
            </Head>
            <MainLayout>
                <Component {...pageProps} />
            </MainLayout>
            <NextJsStyleSheets/>
        </>
    )
}
