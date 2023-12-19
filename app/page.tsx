"use client";
import React from "react";
import Hive from "./components/Hive";
import { WagmiConfig, createConfig, mainnet } from "wagmi";
import { createPublicClient, http } from "viem";
import Head from "next/head";
import { ToastContainer } from "react-toastify";

const config = createConfig({
  autoConnect: true,
  publicClient: createPublicClient({
    chain: mainnet,
    transport: http(),
  }),
});
const Home = (props: any) => {
  return (
    <>
      <Head>
        <title>Hive</title>
        <meta name="description" content="Buy Hive Tokens directly into your in Hive account from 60+ crypto currency across three different blockchains." />
        <meta property="og:title" content="Hive Onboarding" />
        <meta property="og:url" content="https://terablock.com/business" />
        <meta property="og:description" content="Buy Hive Tokens directly into your in Hive account from 60+ crypto currency across three different blockchains." />
        <meta property="og:image" content={"/svgFiles/hive.png"} />
        <meta property="og:image:width" content="400" />
        <meta property="og:image:height" content="210" />
        <meta property="og:type" content="website" />
        <meta property="image" content={"/svgFiles/hive.png"} />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://terablock.com/business" />
        <meta property="twitter:title" content="Hive Onboarding" />
        <meta property="twitter:description" content="Buy Hive Tokens directly into your in Hive account from 60+ crypto currency across three different blockchains.." />
        <meta property="twitter:image" content={"/svgFiles/hive.png"} />
        <link rel="icon" href="/svgFiles/hive.png" />
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-9G9W5MJZCM"></script>
        <script>
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-9G9W5MJZCM');
          `}
        </script>
      </Head>
      <WagmiConfig config={config}>
        <Hive />
        <ToastContainer position="top-right" newestOnTop />
      </WagmiConfig>
    </>
  );
};

export default Home;
Home.getLayout = function PageLayout(page: any) {
  return <>{page}</>;
};
