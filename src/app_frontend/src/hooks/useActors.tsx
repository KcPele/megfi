import { useEffect, useState } from "react";
import {
  app_backend,
  idlFactory as appIdlFactory,
} from "@/../../declarations/app_backend";
import {
  icrc1_ledger_canister,
  idlFactory as icrc1LedgerIdlFactory,
} from "@/../../declarations/icrc1_ledger_canister";
import {
  icp as icpCanister,
  idlFactory as icpIdlFactory,
} from "@/../../declarations/icp";
import { Actor, HttpAgent } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import {
  idlFactory as ckbtc_ckUsdc_idlFactory,
  ckbtc_ckusdc as ckbtc_ckUsdc_canister,
} from "@/../../declarations/ckbtc_ckusdc";
import {
  idlFactory as ckusdc_idlFactory,
  ckusdc as ckusdc_canister,
} from "@/../../declarations/ckusdc";

import { useAuth } from "@/providers/auth-provider";
import { idlFactory as btcMinterIdlFactory } from "@/../../declarations/mock_btc_minter";
import { CkETHMinterCanister } from "@dfinity/cketh";

export const HOST =
  process.env.DFX_NETWORK === "local"
    ? "http://localhost:4943"
    : typeof window !== "undefined" &&
      (window.location.hostname.endsWith(".icp0.io") ||
        window.location.hostname.endsWith(".ic0.app"))
    ? window.location.origin
    : "https://icp0.io";

// Canister IDs (force mainnet IDs when DFX_NETWORK === "ic")
const MAIN_CANISTER_ID = process.env.CANISTER_ID_APP_BACKEND as string;
const CKBTC_LEDGER_CANISTER_ID =
  process.env.DFX_NETWORK === "ic"
    ? "mxzaz-hqaaa-aaaar-qaada-cai" // Official mainnet ckBTC Ledger
    : (process.env.CANISTER_ID_CKBTC_LEDGER as string);
const CKBTC_CKUSDC_CANISTER_ID = process.env.CANISTER_ID_CKBTC_CKUSDC as string;
const ICP_CANISTER_ID =
  process.env.DFX_NETWORK === "ic"
    ? "ryjl3-tyaaa-aaaaa-aaaba-cai" // Official mainnet ICP Ledger
    : (process.env.CANISTER_ID_ICP as string);
const CKUSDC_CANISTER_ID =
  process.env.DFX_NETWORK === "ic"
    ? "xevnm-gaaaa-aaaar-qafnq-cai" // Official mainnet ckUSDC Ledger
    : (process.env.CANISTER_ID_CKUSDC as string);
const CKBTC_MINTER_CANISTER_ID =
  (process.env.CANISTER_ID_CKBTC_MINTER as string) ||
  (process.env.CANISTER_ID_MOCK_BTC_MINTER as string);
const CKETH_MINTER_CANISTER_ID =
  (process.env.CANISTER_ID_CKETH_MINTER as string) ||
  // default to mainnet ckETH minter if not provided
  (process.env.DFX_NETWORK === "ic"
    ? "sv3dd-oaaaa-aaaar-qacoa-cai"
    : undefined);

// Create agents with local development support
const createAgent = () => {
  const agent = HttpAgent.createSync({ host: HOST });
  if (process.env.DFX_NETWORK === "local") {
    agent.fetchRootKey().catch(console.error);
  }
  return agent;
};

// Actors
export const MAIN_CANISTER: typeof app_backend = Actor.createActor(
  appIdlFactory,
  { agent: createAgent(), canisterId: MAIN_CANISTER_ID }
);
export const CKBTC_LEDGER: typeof icrc1_ledger_canister = Actor.createActor(
  icrc1LedgerIdlFactory,
  { agent: createAgent(), canisterId: CKBTC_LEDGER_CANISTER_ID }
);
export const CKBTC_CKUSDC: typeof ckbtc_ckUsdc_canister = Actor.createActor(
  ckbtc_ckUsdc_idlFactory,
  { agent: createAgent(), canisterId: CKBTC_CKUSDC_CANISTER_ID }
);

