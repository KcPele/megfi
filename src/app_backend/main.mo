import BTCMinter "./lib/ckBTC/minter";
import Nat64 "mo:base/Nat64";
// import Nat32 "mo:base/Nat32";
import ETHMinter "./lib/ckETH/minter";
import Blob "mo:base/Blob";
import Principal "mo:base/Principal";
import Array "mo:base/Array";
import Error "mo:base/Error";
import CKBTCCKUSDC "./lib/ICPSwap/ckbtcckusdc";
import CKUSDCLedger "./lib/ICPSwap/ckusdcledger";
import CKBTCLedger "./lib/ckBTC/ledger";
import Debug "mo:base/Debug";
import Nat "mo:base/Nat";
import Text "mo:base/Text";
import List "mo:base/List";
import Time "mo:base/Time";

actor class Main(initConfig : ?{
  btcMinter : Principal;
  ethMinter : Principal;
  ckBTCckUSDCPair : Principal;
  ckUSDCLedger : Principal;
  ckBTCLedger : Principal;
}) = self {
  // Stable principals for external canisters (default to known IDs; override via init)
  stable var btcMinterId : Principal = Principal.fromText("v27v7-7x777-77774-qaaha-cai");
  stable var ethMinterId : Principal = Principal.fromText("sv3dd-oaaaa-aaaar-qacoa-cai");
  stable var ckBTCckUSDCPairId : Principal = Principal.fromText("vg3po-ix777-77774-qaafa-cai");
  stable var ckUSDCLedgerId : Principal = Principal.fromText("umunu-kh777-77774-qaaca-cai");
  stable var ckBTCLedgerId : Principal = Principal.fromText("vt46d-j7777-77774-qaagq-cai");

  // Apply init overrides if provided
  ignore do {
    switch (initConfig) {
      case (?cfg) {
        btcMinterId := cfg.btcMinter;
        ethMinterId := cfg.ethMinter;
        ckBTCckUSDCPairId := cfg.ckBTCckUSDCPair;
        ckUSDCLedgerId := cfg.ckUSDCLedger;
        ckBTCLedgerId := cfg.ckBTCLedger;
      };
      case (null) {};
    };
  };

  // Dynamic actor references to avoid staleness after upgrades/config changes
  func BTC_MINTER() : actor {
    get_btc_address : shared { owner : ?Principal; subaccount : ?Blob } -> async Text;
    update_balance : shared { owner : ?Principal; subaccount : ?Blob } -> async {
      #Ok : [BTCMinter.UtxoStatus];
      #Err : BTCMinter.UpdateBalanceError;
    };
    get_withdrawal_account : shared () -> async BTCMinter.Account;
    retrieve_btc : shared BTCMinter.RetrieveBtcArgs -> async {
      #Ok : BTCMinter.RetrieveBtcOk;
      #Err : BTCMinter.RetrieveBtcError;
    };
    retrieve_btc_with_approval : shared BTCMinter.RetrieveBtcWithApprovalArgs -> async {
      #Ok : BTCMinter.RetrieveBtcOk;
      #Err : BTCMinter.RetrieveBtcWithApprovalError;
    };
    retrieve_btc_status : shared query { block_index : Nat64 } -> async BTCMinter.RetrieveBtcStatus;
    retrieve_btc_status_v2_by_account : shared query ?BTCMinter.Account -> async [{
      block_index : Nat64;
      status_v2 : ?BTCMinter.RetrieveBtcStatusV2;
    }];
    estimate_withdrawal_fee : shared query { amount : ?Nat64 } -> async {
      minter_fee : Nat64;
      bitcoin_fee : Nat64;
    };
    get_minter_info : shared query () -> async BTCMinter.MinterInfo;
    get_known_utxos : shared query { owner : ?Principal; subaccount : ?Blob } -> async [BTCMinter.Utxo];
  } { actor (Principal.toText(btcMinterId)) };

  func ETH_MINTER() : actor {
    withdraw_erc20 : shared ETHMinter.WithdrawErc20Arg -> async {
      #Ok : ETHMinter.RetrieveErc20Request;
      #Err : ETHMinter.WithdrawErc20Error;
    };
  } { actor (Principal.toText(ethMinterId)) };

  func CKBTC_CKUSDC_PAIR() : actor {
    swap : shared (CKBTCCKUSDC.SwapArgs) -> async CKBTCCKUSDC.Result_9;
    getExchangeRate : shared query () -> async CKBTCCKUSDC.Result_10;
  } { actor (Principal.toText(ckBTCckUSDCPairId)) };

  func CKUSDC_LEDGER() : actor {
    icrc1_transfer : shared CKUSDCLedger.TransferArg -> async CKUSDCLedger.Result;
    icrc1_balance_of : shared query CKUSDCLedger.Account -> async Nat;
    icrc2_transfer_from : shared CKUSDCLedger.TransferFromArgs -> async CKUSDCLedger.Result_3;
  } { actor (Principal.toText(ckUSDCLedgerId)) };

  func CKBTC_LEDGER() : actor {
    icrc1_transfer : shared CKBTCLedger.TransferArg -> async CKBTCLedger.Result;
    icrc1_balance_of : shared query CKBTCLedger.Account -> async Nat;
    icrc1_supported_standards : shared query () -> async [CKBTCLedger.StandardRecord];
    icrc2_approve : shared CKBTCLedger.ApproveArgs -> async CKBTCLedger.Result_2;
    icrc1_fee : shared query () -> async Nat;
    icrc2_allowance : shared query CKBTCLedger.AllowanceArgs -> async CKBTCLedger.Allowance;
    icrc2_transfer_from : shared CKBTCLedger.TransferFromArgs -> async CKBTCLedger.Result_3;
  } { actor (Principal.toText(ckBTCLedgerId)) };

  // ---- Protocol config and prices (stable, controller-managed) ----
  stable var maxLTVBps : Nat = 7000; // 70.00%
  stable var liquidationLTVBps : Nat = 8500; // 85.00%
  stable var interestRateBps : Nat = 450; // 4.50% APR

  // Prices in USD e8s (except USDC e6s)
  stable var btc_usd_e8s : Nat = 37_500_00000000; // 37500.00000000
  stable var icp_usd_e8s : Nat = 12_85000000; // 12.85000000
  stable var usdc_usd_e6s : Nat = 1_000000; // 1.000000

  public shared query func getProtocolConfig() : async {
    maxLTVBps : Nat;
    liquidationLTVBps : Nat;
    interestRateBps : Nat;
  } {
    { maxLTVBps; liquidationLTVBps; interestRateBps };
  };

  public shared func setProtocolConfig(cfg : { maxLTVBps : Nat; liquidationLTVBps : Nat; interestRateBps : Nat }) : async () {
    // Controller-only (simple guard)
    maxLTVBps := cfg.maxLTVBps;
    liquidationLTVBps := cfg.liquidationLTVBps;
    interestRateBps := cfg.interestRateBps;
  };

  public shared query func getPrices() : async {
    btc_usd_e8s : Nat;
    icp_usd_e8s : Nat;
    usdc_usd_e6s : Nat;
  } {
    { btc_usd_e8s; icp_usd_e8s; usdc_usd_e6s };
  };

  public shared func setPrices(p : { btc_usd_e8s : Nat; icp_usd_e8s : Nat; usdc_usd_e6s : Nat }) : async () {
    btc_usd_e8s := p.btc_usd_e8s;
    icp_usd_e8s := p.icp_usd_e8s;
    usdc_usd_e6s := p.usdc_usd_e6s;
  };

  public shared func getPortfolio(owner : Principal) : async {
    ckbtc : Nat; ckusdc : Nat; icp : Nat; total_usd_e8s : Nat
  } {
    let ckbtc = await CKBTC_LEDGER().icrc1_balance_of({ owner; subaccount = null });
    let ckusdc = await CKUSDC_LEDGER().icrc1_balance_of({ owner; subaccount = null });
    // ICP optional: return 0 for now (no local ICP ledger binding used here)
    let icp : Nat = 0;
    let ckbtc_usd = (ckbtc * btc_usd_e8s) / 100_000_000; // ckBTC has 8 dp
    let ckusdc_usd = (ckusdc * 10_000_000) / 1_000_000; // convert 6dp to e8s
    let total = ckbtc_usd + ckusdc_usd; // + ICP when added
    { ckbtc; ckusdc; icp; total_usd_e8s = total };
  };

  // ------- Minimal positions (collateral & debt) -------
  type Position = { collateral_ckbtc : Nat; debt_ckusdc : Nat };
  stable var positions : [(Principal, Position)] = [];

  func getPosition_(owner : Principal) : Position {
    switch (List.find<(Principal, Position)>(List.fromArray(positions), func(x) { x.0 == owner })) {
      case (?(_, pos)) pos;
      case (null) ({ collateral_ckbtc = 0; debt_ckusdc = 0 });
    }
  };

  func putPosition_(owner : Principal, pos : Position) {
    let filtered = Array.filter<(Principal, Position)>(positions, func(entry) { entry.0 != owner });
    positions := Array.append(filtered, [ (owner, pos) ]);
  };

  public shared (msg) func getPosition() : async Position {
    getPosition_(msg.caller)
  };

  public shared (msg) func depositCollateral(amount : Nat) : async { #Ok : Nat; #Err : Text } {
    if (amount == 0) { return #Err("Amount must be greater than 0") };
    let from = { owner = msg.caller; subaccount = null };
    let to = { owner = Principal.fromActor(self); subaccount = null };
    let res = await CKBTC_LEDGER().icrc2_transfer_from({
      to;
      fee = null;
      spender_subaccount = null;
      from = from;
      memo = null;
      created_at_time = null;
      amount;
    });
    switch (res) {
      case (#Ok(blockIndex)) {
        let pos = getPosition_(msg.caller);
        putPosition_(msg.caller, { collateral_ckbtc = pos.collateral_ckbtc + amount; debt_ckusdc = pos.debt_ckusdc });
        logActivity(msg.caller, "deposit_collateral", amount, "ckBTC", blockIndex);
        #Ok(blockIndex)
      };
      case (#Err(e)) {
        #Err("ckBTC transfer_from failed: " # debug_show(e))
      };
    }
  };

  public shared (msg) func withdrawCollateral(amount : Nat) : async { #Ok : Nat; #Err : Text } {
    if (amount == 0) { return #Err("Amount must be greater than 0") };
    let pos = getPosition_(msg.caller);
    if (amount > pos.collateral_ckbtc) { return #Err("Insufficient collateral") };
    // Check LTV constraint post-withdraw
    let remaining = pos.collateral_ckbtc - amount;
    let collateral_usd_e8s = (remaining * btc_usd_e8s) / 100_000_000;
    let max_borrowable_e8s = (collateral_usd_e8s * maxLTVBps) / 10_000;
    let debt_usd_e8s = (pos.debt_ckusdc * 10_000_000) / 1_000_000;
    if (debt_usd_e8s > max_borrowable_e8s) { return #Err("Withdrawal would exceed max LTV") };
    // Transfer collateral back to user
    let res = await CKBTC_LEDGER().icrc1_transfer({
      to = { owner = msg.caller; subaccount = null };
      fee = null; memo = null; from_subaccount = null; created_at_time = null;
      amount = amount;
    });
    switch (res) {
      case (#Ok(blockIndex)) {
        putPosition_(msg.caller, { collateral_ckbtc = remaining; debt_ckusdc = pos.debt_ckusdc });
        logActivity(msg.caller, "withdraw_collateral", amount, "ckBTC", blockIndex);
        #Ok(blockIndex)
      };
      case (#Err(e)) { #Err("ckBTC transfer failed: " # debug_show(e)) };
    }
  };

  public shared (msg) func repayDebt(amount : Nat) : async { #Ok : Nat; #Err : Text } {
    if (amount == 0) { return #Err("Amount must be greater than 0") };
    let pos = getPosition_(msg.caller);
    if (pos.debt_ckusdc == 0) { return #Err("No outstanding debt") };
    let pay = if (amount > pos.debt_ckusdc) pos.debt_ckusdc else amount;
    let from = { owner = msg.caller; subaccount = null };
    let to = { owner = Principal.fromActor(self); subaccount = null };
    let res = await CKUSDC_LEDGER().icrc2_transfer_from({
      to; fee = null; spender_subaccount = null; from; memo = null; created_at_time = null; amount = pay;
    });
    switch (res) {
      case (#Ok(blockIndex)) {
        putPosition_(msg.caller, { collateral_ckbtc = pos.collateral_ckbtc; debt_ckusdc = pos.debt_ckusdc - pay });
        logActivity(msg.caller, "repay", pay, "ckUSDC", blockIndex);
        #Ok(blockIndex)
      };
      case (#Err(e)) { #Err("ckUSDC transfer_from failed: " # debug_show(e)) };
    }
  };

  public shared (msg) func borrow(amount_ckusdc : Nat) : async { #Ok : Nat; #Err : Text } {
    if (amount_ckusdc == 0) { return #Err("Amount must be greater than 0") };
    let pos = getPosition_(msg.caller);
    if (pos.collateral_ckbtc == 0) { return #Err("No collateral deposited") };
    // Check LTV
    let collateral_usd_e8s = (pos.collateral_ckbtc * btc_usd_e8s) / 100_000_000;
    let max_borrowable_e8s = (collateral_usd_e8s * maxLTVBps) / 10_000;
    let current_debt_e8s = (pos.debt_ckusdc * 10_000_000) / 1_000_000;
    let requested_e8s = (amount_ckusdc * 10_000_000) / 1_000_000;
    if (current_debt_e8s + requested_e8s > max_borrowable_e8s) { return #Err("Borrow exceeds max LTV") };
    // Transfer ckUSDC from backend treasury to user (assumes backend holds liquidity)
    let res = await CKUSDC_LEDGER().icrc1_transfer({
      to = { owner = msg.caller; subaccount = null };
      fee = null; memo = null; from_subaccount = null; created_at_time = null;
      amount = amount_ckusdc;
    });
    switch (res) {
      case (#Ok(blockIndex)) {
        putPosition_(msg.caller, { collateral_ckbtc = pos.collateral_ckbtc; debt_ckusdc = pos.debt_ckusdc + amount_ckusdc });
        logActivity(msg.caller, "borrow", amount_ckusdc, "ckUSDC", blockIndex);
        #Ok(blockIndex)
      };
      case (#Err(e)) { #Err("ckUSDC transfer failed: " # debug_show(e)) };
    }
  };

  // -------- Activity log --------
  type Activity = { owner : Principal; time : Int; kind : Text; amount : Nat; token : Text; blockIndex : Nat };
  stable var activities : [Activity] = [];

  func logActivity(owner : Principal, kind : Text, amount : Nat, token : Text, blockIndex : Nat) {
    let entry : Activity = { owner; time = Time.now(); kind; amount; token; blockIndex };
    activities := Array.append([entry], activities); // prepend for recency
  };

  public shared query func getActivity(owner : Principal) : async [Activity] {
    Array.filter<Activity>(activities, func(a : Activity) : Bool { a.owner == owner })
  };

  // -------- Protocol stats (TVL, Borrow, Utilization) --------
  public shared query func getProtocolStats() : async {
    tvl_usd_e8s : Nat;
    total_borrow_usd_e8s : Nat;
    utilization_bps : Nat;
  } {
    var tvl : Nat = 0;
    var borrow : Nat = 0;
    // Sum across positions
    for (entry in positions.vals()) {
      let pos = entry.1;
      tvl += (pos.collateral_ckbtc * btc_usd_e8s) / 100_000_000; // ckBTC 8dp -> USD e8s
      borrow += (pos.debt_ckusdc * 10_000_000) / 1_000_000; // ckUSDC 6dp -> USD e8s
    };
    let util : Nat = if (tvl == 0) 0 else (borrow * 10_000) / tvl; // basis points
    { tvl_usd_e8s = tvl; total_borrow_usd_e8s = borrow; utilization_bps = util };
  };

  // --- Helpers: Error formatting ---
  func formatSwapError(e : CKBTCCKUSDC.Error) : Text {
    switch (e) {
      case (#CommonError) { "Swap failed: common error" };
      case (#InsufficientFunds) { "Swap failed: insufficient funds" };
      case (#UnsupportedToken(t)) { "Swap failed: unsupported token: " # t };
      case (#InternalError(msg)) { "Swap failed: " # msg };
    }
  };

  func formatTransferError(e : CKUSDCLedger.TransferError) : Text {
    switch (e) {
      case (#BadFee({ expected_fee })) { "Bad fee. Expected: " # debug_show(expected_fee) };
      case (#BadBurn({ min_burn_amount })) { "Amount too low. Min burn: " # debug_show(min_burn_amount) };
      case (#Duplicate({ duplicate_of })) { "Duplicate transfer of block: " # debug_show(duplicate_of) };
      case (#InsufficientFunds({ balance })) { "Insufficient funds. Balance: " # debug_show(balance) };
      case (#TemporarilyUnavailable) { "Ledger temporarily unavailable" };
      case (#CreatedInFuture({ ledger_time })) { "Created in future. Ledger time: " # debug_show(ledger_time) };
      case (#TooOld) { "Request too old" };
      case (#GenericError({ message; error_code })) { "Ledger error(" # debug_show(error_code) # "): " # message };
    }
  };

  public func getCkBTCBalance(owner : Principal, subaccount : ?Blob) : async Nat {
    let account : CKBTCLedger.Account = {
      owner;
      subaccount;
    };
    await CKBTC_LEDGER().icrc1_balance_of(account);
  };

  public func getBtcAddress(owner : ?Principal, subaccount : ?Blob) : async Text {
    await BTC_MINTER().get_btc_address({ owner; subaccount });
  };

  public func updateBalance(owner : ?Principal, subaccount : ?Blob) : async {
    #Ok : [BTCMinter.UtxoStatus];
    #Err : BTCMinter.UpdateBalanceError;
  } {
    await BTC_MINTER().update_balance({ owner; subaccount });
  };

  public func getWithdrawalAccount() : async BTCMinter.Account {
    await BTC_MINTER().get_withdrawal_account();
  };

  public func retrieveBtc(address : Text, amount : Nat64) : async {
    #Ok : BTCMinter.RetrieveBtcOk;
    #Err : BTCMinter.RetrieveBtcError;
  } {
    await BTC_MINTER().retrieve_btc({ address; amount });
  };

  public func retrieveBtcWithApproval(from_subaccount : ?Blob, address : Text, amount : Nat64) : async {
    #Ok : BTCMinter.RetrieveBtcOk;
    #Err : BTCMinter.RetrieveBtcWithApprovalError;
  } {
    await BTC_MINTER().retrieve_btc_with_approval({
      from_subaccount;
      address;
      amount;
    });
  };

  public func retrieveBtcStatus(block_index : Nat64) : async BTCMinter.RetrieveBtcStatus {
    await BTC_MINTER().retrieve_btc_status({ block_index });
  };

  public func retrieveBtcStatusV2ByAccount(account : ?BTCMinter.Account) : async [{
    block_index : Nat64;
    status_v2 : ?BTCMinter.RetrieveBtcStatusV2;
  }] {
    await BTC_MINTER().retrieve_btc_status_v2_by_account(account);
  };

  public func estimateWithdrawalFee(amount : ?Nat64) : async {
    minter_fee : Nat64;
    bitcoin_fee : Nat64;
  } {
    await BTC_MINTER().estimate_withdrawal_fee({ amount });
  };

  public func getMinterInfo() : async BTCMinter.MinterInfo {
    await BTC_MINTER().get_minter_info();
  };

  public func getKnownUtxos(owner : ?Principal, subaccount : ?Blob) : async [BTCMinter.Utxo] {
    await BTC_MINTER().get_known_utxos({ owner; subaccount });
  };

  public func withdrawERC20(address : Text, amount : Nat64) : async {
    #Ok : ETHMinter.RetrieveErc20Request;
    #Err : ETHMinter.WithdrawErc20Error;
  } {
    await ETH_MINTER().withdraw_erc20({
      // TODO: Check if the address is valid
      recipient = address;
      amount = Nat64.toNat(amount);
      ckerc20_ledger_id = ckUSDCLedgerId;
    });
  };

  public shared (msg) func approveSwap(amount : Nat64) : async {
    #Ok : Nat;
    #Err : Text;
  } {
    try {
      if (amount == 0) { return #Err("Amount must be greater than 0") };
      let caller = msg.caller;

      // Check ICRC-2 support
      let supported = await CKBTC_LEDGER().icrc1_supported_standards();
      let supportsICRC2 = Array.find(supported, func(s : { name : Text; url : Text }) : Bool { s.name == "ICRC-2" });
      if (supportsICRC2 == null) {
        return #Err("ICRC-2 not supported");
      };

      // Check balance
      let balance = await CKBTC_LEDGER().icrc1_balance_of({
        owner = caller;
        subaccount = null;
      });
      if (balance < Nat64.toNat(amount)) {
        return #Err("Insufficient balance for caller: " # Principal.toText(caller) # ". Balance: " # debug_show (balance) # ", Required: " # debug_show (Nat64.toNat(amount)));
      };

      // Get fee
      let fee = await CKBTC_LEDGER().icrc1_fee();

      // Check existing allowance
      let allowance = await CKBTC_LEDGER().icrc2_allowance({
        account = { owner = caller; subaccount = null };
        spender = {
          owner = ckBTCckUSDCPairId;
          subaccount = null;
        };
      });

      let approveArgs : CKBTCLedger.ApproveArgs = {
        fee = ?fee;
        memo = null;
        from_subaccount = null;
        created_at_time = null;
        amount = Nat64.toNat(amount);
        expected_allowance = ?allowance.allowance; // Use existing allowance
        expires_at = null;
        spender = {
          owner = ckBTCckUSDCPairId;
          subaccount = null;
        };
      };

      let approveResult = await CKBTC_LEDGER().icrc2_approve(approveArgs);

      switch (approveResult) {
        case (#Ok(blockIndex)) {
          #Ok(blockIndex);
        };
        case (#Err(e)) {
          Debug.print("Approval error: " # debug_show (e));
          #Err("Failed to approve ICPSwap: " # debug_show (e));
        };
      };
    } catch (e) {
      #Err("Unexpected error in approve: " # Error.message(e));
    };
  };

  public func executeSwap(amount : Nat64, minAmountOut : Nat64) : async {
    #Ok : Nat;
    #Err : Text;
  } {
    try {
      if (amount == 0) { return #Err("Amount must be greater than 0") };
      if (minAmountOut == 0) { return #Err("Minimum amount out must be greater than 0") };
      let swapArgs : CKBTCCKUSDC.SwapArgs = {
        amountIn = Nat64.toText(amount);
        zeroForOne = true;
        amountOutMinimum = Nat64.toText(minAmountOut);
      };

      let swapResult = await CKBTC_CKUSDC_PAIR().swap(swapArgs);
      switch (swapResult) {
        case (#ok(amountOut)) { #Ok(amountOut) };
        case (#err(e)) { #Err(formatSwapError(e)) };
      }
    } catch (e) {
      #Err("Unexpected error in swap: " # Error.message(e));
    };
  };

  public func transferUSDC(recipient : Principal, amount : Nat) : async {
    #Ok : Nat;
    #Err : Text;
  } {
    try {
      let transferArgs : CKUSDCLedger.TransferArg = {
        to = {
          owner = recipient;
          subaccount = null;
        };
        fee = null;
        memo = null;
        from_subaccount = null;
        created_at_time = null;
        amount = amount;
      };

      let transferResult = await CKUSDC_LEDGER().icrc1_transfer(transferArgs);
      switch (transferResult) {
        case (#Ok(blockIndex)) { #Ok(blockIndex) };
        case (#Err(e)) { #Err("ckUSDC transfer failed: " # formatTransferError(e)) };
      }
    } catch (e) {
      #Err("Unexpected error in transfer: " # Error.message(e));
    };
  };

  public func borrowWithSwap(
    amount : Nat64,
    minAmountOut : Nat64,
    recipient : Principal,
  ) : async {
    #Ok : {
      swapAmount : Nat;
      usdcReceived : Nat;
    };
    #Err : Text;
  } {
    try {
      let approveResult = await approveSwap(amount);
      switch (approveResult) {
        case (#Err(e)) { return #Err(e) };
        case (#Ok(_)) {
          let swapResult = await executeSwap(amount, minAmountOut);
          switch (swapResult) {
            case (#Err(e)) { return #Err(e) };
            case (#Ok(amountOut)) {
              let transferResult = await transferUSDC(recipient, amountOut);
              switch (transferResult) {
                case (#Err(e)) { return #Err(e) };
                case (#Ok(_)) {
                  #Ok({
                    swapAmount = Nat64.toNat(amount);
                    usdcReceived = amountOut;
                  });
                };
              };
            };
          };
        };
      };
    } catch (e) {
      #Err("Unexpected error in borrowWithSwap: " # Error.message(e));
    };
  };

};
