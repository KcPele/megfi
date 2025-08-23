import { useEffect, useState } from 'react';
import { app_backend, idlFactory as appIdlFactory } from "@/../../declarations/app_backend";
import { icrc1_ledger_canister, idlFactory as icrc1LedgerIdlFactory } from "@/../../declarations/icrc1_ledger_canister";
import { icp as icpCanister, idlFactory as icpIdlFactory } from "@/../../declarations/icp";
import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory as ckbtc_ckUsdc_idlFactory, ckbtc_ckusdc as ckbtc_ckUsdc_canister } from "@/../../declarations/ckbtc_ckusdc";
import { idlFactory as ckusdc_idlFactory, ckusdc as ckusdc_canister } from "@/../../declarations/ckusdc";
import { idlFactory as ckbtc_icp_idlFactory, ckbtc_icp as ckbtc_icp_canister } from "@/../../declarations/ckbtc_icp";
import { useAuth } from '@/providers/auth-provider';

export const HOST = process.env.DFX_NETWORK === "local" ? "http://localhost:4943" : "https://ic0.app";

// Canister IDs (from environment)
const MAIN_CANISTER_ID = process.env.CANISTER_ID_APP_BACKEND as string;
const CKBTC_LEDGER_CANISTER_ID = process.env.CANISTER_ID_CKBTC_LEDGER as string;
const CKBTC_CKUSDC_CANISTER_ID = process.env.CANISTER_ID_CKBTC_CKUSDC as string;
const CKBTC_ICP_CANISTER_ID = process.env.CANISTER_ID_CKBTC_ICP as string;
const ICP_CANISTER_ID = process.env.CANISTER_ID_ICP as string;
const CKUSDC_CANISTER_ID = process.env.CANISTER_ID_CKUSDC as string;

// Create agents with local development support
const createAgent = () => {
    const agent = HttpAgent.createSync({ host: HOST });
    if (process.env.DFX_NETWORK === "local") {
        agent.fetchRootKey().catch(console.error);
    }
    return agent;
};

// Actors
export const MAIN_CANISTER: typeof app_backend = Actor.createActor(appIdlFactory, { agent: createAgent(), canisterId: MAIN_CANISTER_ID });
export const CKBTC_LEDGER: typeof icrc1_ledger_canister = Actor.createActor(icrc1LedgerIdlFactory, { agent: createAgent(), canisterId: CKBTC_LEDGER_CANISTER_ID });
export const CKBTC_CKUSDC: typeof ckbtc_ckUsdc_canister = Actor.createActor(ckbtc_ckUsdc_idlFactory, { agent: createAgent(), canisterId: CKBTC_CKUSDC_CANISTER_ID });
export const CKBTC_ICP: typeof ckbtc_icp_canister = Actor.createActor(ckbtc_icp_idlFactory, { agent: createAgent(), canisterId: CKBTC_ICP_CANISTER_ID });
export const ICP: typeof icpCanister = Actor.createActor(icpIdlFactory, { agent: createAgent(), canisterId: ICP_CANISTER_ID });
export const CKUSDC: typeof ckusdc_canister = Actor.createActor(ckusdc_idlFactory, { agent: createAgent(), canisterId: CKUSDC_CANISTER_ID });


export const useActors = () => {
    const {identity} = useAuth();
    // actors in state
    const [mainCanister, setMainCanister] = useState<typeof app_backend >(MAIN_CANISTER);
    const [ckbtcLedger, setCkbtcLedger] = useState<typeof icrc1_ledger_canister>(CKBTC_LEDGER);
    const [ckbtc_ckusdc, setCkbtc_ckusdc] = useState<typeof ckbtc_ckUsdc_canister>(CKBTC_CKUSDC);
    const [ckbtc_icp, setCkbtc_icp] = useState<typeof ckbtc_icp_canister | null>(CKBTC_ICP);
    const [icp, setIcp] = useState<typeof icpCanister>(ICP);
    const [ckusdc, setCkusdc] = useState<typeof ckusdc_canister>(CKUSDC);

    useEffect(() => {
        if (!identity) return;
        console.log("after return")
        const agent =  HttpAgent.createSync({ host: HOST, identity});
        // For local development, fetch root key
        if (process.env.DFX_NETWORK === "local") {
            agent.fetchRootKey().catch(console.error);
        }
        //new actors
        const _mainCanisterActor: typeof app_backend = Actor.createActor(appIdlFactory, { agent, canisterId: MAIN_CANISTER_ID });
        const _ckbtcLedgerActor: typeof icrc1_ledger_canister = Actor.createActor(icrc1LedgerIdlFactory, { agent, canisterId: CKBTC_LEDGER_CANISTER_ID });
        const _ckbtc_ckusdc: typeof ckbtc_ckUsdc_canister = Actor.createActor(ckbtc_ckUsdc_idlFactory, { agent, canisterId: CKBTC_CKUSDC_CANISTER_ID });
        const _ckbtc_icp: typeof ckbtc_icp_canister = Actor.createActor(ckbtc_icp_idlFactory, { agent, canisterId: CKBTC_ICP_CANISTER_ID });
        const _icp: typeof icpCanister = Actor.createActor(icpIdlFactory, { agent, canisterId: ICP_CANISTER_ID });
        const _ckusdc: typeof ckusdc_canister = Actor.createActor(ckusdc_idlFactory, { agent, canisterId: CKUSDC_CANISTER_ID });

        // set actors
        setMainCanister(_mainCanisterActor );
        setCkbtcLedger(_ckbtcLedgerActor);
        setCkbtc_ckusdc(_ckbtc_ckusdc);
        setCkbtc_icp(_ckbtc_icp);
        setIcp(_icp);
        setCkusdc(_ckusdc);

    }, [identity]);

    return { mainCanister, ckbtcLedger, ckbtc_ckusdc, ckbtc_icp, icp, ckusdc };
};