export const ICP: typeof icpCanister = Actor.createActor(icpIdlFactory, {
  agent: createAgent(),
  canisterId: ICP_CANISTER_ID,
});
export const CKUSDC: typeof ckusdc_canister = Actor.createActor(
  ckusdc_idlFactory,
  { agent: createAgent(), canisterId: CKUSDC_CANISTER_ID }
);
export const CKBTC_MINTER = Actor.createActor(btcMinterIdlFactory as any, {
  agent: createAgent(),
  canisterId: CKBTC_MINTER_CANISTER_ID,
});
export const CKETH_MINTER = CKETH_MINTER_CANISTER_ID
  ? CkETHMinterCanister.create({
      agent: createAgent() as any,
      canisterId: Principal.fromText(CKETH_MINTER_CANISTER_ID),
    })
  : null;

export const useActors = () => {
  const { identity } = useAuth();

  // actors in state
  const [mainCanister, setMainCanister] =
    useState<typeof app_backend>(MAIN_CANISTER);
  const [ckbtcLedger, setCkbtcLedger] =
    useState<typeof icrc1_ledger_canister>(CKBTC_LEDGER);
  const [ckbtc_ckusdc, setCkbtc_ckusdc] =
    useState<typeof ckbtc_ckUsdc_canister>(CKBTC_CKUSDC);

  const [icp, setIcp] = useState<typeof icpCanister>(ICP);
  const [ckusdc, setCkusdc] = useState<typeof ckusdc_canister>(CKUSDC);
  const [ckbtcMinter, setCkbtcMinter] = useState<any>(CKBTC_MINTER);
  const [ckethMinter, setCkethMinter] = useState<any>(CKETH_MINTER);

  useEffect(() => {
    if (!identity) return;
    console.log("after return");
    const agent = HttpAgent.createSync({ host: HOST, identity });
    // For local development, fetch root key
    if (process.env.DFX_NETWORK === "local") {
      agent.fetchRootKey().catch(console.error);
    }
    //new actors
    const _mainCanisterActor: typeof app_backend = Actor.createActor(
      appIdlFactory,
      { agent, canisterId: MAIN_CANISTER_ID }
    );
    const _ckbtcLedgerActor: typeof icrc1_ledger_canister = Actor.createActor(
      icrc1LedgerIdlFactory,
      { agent, canisterId: CKBTC_LEDGER_CANISTER_ID }
    );
    const _ckbtc_ckusdc: typeof ckbtc_ckUsdc_canister = Actor.createActor(
      ckbtc_ckUsdc_idlFactory,
      { agent, canisterId: CKBTC_CKUSDC_CANISTER_ID }
    );

    const _icp: typeof icpCanister = Actor.createActor(icpIdlFactory, {
      agent,
      canisterId: ICP_CANISTER_ID,
    });
    const _ckusdc: typeof ckusdc_canister = Actor.createActor(
      ckusdc_idlFactory,
      { agent, canisterId: CKUSDC_CANISTER_ID }
    );
    const _ckbtcMinter = Actor.createActor(btcMinterIdlFactory as any, {
      agent,
      canisterId: CKBTC_MINTER_CANISTER_ID,
    });
    const _ckethMinter = CKETH_MINTER_CANISTER_ID
      ? CkETHMinterCanister.create({
          agent: agent as any,
          canisterId: Principal.fromText(CKETH_MINTER_CANISTER_ID),
        })
      : null;

    // set actors
    setMainCanister(_mainCanisterActor);
    setCkbtcLedger(_ckbtcLedgerActor);
    setCkbtc_ckusdc(_ckbtc_ckusdc);
    setIcp(_icp);
    setCkusdc(_ckusdc);
    setCkbtcMinter(_ckbtcMinter);
    setCkethMinter(_ckethMinter);
  }, [identity]);

  return {
    mainCanister,
    ckbtcLedger,
    ckbtc_ckusdc,
    icp,
    ckusdc,
    ckbtcMinter,
    ckethMinter,
  };
};
